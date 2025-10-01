import { eventBus } from "../events";

eventBus.on("test", (data) => {
    console.log(data);
});

export default {
    eventBus,
}