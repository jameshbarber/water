// TODO: Implement Express adapter

import { DocumentGenerator } from "@/core/dependencies/interfaces/rest";
import { OpenAPI3 } from "openapi-typescript";

export class ExpressDocumentGenerator extends DocumentGenerator {
    version: string;

    constructor(name: string, version: string) {
        super(name, version);
        this.version = version;
    }
    
    generate(): OpenAPI3 {
        return {
            openapi: "3.0.0",
            info: {
                title: this.name,
                version: this.version,
            },
        };
    }
}