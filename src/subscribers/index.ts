import { eventBus } from "@/config";

eventBus.on("test", (data) => {
    console.log(data);
});

export default {
    eventBus,
}