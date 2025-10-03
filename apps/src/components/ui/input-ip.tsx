"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "./input"
import { validateIPAddress } from "@/lib/utils"
const FormSchema = z.object({
  ip: z
    .ipv4({ message: "Please enter a valid IPv4 address." }),
})

export function InputIPForm({ onSubmit, value }: { onSubmit: (data: z.infer<typeof FormSchema>) => Promise<void>, value?: string }) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      ip: value ?? "",
    }
  })

  async function handleSubmit(data: z.infer<typeof FormSchema>) {
    const isValid = validateIPAddress(data.ip)
    if (isValid) {
      await onSubmit(data)
    } else {
      toast("Please enter a valid IP address")
    }
    toast("You submitted the following values")
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="ip"
          render={({ field }) => (
            <FormItem>
              <FormLabel>IP Address</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="192.168.0.1"
                  pattern="[0-9.]*"
                  maxLength={15}
                  value={field.value}
                  onChange={(e) => {
                    const sanitized = e.target.value.replace(/[^0-9.]/g, "")
                    field.onChange(sanitized)
                  }}
                  onPaste={(e) => {
                    const text = e.clipboardData.getData("text")
                    const sanitized = text.replace(/[^0-9.]/g, "")
                    e.preventDefault()
                    field.onChange(sanitized)
                  }}
                />
              </FormControl>
              <FormDescription>
                Please enter the IP address in the format xxx.xxx.xxx.xxx
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
