export declare type SessionProvider = () => any;
export interface Config {
    url: string;
    serviceName: string;
    sessionProvider?: SessionProvider;
}
export declare function buildService<TInterface>(config: Config): TInterface;
