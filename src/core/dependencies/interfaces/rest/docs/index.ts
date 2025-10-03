import type { Route } from "@/core/dependencies/interfaces/rest";
import Module from "@/core/modules";

interface DocumentGenerator {
    generate(routes: Route[]): any;
    registerModule(module: Module<any>): void;
}


export { DocumentGenerator };