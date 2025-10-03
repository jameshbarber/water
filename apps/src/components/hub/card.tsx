'use client'
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { CardTitle } from "../ui/card";
import { getItem } from "@/lib/storage";
import tempClient from "@/lib/client";
import { Badge } from "../ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Switch } from "../ui/switch";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Combo } from "../ui/combo";

const InterfaceBadge = ({ interfaceName, config }: { interfaceName: string, config?: any }) => {

    const handleChange = async (e: any) => {
        const hubIP = getItem("hubIP")
        await tempClient.POST(`http://${hubIP}:4000/settings/interfaces/${interfaceName}`, {
            enabled: e
        })
    }
    return (
        <Popover>
            <PopoverTrigger>
                <Badge variant="secondary">
                    {config?.enabled && <div className="flex items-center gap-2 w-2 h-2 bg-green-500 rounded-full"></div>}
                    {!config?.enabled && <div className="flex items-center gap-2 w-2 h-2 bg-gray-500 rounded-full"></div>}
                    {interfaceName}
                </Badge>
            </PopoverTrigger>
            <PopoverContent>
                <Switch checked={config?.enabled} onCheckedChange={handleChange} />
                {config && Object.keys(config).map(k => {
                    return config[k].toString().length > 0 && <div key={k}>{k}: {config[k]}</div>
                })}
            </PopoverContent>
        </Popover>
    )
}

const HubCard = () => {
    const [data, setData] = useState<any>(null)
    const [devices, setDevices] = useState<any[]>([])
    const [triggers, setTriggers] = useState<any[]>([])
    const [adding, setAdding] = useState(false)

    const [image, setImage] = useState("")
    const [role, setRole] = useState("")
    const [driver, setDriver] = useState<"MQTT" | "HTTPS">("HTTPS")
    const [httpsBaseUrl, setHttpsBaseUrl] = useState("http://")
    const [mqttBrokerUrl, setMqttBrokerUrl] = useState("mqtt://localhost:1883")
    const [mqttTopic, setMqttTopic] = useState("waterpi/device")
    const [mqttClientId, setMqttClientId] = useState("")
    const [labelsJson, setLabelsJson] = useState("{}")
    const [triggerName, setTriggerName] = useState("")
    const [triggerType, setTriggerType] = useState<"cron" | "value">("cron")
    const [triggerCron, setTriggerCron] = useState("")
    const [triggerValue, setTriggerValue] = useState("")
    const [triggerOperation, setTriggerOperation] = useState(">" as ">" | "<" | "==" | "!=" | ">=" | "<=")
    const [triggerDeviceId, setTriggerDeviceId] = useState("")
    const [triggerCommandId, setTriggerCommandId] = useState("")
    useEffect(() => {
        const fetchData = async () => {
            const hubIP = getItem("hubIP")
            const c = await tempClient.GET(`http://${hubIP}:4000/manifest`)
            c.json().then((data) => {
                setData(data)
            })
            console.log(data)
        }
        fetchData()
    }, [])

    useEffect(() => {
        const fetchDevices = async () => {
            const hubIP = getItem("hubIP")
            if (!hubIP) return
            try {
                const res = await tempClient.GET(`http://${hubIP}:4000/devices`)
                const json = await res.json()
                setDevices(Array.isArray(json) ? json : json?.devices ?? [])
            } catch (e) {
                console.error(e)
            }
        }
        fetchDevices()
    }, [])

    useEffect(() => {
        const fetchTriggers = async () => {
            const hubIP = getItem("hubIP")
            if (!hubIP) return
            try {
                const res = await tempClient.GET(`http://${hubIP}:4000/triggers`)
                const json = await res.json()
                setTriggers(Array.isArray(json) ? json : json?.triggers ?? [])
            } catch (e) {
                console.error(e)
            }
        }
        fetchTriggers()
    }, [])

    const refreshDevices = async () => {
        const hubIP = getItem("hubIP")
        if (!hubIP) return
        try {
            const res = await tempClient.GET(`http://${hubIP}:4000/devices`)
            const json = await res.json()
            setDevices(Array.isArray(json) ? json : json?.devices ?? [])
        } catch (e) {
            console.error(e)
        }
    }

    const handleAddTrigger = async () => {
        try {
            const hubIP = getItem("hubIP")
            if (!hubIP) {
                toast("Set hub IP first")
                return
            }
            if (triggerType === "cron" && !triggerCron) {
                toast("Cron expression required")
                return
            }
            if (triggerType === "value" && !triggerValue) {
                toast("Value is required")
                return
            }
            const payload = {
                id: `${Date.now()}`,
                name: triggerName,
                event: "device",
                type: triggerType,
                cron: triggerType === "cron" ? triggerCron : undefined,
                value: triggerType === "value" ? triggerValue : undefined,
                operation: triggerOperation,
                deviceId: triggerDeviceId,
                commandId: triggerCommandId,
            }
            const res = await tempClient.POST(`http://${hubIP}:4000/triggers`, payload)
            if (!res.ok) {
                toast("Failed to add trigger")
                return
            }
            toast("Trigger added")
            setTriggerName("")
            setTriggerCron("")
            setTriggerValue("")
            setTriggerDeviceId("")
            setTriggerCommandId("")
            setTriggerType("cron")
            setTriggerOperation(">")
            await refreshTriggers()
        } catch (e) {
            console.error(e)
        }
    }

    const refreshTriggers = async () => {
        const hubIP = getItem("hubIP")
        if (!hubIP) return
        try {
            const res = await tempClient.GET(`http://${hubIP}:4000/triggers`)
            const json = await res.json()
            setTriggers(Array.isArray(json) ? json : json?.triggers ?? [])
        } catch (e) {
            console.error(e)
        }
    }

    const handleAddDevice = async () => {
        try {
            setAdding(true)
            const hubIP = getItem("hubIP")
            if (!hubIP) {
                toast("Set hub IP first")
                return
            }

            let address: any
            let labels: any = {}
            // Build address based on driver
            if (driver === "HTTPS") {
                if (!httpsBaseUrl || !/^https?:\/\//.test(httpsBaseUrl)) {
                    toast("Provide a valid HTTP(S) base URL")
                    return
                }
                address = { baseUrl: httpsBaseUrl }
            } else {
                if (!mqttBrokerUrl || !/^mqtts?:\/\//.test(mqttBrokerUrl)) {
                    toast("Provide a valid MQTT broker URL")
                    return
                }
                if (!mqttTopic) {
                    toast("Provide an MQTT topic")
                    return
                }
                address = { brokerUrl: mqttBrokerUrl, topic: mqttTopic }
                if (mqttClientId) address.clientId = mqttClientId
            }
            try {
                labels = labelsJson.trim() ? JSON.parse(labelsJson) : {}
            } catch (_e) {
                toast("Labels must be valid JSON")
                return
            }

            const payload = {
                image,
                role,
                driver,
                address,
                labels,
            }

            const res = await tempClient.POST(`http://${hubIP}:4000/devices`, payload)
            if (!res.ok) {
                toast("Failed to add device")
                return
            }
            toast("Device added")
            setImage("")
            setRole("")
            setDriver("HTTPS")
            setHttpsBaseUrl("http://")
            setMqttBrokerUrl("mqtt://localhost:1883")
            setMqttTopic("waterpi/device")
            setMqttClientId("")
            setLabelsJson("{}")
            await refreshDevices()
        } finally {
            setAdding(false)
        }
    }


    const d = data ? JSON.parse(data?.value) : null
    const name = d?.name
    const interfaces = d?.interfaces
    const rest = interfaces?.rest
    const mcp = interfaces?.mcp


    return (
        <Card>
            <CardHeader>
                <CardTitle>{name}</CardTitle>
            </CardHeader>
            <CardContent>
                <InterfaceBadge interfaceName="REST" config={rest} />
                <InterfaceBadge interfaceName="MCP" config={mcp} />

                <div className="h-px my-4 bg-border" />

                <div className="grid gap-2">
                    <div className="font-medium">Devices</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <button className="border border-dashed rounded-md p-4 text-sm text-muted-foreground hover:bg-accent flex items-center justify-center gap-2" type="button">
                                    <Plus className="w-4 h-4" /> Add device
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[520px] p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <Input
                                        placeholder="Image (paste image or URL)"
                                        value={image}
                                        onChange={(e) => setImage(e.target.value)}
                                        onPaste={async (e) => {
                                            const items = e.clipboardData?.items
                                            if (!items) return
                                            for (let i = 0; i < items.length; i++) {
                                                const it = items[i]
                                                if (it.kind === 'file' && it.type.startsWith('image/')) {
                                                    const file = it.getAsFile()
                                                    if (!file) continue
                                                    const reader = new FileReader()
                                                    reader.onload = () => {
                                                        const result = String(reader.result || '')
                                                        setImage(result)
                                                    }
                                                    reader.readAsDataURL(file)
                                                    e.preventDefault()
                                                    break
                                                }
                                            }
                                        }}
                                    />
                                    <div className="flex flex-col gap-1">
                                        <div className="text-xs text-muted-foreground">Role</div>
                                        <Combo value={role} onChange={setRole} options={[{ label: "sensor", value: "sensor" }, { label: "actuator", value: "actuator" }]} />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="text-xs text-muted-foreground">Driver</div>
                                        <Combo value={driver} onChange={(v) => setDriver(v as any)} options={[{ label: "HTTPS", value: "HTTPS" }, { label: "MQTT", value: "MQTT" }]} />
                                    </div>
                                    {driver === "HTTPS" && (
                                        <Input placeholder='HTTPS Base URL (e.g. http://192.168.0.10:8080)' value={httpsBaseUrl} onChange={(e) => setHttpsBaseUrl(e.target.value)} />
                                    )}
                                    {driver === "MQTT" && (
                                        <>
                                            <Input placeholder='MQTT Broker URL (e.g. mqtt://localhost:1883)' value={mqttBrokerUrl} onChange={(e) => setMqttBrokerUrl(e.target.value)} />
                                            <Input placeholder='MQTT Topic (e.g. waterpi/device)' value={mqttTopic} onChange={(e) => setMqttTopic(e.target.value)} />
                                            <Input placeholder='MQTT Client ID (optional)' value={mqttClientId} onChange={(e) => setMqttClientId(e.target.value)} />
                                        </>
                                    )}
                                    <Input placeholder='Labels JSON (e.g. {"zone":"front","type":"moisture"})' value={labelsJson} onChange={(e) => setLabelsJson(e.target.value)} />
                                </div>
                                <div className="flex justify-end mt-3">
                                    <Button disabled={adding} onClick={handleAddDevice}>Add device</Button>
                                </div>
                            </PopoverContent>
                        </Popover>

                        {devices?.length === 0 && <div className="text-muted-foreground text-sm border rounded-md p-4">No devices</div>}
                        {devices?.map((d: any) => (
                            <div key={d.id} className="border rounded-md p-2 text-sm grid gap-1">
                                <div className="flex items-center justify-between">
                                    <div className="font-mono text-xs">{d.id}</div>
                                    <Badge variant="secondary">{d.role}</Badge>
                                </div>
                                <div className="text-xs">Image: {d.image}</div>
                                <div className="text-xs">Driver: {d.driver}</div>
                                {d.address && <div className="text-xs">Address: {typeof d.address === 'string' ? d.address : JSON.stringify(d.address)}</div>}
                                {d.labels && Object.keys(d.labels).length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {Object.entries(d.labels).map(([k, v]: any) => (
                                            <Badge key={k} variant="outline">{k}:{String(v)}</Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="h-px my-4 bg-border" />

                <div className="grid gap-2">
                    <div className="font-medium">Triggers</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <button className="border border-dashed rounded-md p-4 text-sm text-muted-foreground hover:bg-accent flex items-center justify-center gap-2" type="button">
                                    <Plus className="w-4 h-4" /> Add trigger
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[520px] p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <Input placeholder="Name" value={triggerName} onChange={(e) => setTriggerName(e.target.value)} />
                                    <div className="flex flex-col gap-1">
                                        <div className="text-xs text-muted-foreground">Type</div>
                                        <Combo value={triggerType} onChange={(v) => setTriggerType(v as any)} options={[{ label: "cron", value: "cron" }, { label: "value", value: "value" }]} />
                                    </div>
                                    {triggerType === "cron" && (
                                        <Input placeholder="Cron expression" value={triggerCron} onChange={(e) => setTriggerCron(e.target.value)} />
                                    )}
                                    {triggerType === "value" && (
                                        <>
                                            <Input placeholder="Value" value={triggerValue} onChange={(e) => setTriggerValue(e.target.value)} />
                                            <div className="flex flex-col gap-1">
                                                <div className="text-xs text-muted-foreground">Operation</div>
                                                <Combo value={triggerOperation} onChange={(v) => setTriggerOperation(v as any)} options={[">","<","==","!=",">=","<="].map((op) => ({ label: op, value: op }))} />
                                            </div>
                                        </>
                                    )}
                                    <div className="flex flex-col gap-1">
                                        <div className="text-xs text-muted-foreground">Device</div>
                                        <Combo value={triggerDeviceId} onChange={setTriggerDeviceId} options={devices.map((d:any)=>({label:d.id, value:d.id}))} />
                                    </div>
                                    <Input placeholder="Command ID" value={triggerCommandId} onChange={(e) => setTriggerCommandId(e.target.value)} />
                                </div>
                                <div className="flex justify-end mt-3">
                                    <Button onClick={handleAddTrigger}>Add trigger</Button>
                                </div>
                            </PopoverContent>
                        </Popover>

                        {triggers?.length === 0 && <div className="text-muted-foreground text-sm border rounded-md p-4">No triggers</div>}
                        {triggers?.map((t: any) => (
                            <div key={t.id} className="border rounded-md p-2 text-sm grid gap-1">
                                <div className="flex items-center justify-between">
                                    <div className="font-mono text-xs">{t.id}</div>
                                    <Badge variant="secondary">{t.type}</Badge>
                                </div>
                                <div className="text-xs">Name: {t.name}</div>
                                <div className="text-xs">Device: {t.deviceId}</div>
                                <div className="text-xs">Command: {t.commandId}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default HubCard