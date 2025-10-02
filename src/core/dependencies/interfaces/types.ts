import AppError from "@/core/error";

export class AppInterface {
    name: string;
    version: string;

    constructor(name: string, version: string) {
        this.name = name;
        this.version = version;
    }

    initialize() {
        throw new AppError("Not implemented");
    }
}