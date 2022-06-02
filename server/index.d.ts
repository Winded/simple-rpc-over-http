/// <reference types="node" />
import { IncomingMessage, ServerResponse } from 'http';
export declare type SessionHook = (session?: any) => Promise<void>;
export declare type ErrorHook = (error: any) => void;
export interface ServiceCollection {
    [service: string]: {
        [method: string]: any;
    };
}
export interface ResponseMetadata {
    statusCode?: number;
}
export interface Config {
    sessionHook?: SessionHook;
    errorHook?: ErrorHook;
    services: ServiceCollection;
}
export declare function processRequest(req: IncomingMessage, res: ServerResponse, config: Readonly<Config>, responseMetadata?: ResponseMetadata): void;
