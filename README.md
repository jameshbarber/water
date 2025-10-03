# "Water" Hub
Water makes it effortless to facilitate the control of & collection of readings from various iOT devices over local network via a Raspberry Pi-based hub running this software. It supports multiple device control protocols (GPIO, HTTPS, MQTT) and multiple interfaces (Typed SDK, API, MCP).

## Features
- Batched reading transactions to any data store of your choice
- Multiple control protocols supported (GPIO, HTTPS, MQTT) and fully extendable to e.g Serial etc.
- Effortless control & access via multiple interfaces (Typed SDK, API, MCP)
- Issue commands on certain values with sensor triggers
- Run commands on cron schedules with Command Schedules

## Interfaces
- Typed API accessible over local network
- MCP Server accessible over local network
- Tools SDK (?)

## Code Architecture 
This codebase works with the concept of an `App` which is initialised using a `manifest.ts` file containing JSON specs. `Modules` are core CRUD entities, stored in a `Store` of your choice. 

## Storage
You can store data in pretty much any form using the adapter pattern, and customise this per module. Built in support for local storage in the form of JSON & CSV files, as well as remote storage in the form of POSTGRES and TimescaleDB. To implement a custom storage scheme, simply implement the `DatabaseAdapter` interface. 

## Driver
You can use pretty much any protocol to integrate devices such as sensors and actuators. Out-the-box support for MQTT, GPIO (via polling) & HTTP. To implement a custom driver, such as Serial, extend the `DriverAdapter` interface

## Interfaces
You can access the hub over pretty much any interface. Out-the-box support for REST & MCP servers, as well as a typed API client. To add a custom interface, such as GraphQL, extend the `InterfaceAdapter` type.

# Stack
- NodeJS + Typescript
- Jest
- Express
- OpenAPI Typescript


# Understanding this project
- `src` contains all application code
    - `adapters` contains implementations of dependencies, e.g `JSONDatabaseAdapter` for local JSON storage
        - `database` contains storage adapters, JSON+CSV by default.
        - `drivers` contains communication protocol drivers, MQTT+HTTPS by default
        - `logging` contains logger implementations, NOOP and console by default.
        - `rest` contains an express server implementation of a rest interface
        - `schema` contains `SchemaProvider` implementations, which depend on the database adapter used.
    - `core` contains the interfaces & base classes that you can extend or implement to create adapter instances
        - `dependencies`
        - `error`
        - `modules` base module with CRUD & event emittence, to be extended if needed
    - `modules` contains business logic for relevant zod-schema driven modules. Basic CRUD operations are supported by default via the database adapter. 
    - `subscribers` contains all listeners for the event bus events
    - `test` contains all testing mocks
    - `deps` contains code to configure and inject dependencies
    - `index.ts` creates the app instance
    - `manifest.ts` contains the app manifest, and wires in the module schemas. 

