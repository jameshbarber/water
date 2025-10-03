interface Route {
    summary: string;
    description: string;
    path: string;
    method: "get" | "post" | "put" | "delete" | "options" | "head" | "patch" | "trace";
    handler: (req: any, res: any) => Promise<void>;
    inputSchemas?: {
        params?: Record<string, any>;
        query?: Record<string, any>;
        body?: Record<string, any>;
    };
}


export interface RouterAdapter {
    use(path: string, method: string, handler: (req: any, res: any) => Promise<void>): void;
}

export { Route };