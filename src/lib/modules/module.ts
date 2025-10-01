import { z } from "zod";


type EndpointSchemas = {
    post?: z.ZodSchema;
    get?: z.ZodSchema;
    put?: z.ZodSchema;
    delete?: z.ZodSchema;
}

export default class Module {

    private dbSchema: any;
    private name: string;
    private exposeEndpoints: boolean;
    private endpointSchemas: EndpointSchemas;

    constructor(schema: any, name: string, exposeEndpoints: boolean, endpointSchemas: EndpointSchemas) {
        this.dbSchema = schema;
        this.name = name;
        this.exposeEndpoints = exposeEndpoints;
        this.endpointSchemas = endpointSchemas;
    }

    createEndpoints() {
        const endpoints = [];

        return endpoints;
    }
    
}