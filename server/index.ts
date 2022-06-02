import { IncomingMessage, ServerResponse } from 'http';
import { Request, Response, validateRequest, validateResponse } from 'simple-rpc-over-http-shared-lib';

export type SessionHook = (session?: any) => Promise<void>;

export type ErrorHook = (error: any) => void;

export interface ServiceCollection {
    [service: string]: {[method: string]: any};
};

export interface ResponseMetadata {
    statusCode?: number;
}

export interface Config {
    sessionHook?: SessionHook;
    errorHook?: ErrorHook;
    services: ServiceCollection;
}

async function handleRpc(request: Readonly<Request>, config: Readonly<Config>): Promise<Readonly<Response>> {
    if (config.sessionHook) {
        await config.sessionHook(request.session);
    }

    if (!(request.service in config.services)) {
        return {
            error: {
                statusCode: 400,
                message: 'Invalid service'
            }
        };
    }

    const service = config.services[request.service];
    if (!(request.method in service)) {
        return {
            error: {
                statusCode: 400,
                message: 'Invalid method'
            }
        };
    }

    try {
        const response = await service[request.method](...request.parameters);
        if (!validateResponse(response)) {
            throw new Error('Invalid response format');
        }
        return {
            details: response
        };
    } catch(error) {
        return {
            error: error
        };
    }
}

export function processRequest(
        req: IncomingMessage, res: ServerResponse,
        config: Readonly<Config>, responseMetadata?: ResponseMetadata
    ): void {
    const errorHook = config.errorHook ?? (error => console.error(error));

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method == 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    } else if (req.method != 'POST') {
        res.writeHead(405);
        res.end();
        return;
    }

    req.on('error', error => {
        errorHook(error);
        if (!res.headersSent) {
            res.writeHead(500);
            res.end('Internal Server Error');
        }
    });

    let body = '';
    req.on('data', chunk => body += chunk);

    req.on('end', async () => {
        let request!: Request;
        try {
            request = JSON.parse(body);
            if (!validateRequest(request)) {
                throw 'Invalid request body';
            }
        } catch (error) {
            errorHook(error);
            res.writeHead(405);
            res.end();
            return;
        }

        const response = await handleRpc(request, config);

        if ('error' in response) {
            const errorCode = responseMetadata?.statusCode ?? 500;
            if (errorCode >= 500) {
                errorHook(response.error);
                res.writeHead(errorCode);
                res.end();
            } else {
                res.writeHead(errorCode);
                res.end(JSON.stringify(response));
            }
        } else {
            res.writeHead(200);
            res.end(JSON.stringify(response));
        }
    });
}
