import { Deps } from "@/deps";
import { ControlProtocol, ControlProtocolAddress } from "@/core/dependencies/drivers";

interface HttpAddress extends ControlProtocolAddress {
    url: string;
    method: "GET" | "POST";
    headers: Record<string, any>;
    body?: Record<string, any>;
}

export class HttpControlProtocol extends ControlProtocol {
    constructor(deps: Deps) {
        super(deps);
    }

    async read(address: HttpAddress): Promise<any> {
        return fetch(address.url, {
            method: address.method,
            headers: address.headers,
            body: JSON.stringify(address.body)
        }).then(res => res.json());
    }
    
    async write(address: HttpAddress, data: any): Promise<any> {
        return fetch(address.url, {
            method: address.method,
            headers: address.headers,
            body: JSON.stringify(data)
        }).then(res => res.json());
    }
}