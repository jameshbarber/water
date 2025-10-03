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


