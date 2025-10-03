"use client"
import { getItem, setItem } from "@/lib/storage"
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { CardContent } from "../ui/card"
import { InputIPForm } from "../ui/input-ip"
import { z } from "zod"
import { useEffect, useState } from "react"
import tempClient from "@/lib/client"

const FormSchema = z.object({
    ip: z.ipv4({ message: "Please enter a valid IPv4 address." }),
})



const ConfigureHubCard = ({ hubIP }: { hubIP?: string }) => {

    const [data, setData] = useState<any>(null)
    const handleSubmit = async (data: z.infer<typeof FormSchema>) => {
        await setItem("hubIP", data.ip)
    }
    console.log(data)
    useEffect(() => {
        const fetchData = async () => {
            const hubIP = getItem("hubIP")
            const c = await tempClient.GET(`http://${hubIP}/settings`)
            c.json().then((data) => {
                setData(data)
            })
            console.log(data)
        }
        fetchData()
    }, [])
    return (
        <Card>
            <CardHeader>
                <CardTitle>Add Hub</CardTitle>
                <CardDescription>Let's get you connected to your hub</CardDescription>
            </CardHeader>
            <CardContent>
                {JSON.stringify(data)}
                <InputIPForm value={hubIP} onSubmit={handleSubmit} />
            </CardContent>
        </Card>
    )
}

export default ConfigureHubCard