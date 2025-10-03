import HubCard from "@/components/hub/card"
import ReadingsCard from "@/components/readings/card"

const HubPage = () => {

    return (
        <div className="flex flex-col items-center min-h-screen py-10 gap-6">
            <h1 className="text-4xl font-bold">Hub</h1>
            <div className="w-full max-w-2xl grid gap-6">
                <HubCard />
                <ReadingsCard />
            </div>
        </div>
    )
}

export default HubPage