#!/usr/bin/env tsx

/*
Simple helper to post device readings (temperature and humidity).

Usage examples:

pnpm exec tsx scripts/post-readings.ts \
  --url http://localhost:3000/api/readings \
  --device-id device-123 \
  --temp 22.5 \
  --humidity 48.2

Environment variables can also be used:
READINGS_URL, DEVICE_ID, TEMP_C, HUMIDITY
*/

type Args = {
  url: string;
  deviceId: string;
  temp: number;
  humidity: number;
};

function parseArgs(argv: string[]): Partial<Args> {
  const out: Partial<Args> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (!next) continue;
    switch (arg) {
      case "--url":
        out.url = next;
        i++;
        break;
      case "--device-id":
        out.deviceId = next;
        i++;
        break;
      case "--temp":
        out.temp = Number(next);
        i++;
        break;
      case "--humidity":
        out.humidity = Number(next);
        i++;
        break;
    }
  }
  return out;
}

async function main() {
  const cli = parseArgs(process.argv.slice(2));
  const url = cli.url || process.env.READINGS_URL;
  const deviceId = cli.deviceId || process.env.DEVICE_ID;
  const temp = cli.temp ?? (process.env.TEMP_C ? Number(process.env.TEMP_C) : undefined);
  const humidity = cli.humidity ?? (process.env.HUMIDITY ? Number(process.env.HUMIDITY) : undefined);

  if (!url) {
    console.error("Missing --url or READINGS_URL");
    process.exit(1);
  }
  if (!deviceId) {
    console.error("Missing --device-id or DEVICE_ID");
    process.exit(1);
  }
  if (typeof temp !== "number" || Number.isNaN(temp)) {
    console.error("Missing/invalid --temp or TEMP_C");
    process.exit(1);
  }
  if (typeof humidity !== "number" || Number.isNaN(humidity)) {
    console.error("Missing/invalid --humidity or HUMIDITY");
    process.exit(1);
  }

  const payload = {
    deviceId,
    metrics: {
      temperatureC: temp,
      humidityPercent: humidity,
    },
    timestamp: new Date().toISOString(),
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`Request failed: ${res.status} ${res.statusText}\n${text}`);
    process.exit(1);
  }

  const data = await res.json().catch(() => ({}));
  console.log("Posted reading:", JSON.stringify({ payload, response: data }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


