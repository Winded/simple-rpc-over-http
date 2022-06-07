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

export function validateRequest(request: any): request is Request {
    return ['service', 'method', 'parameters'].reduce<boolean>((result, field) => result && field in request, true);
}

export function validateResponse(response: any): response is Response {
    return true;
}
