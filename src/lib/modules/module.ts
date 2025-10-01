import { z } from "zod";
import { DatabaseAdapter } from "@/lib/database/adaptor";

type EndpointSchemas = {
    post?: z.ZodSchema;
    get?: z.ZodSchema;
    put?: z.ZodSchema;
    delete?: z.ZodSchema;
}

export default class Module {

    private dbSchema: DatabaseAdapter<any>;
    private name: string;
    private exposeEndpoints: boolean;
    private endpointSchemas?: EndpointSchemas;

    constructor(schema: any, name: string, exposeEndpoints: boolean, endpointSchemas?: EndpointSchemas) {
        this.dbSchema = schema;
        this.name = name;
        this.exposeEndpoints = exposeEndpoints;
        this.endpointSchemas = endpointSchemas;
    }

    findOne(id: string) {
        return this.dbSchema.findOne({
            where: {
                id: id
            }
        })
    }

    findMany(where: any) {
        return this.dbSchema.findMany({
            where: where
        })
    }

    create(data: any) {
        return this.dbSchema.create({
            data: data
        })
    }
    
    update(id: string, data: any) {
        return this.dbSchema.update({
            where: {
                id: id
            },
            data: data
        })
    }

    delete(id: string) {
        return this.dbSchema.delete({
            where: {
                id: id
            }
        })
    }
    
}