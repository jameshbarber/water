/*
  Dumb Simulator Client (talks ONLY to your server @ http://localhost:4000)
  -----------------------------------------------------------------------
  You said: "i just wanna run a script and maybe even have a ui to control it from? 
  make all requests from the script to my server that i gave you the spec for."

  ✅ This script is a CLIENT that:
     - Registers devices & sensors on YOUR server via /devices
     - Sends commands via /commands/:id (PUT)
     - Pumps sensor readings to /readings (POST) every tick
     - (Optional) Adds triggers via /triggers (POST)
     - Provides a tiny local UI at http://localhost:5055 to click buttons & watch values 
       (the UI talks to THIS script, and THIS script proxies to YOUR server)

  No MQTT broker here. Pure HTTP based on your OpenAPI.

  Defaults
    SERVER_URL = http://localhost:4000   // your server (per spec you pasted)
    UI_PORT    = 5055                    // local control panel for you
    TICK_MS    = 1000                    // 1s physics interval

  Quick start
    npm i express body-parser cors
    npx tsx sim-client.ts        # or: npx ts-node sim-client.ts
    open http://localhost:5055

  What it does on boot
    1) Ensures these exist on your server (creates if missing):
       Devices: fan, light, water
       Sensors: temperature, humidity, soilMoisture, luminance
    2) Every second computes a very simple environment + noise and POSTs readings to /readings.
    3) The UI lets you toggle devices; we forward the command to PUT /commands/{id}.

  You can add more devices/sensors from the UI ("+ Add") and they will start participating.
*/

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { randomUUID } from 'node:crypto';

// Node 18+ has global fetch
const SERVER_URL = "http://192.168.1.50:4000";
const UI_PORT = 5055;
const TICK_MS = 1000;
const SELF_URL = process.env.SELF_URL || `http://localhost:${UI_PORT}`;

// --- Types ---

type DeviceValue = 0 | 1;

type Device = { id: string; type: 'device'; kind: string; value: DeviceValue };

type Sensor = { id: string; type: 'sensor'; kind: string; value: number };

type Entity = Device | Sensor;

interface Environment { temp: number; humidity: number; soil: number; lux: number }

// --- Local state (mirrors server) ---
const devices = new Map<string, Device>();
const sensors = new Map<string, Sensor>();
// map friendly local names -> server UUIDs
const nameToDeviceId = new Map<string, string>();
let env: Environment = { temp: 24, humidity: 45, soil: 40, lux: 50 };

// Physics recipes for known kinds (rudimentary, summed while device ON)
const recipes: Record<string, Partial<Environment> & { mixAmbientTemp?: number }> = {
  fan:        { temp: -0.2, humidity: -0.05, mixAmbientTemp: 0.02 },
  light:      { lux: +120, temp: +0.15 },
  water:      { soil: +2.5, humidity: +0.15 },
  heater:     { temp: +0.35 },
  cooler:     { temp: -0.35 },
  humidifier: { humidity: +0.25 },
  dehumidifier: { humidity: -0.25 },
};

const ambient = { temp: 24, humidity: 45, lux: 50 };
const drift =   { temp: 0.01, humidity: 0.005, lux: 0.1, soil: 0.0005 };

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const rnd = (sigma = 0.05) => (Math.random() * 2 - 1) * sigma;

// --- Helpers talking to YOUR server ---
async function serverFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${SERVER_URL}${path}`, init);
  if (!res.ok) throw new Error(`${init?.method || 'GET'} ${path} → ${res.status}`);
  // some endpoints may return empty; try json, fallback to undefined
  try { return await res.json(); } catch { return undefined; }
}

async function ensureEntity(e: Entity) {
  const id = nameToDeviceId.get(e.id) ?? randomUUID();
  nameToDeviceId.set(e.id, id);
  const body = {
    id,                      // uuid required by server
    image: e.kind,           // arbitrary string OK
    role: e.type,            // 'device' | 'sensor'
    driver: e.kind,          // arbitrary string OK
    address: {},             // object required
    destination: SELF_URL,   // this temp script server base URL
  };
  try {
    await serverFetch(`/devices`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch (err: any) {
    if (!String(err.message).includes('409')) console.log('ensureEntity warn:', err.message);
  }
}

async function putCommand(id: string, value: DeviceValue) {
  const deviceId = nameToDeviceId.get(id) || id;
  await serverFetch(`/commands/${encodeURIComponent(deviceId)}`, {
    method: 'PUT', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ command: value ? 'on' : 'off' })
  });
  // Update local mirror
  const d = devices.get(id); if (d) d.value = value;
}

async function postReading(id: string, value: number) {
  const deviceId = nameToDeviceId.get(id) || id;
  await serverFetch(`/readings`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ deviceId: String(deviceId), value: +value, timestamp: new Date().toISOString() })
  });
  const s = sensors.get(id); if (s) s.value = value;
}

// --- Boot ---
async function bootstrap() {
  // Default kit
  const defaults: Entity[] = [
    { id: 'fan', type: 'device', kind: 'fan', value: 0 },
    { id: 'light', type: 'device', kind: 'light', value: 0 },
    { id: 'water', type: 'device', kind: 'water', value: 0 },
    { id: 'temperature', type: 'sensor', kind: 'temperature', value: env.temp },
    { id: 'humidity', type: 'sensor', kind: 'humidity', value: env.humidity },
    { id: 'soilMoisture', type: 'sensor', kind: 'soilMoisture', value: env.soil },
    { id: 'luminance', type: 'sensor', kind: 'luminance', value: env.lux },
  ];

  for (const e of defaults) await ensureEntity(e);

  // Mirror local state
  for (const e of defaults) {
    if (e.type === 'device') devices.set(e.id, e as Device);
    else sensors.set(e.id, e as Sensor);
  }
}

// --- Physics tick (local), then POST readings to your server ---
function naturalDrift(dt: number) {
  env.temp += (ambient.temp - env.temp) * drift.temp * dt;
  env.humidity += (ambient.humidity - env.humidity) * drift.humidity * dt;
  env.lux += (ambient.lux - env.lux) * drift.lux * dt;
  env.soil += (0 - env.soil) * drift.soil * dt;
}

function deviceInfluences(dt: number) {
  for (const d of devices.values()) {
    if (d.value !== 1) continue;
    const r = recipes[d.kind];
    if (!r) continue;
    if (r.temp !== undefined) env.temp += (r.temp as number) * dt;
    if (r.humidity !== undefined) env.humidity += (r.humidity as number) * dt;
    if (r.soil !== undefined) env.soil += (r.soil as number) * dt;
    if (r.lux !== undefined) env.lux += (r.lux as number) * dt;
    if (r.mixAmbientTemp) env.temp += (ambient.temp - env.temp) * r.mixAmbientTemp * dt;
  }
}

function clampEnv() {
  env.temp = clamp(env.temp, 5, 45);
  env.humidity = clamp(env.humidity, 5, 100);
  env.lux = clamp(env.lux, 0, 50000);
  env.soil = clamp(env.soil, 0, 100);
}

async function pumpOnce(dt: number) {
  naturalDrift(dt);
  deviceInfluences(dt);
  clampEnv();

  // Project sensors + noise & POST
  for (const s of sensors.values()) {
    let val = s.value;
    switch (s.kind) {
      case 'temperature': val = +(env.temp + rnd()).toFixed(2); break;
      case 'humidity': val = +(env.humidity + rnd(0.2)).toFixed(2); break;
      case 'soilMoisture': val = +(env.soil + rnd(0.3)).toFixed(2); break;
      case 'luminance': val = +(env.lux + rnd(1.5)).toFixed(2); break;
      default: val = +(s.value + rnd(0.1)).toFixed(2); // unknown sensors wiggle
    }
    await postReading(s.id, val);
  }
}

// --- Tiny UI (served by THIS script) ---
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Static HTML UI
app.get('/', (_req, res) => {
  res.setHeader('content-type', 'text/html');
  res.end(`<!doctype html>
  <html><head><meta charset="utf-8"/><title>Simulator Client</title>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <style>body{font-family:system-ui,Segoe UI,Arial;margin:24px;max-width:900px}
  .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px}
  .card{border:1px solid #ddd;border-radius:12px;padding:12px}
  .row{display:flex;align-items:center;gap:8px;justify-content:space-between}
  input[type=number]{width:100%}
  footer{margin-top:24px;color:#777}
  </style></head>
  <body>
    <h1>Simulator Client → ${SERVER_URL}</h1>
    <p>All requests go to <code>${SERVER_URL}</code>. This page only forwards.</p>

    <h2>Devices</h2>
    <div id="devices" class="grid"></div>

    <h2>Sensors</h2>
    <div id="sensors" class="grid"></div>

    <details><summary><b>Add</b> device/sensor</summary>
      <div class="grid">
        <div class="card">
          <div class="row"><b>New Device</b></div>
          <label>ID <input id="nd_id"/></label>
          <label>Kind <input id="nd_kind" placeholder="fan | light | water | heater..."/></label>
          <button onclick="addDevice()">+ Add Device</button>
        </div>
        <div class="card">
          <div class="row"><b>New Sensor</b></div>
          <label>ID <input id="ns_id"/></label>
          <label>Kind <input id="ns_kind" placeholder="temperature | humidity | soilMoisture | luminance"/></label>
          <button onclick="addSensor()">+ Add Sensor</button>
        </div>
      </div>
    </details>

    <footer>Tick: ${TICK_MS} ms • UI provided by sim-client.ts</footer>

    <script>
    async function api(path, opts){ const r = await fetch(path, opts); if(!r.ok) throw new Error(await r.text()); return r.json().catch(()=>({})); }
    async function refresh(){ const s = await api('/_state');
      const dEl = document.getElementById('devices'); dEl.innerHTML='';
      s.devices.forEach(d=>{
        const card = document.createElement('div'); card.className='card';
        card.innerHTML = '<div class="row"><b>'+d.id+'</b><small>'+d.kind+'</small></div>'+
          '<div class="row"><label>ON <input type="checkbox" '+(d.value?'checked':'')+' onchange="toggle(\''+d.id+'\',this.checked)"></label></div>';
        dEl.appendChild(card);
      });
      const sEl = document.getElementById('sensors'); sEl.innerHTML='';
      s.sensors.forEach(x=>{
        const card = document.createElement('div'); card.className='card';
        card.innerHTML = '<div class="row"><b>'+x.id+'</b><small>'+x.kind+'</small></div>'+ 
          '<div class="row"><span>value</span><b>'+x.value+'</b></div>';
        sEl.appendChild(card);
      });
    }
    async function toggle(id, on){ await api('/ui/command', {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({id,value:on?1:0})}); refresh(); }

    async function addDevice(){ const id=document.getElementById('nd_id').value.trim(); const kind=document.getElementById('nd_kind').value.trim()||'fan'; if(!id) return; await api('/ui/add-device',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id,kind})}); refresh(); }
    async function addSensor(){ const id=document.getElementById('ns_id').value.trim(); const kind=document.getElementById('ns_kind').value.trim()||'temperature'; if(!id) return; await api('/ui/add-sensor',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id,kind})}); refresh(); }

    refresh(); setInterval(refresh, 1500);
    </script>
  </body></html>`);
});

// UI helpers (the UI calls THESE, and we forward to YOUR server)
app.get('/_state', (_req, res) => {
  res.json({
    devices: Array.from(devices.values()),
    sensors: Array.from(sensors.values()),
    env,
    server: SERVER_URL,
  });
});

app.post('/ui/command', async (req, res) => {
  try {
    const { id, value } = req.body || {};
    await putCommand(String(id), value ? 1 : 0);
    res.json({ ok: true });
  } catch (e:any) { res.status(400).json({ error: e.message }); }
});

app.post('/ui/add-device', async (req, res) => {
  const { id, kind } = req.body || {};
  if (!id) return res.status(400).json({ error: 'id required' });
  const dev: Device = { id, type: 'device', kind: String(kind||'fan'), value: 0 };
  try { await ensureEntity(dev); devices.set(dev.id, dev); return res.json(dev); }
  catch(e:any){ return res.status(400).json({ error: e.message }); }
});

app.post('/ui/add-sensor', async (req, res) => {
  const { id, kind } = req.body || {};
  if (!id) return res.status(400).json({ error: 'id required' });
  const sen: Sensor = { id, type: 'sensor', kind: String(kind||'temperature'), value: 0 };
  try { await ensureEntity(sen); sensors.set(sen.id, sen); return res.json(sen); }
  catch(e:any){ return res.status(400).json({ error: e.message }); }
});

// --- Start ---
(async () => {
  await bootstrap();
  app.listen(UI_PORT, () => console.log(`[UI] http://localhost:${UI_PORT} → server ${SERVER_URL}`));
  let last = Date.now();
  setInterval(() => {
    const now = Date.now();
    const dt = Math.max(1, Math.round((now - last)/1000));
    last = now;
    pumpOnce(dt).catch(err => console.error('pump error', err.message));
  }, TICK_MS);
})();
