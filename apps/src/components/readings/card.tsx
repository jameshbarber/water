"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Combo } from "../ui/combo"
import tempClient from "@/lib/client"
import { getItem } from "@/lib/storage"
import { Calendar } from "../ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { DateRange } from "react-day-picker"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"

type Reading = {
  id: string
  deviceId: string
  value: number
  timestamp: string
}

const bucketOptions = [
  { label: "Auto", value: "auto" },
  { label: "1m", value: "1m" },
  { label: "5m", value: "5m" },
  { label: "15m", value: "15m" },
  { label: "1h", value: "1h" },
  { label: "1d", value: "1d" },
]

const ReadingsCard = () => {
  const [bucket, setBucket] = useState("auto")
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(Date.now() - 3600_000),
    to: new Date(),
  })
  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, { month: "2-digit", day: "2-digit", year: "numeric" })
  const [deviceId, setDeviceId] = useState<string>("")
  const [readings, setReadings] = useState<Reading[]>([])
  const [loading, setLoading] = useState(false)

  const computeAutoBucket = (from: Date, to: Date) => {
    const ms = to.getTime() - from.getTime()
    const h = ms / 3600000
    if (h <= 2) return "1m"
    if (h <= 12) return "5m"
    if (h <= 48) return "15m"
    if (h <= 24 * 14) return "1h"
    return "1d"
  }

  const fetchReadings = async () => {
    const hubIP = getItem("hubIP")
    if (!hubIP) return
    setLoading(true)
    try {
      const res = await tempClient.GET(`http://${hubIP}:4000/readings`)
      const json = await res.json()
      const list = Array.isArray(json) ? json : json?.readings ?? []
      setReadings(list)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReadings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-fetch with debounce on changes
  useEffect(() => {
    const id = setTimeout(() => {
      fetchReadings()
    }, 400)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(range), bucket])

  const chartData = useMemo(() => {
    const mapped = readings.map((r) => ({
      t: new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      v: r.value,
    }))
    if (mapped.length === 1) {
      // Duplicate the single point with a slightly different label so the line renders
      const only = mapped[0]
      return [only, { t: `${only.t} `, v: only.v }]
    }
    return mapped
  }, [readings])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Readings</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="grid gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-col gap-1 w-40">
              <div className="text-xs text-muted-foreground">Bucket</div>
              <Combo value={bucket} onChange={setBucket} options={bucketOptions} />
            </div>

            <div className="flex flex-col gap-1">
              <div className="text-xs text-muted-foreground">Range</div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    data-empty={!range?.from || !range?.to}
                    className={cn(
                      "data-[empty=true]:text-muted-foreground w-[280px] justify-start text-left font-normal"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {range?.from && range?.to ? (
                      `${fmt(range.from)} – ${fmt(range.to)}`
                    ) : (
                      <span>Pick dates</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="range"
                    selected={range}
                    numberOfMonths={1}
                    captionLayout="dropdown"
                    onSelect={setRange}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="ml-auto text-xs text-muted-foreground">{loading ? "Loading…" : ""}</div>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { label: "Last 1h", ms: 60 * 60 * 1000 },
              { label: "6h", ms: 6 * 60 * 60 * 1000 },
              { label: "24h", ms: 24 * 60 * 60 * 1000 },
              { label: "7d", ms: 7 * 24 * 60 * 60 * 1000 },
            ].map((p) => (
              <Button
                key={p.label}
                variant="outline"
                size="sm"
                onClick={() => {
                  setRange({ from: new Date(Date.now() - p.ms), to: new Date() })
                  setBucket("auto")
                }}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-md border p-3">
          {chartData.length > 1 ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" className="text-muted-foreground" />
                  <XAxis dataKey="t" interval="preserveStartEnd" tickLine={false} axisLine={false} minTickGap={24} />
                  <YAxis width={40} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(v: any) => String(v)} labelClassName="text-xs" />
                  <Line type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No data</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default ReadingsCard


