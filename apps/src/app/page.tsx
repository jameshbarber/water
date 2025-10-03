import DevicesList from "@/components/devices/list";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-8">Welcome to Water</h1>
      <DevicesList /> 
    </div>
  )
}
