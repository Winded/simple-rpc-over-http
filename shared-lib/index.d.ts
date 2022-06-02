export interface Request {
    service: string;
    method: string;
    parameters: any[];
    session?: any;
}
export interface Response {
    error?: any;
    details?: any;
}
export declare function validateRequest(request: any): request is Request;
export declare function validateResponse(response: any): response is Response;
