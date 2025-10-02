interface RouteInterface {
    summary: string;
    description: string;
    path: string;
    method: "get" | "post" | "put" | "delete" | "options" | "head" | "patch" | "trace";
    handler: (req: any, res: any) => Promise<void>;
}


export interface RouterAdapter {
    use(path: string, method: string, handler: (req: any, res: any) => Promise<void>): void;
}

export { RouteInterface };