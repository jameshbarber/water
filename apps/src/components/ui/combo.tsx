"use client"

import { Button } from "./button"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Check, ChevronsUpDown } from "lucide-react"

type Option = { label: string; value: string }

export function Combo({
  value,
  onChange,
  options,
  placeholder,
  className,
}: {
  value?: string
  onChange: (v: string) => void
  options: Option[]
  placeholder?: string
  className?: string
}) {
  const selected = options.find((o) => o.value === value)?.label
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={`w-full justify-between ${className ?? ""}`}
          type="button"
        >
          {selected ?? placeholder ?? "Select"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1">
        <div className="grid gap-1">
          {options.map((opt) => (
            <button
              key={opt.value}
              className="flex items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
              onClick={() => onChange(opt.value)}
              type="button"
            >
              {opt.label}
              <Check className={`${opt.value === value ? "opacity-100" : "opacity-0"}`} />
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}


