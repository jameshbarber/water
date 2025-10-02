const manifest = {
    "name": "water",
    "version": "1.0.0",
    "interfaces": {
        "mcp": true, 
        "rest": true
    },
    "dependencies": {
        "db": "json",
        "schema": "zod",
        "events": "simple"
    },
    "modules": {
        "commands": {
            "store": "json",
            "schema": "zod"
        }, 
        "devices": {
            "store": "json",
            "schema": "zod"
        },
        "triggers": {
            "store": "json",
            "schema": "zod"
        }
    }
}

export default manifest;