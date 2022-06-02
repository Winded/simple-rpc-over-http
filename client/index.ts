import { Request, Response } from "simple-rpc-over-http-shared-lib";

export type SessionProvider = () => any;

export interface Config {
    url: string;
    serviceName: string;
    sessionProvider?: SessionProvider;
}

async function performRequest(service: Config, method: string, parameters: any[]): Promise<any> {
    let session: any = undefined;
    if (service.sessionProvider) {
        session = service.sessionProvider();
    }

    let response = await fetch(service.url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(<Request>{
            service: service.serviceName,
            method: method,
            parameters: parameters,
            session: session
        })
    });
    const jsonResponse: Response = await response.json();
    if (jsonResponse.error) {
        throw jsonResponse.error;
    }

    return jsonResponse.details;
}

export function buildService<TInterface>(config: Config): TInterface {
    const instance = new Proxy({}, {
        get(_, name) {
            return async (...parameters: any[]) => {
                return await performRequest(config, name.toString(), parameters);
            };
        }
    });
    return instance as TInterface;
}
