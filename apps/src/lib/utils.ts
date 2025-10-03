import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

const ipv4Regex = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function validateIPAddress(ip: string) {
  return ipv4Regex.test(ip)
}