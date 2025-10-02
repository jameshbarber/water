import readings from "@/modules/readings";


const modules = {
    "readings": readings,
}

const manifest = {
    "name": "water",
    "version": "1.0.0",
    "dependencies": {
        "db": "json",
        "schema": "zod",
        "events": "simple"
    },
    "modules": modules
    // "modules": {
    //     "readings": {
    //         "store": "json",
    //         "schema": "zod"
    //     },
    //     "settings": {
    //         "store": "json",
    //         "schema": "zod"
    //     },
    //     "sensors": {
    //         "store": "json",
    //         "schema": "zod"
    //     },
    //     "actuators": {
    //         "store": "json",
    //         "schema": "zod"
    //     },
    //     "alerts": {
    //         "store": "json",
    //         "schema": "zod"
    //     },
    //     "tokens": {
    //         "store": "json",
    //         "schema": "zod"
    //     }
    // }
}

export default manifest;