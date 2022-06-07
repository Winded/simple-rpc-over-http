"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processRequest = void 0;
const simple_rpc_over_http_shared_lib_1 = require("simple-rpc-over-http-shared-lib");
;
async function handleRpc(request, config) {
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
        return {
            details: response
        };
    }
    catch (error) {
        return {
            error: error
        };
    }
}
function processRequest(req, res, config, responseMetadata) {
    var _a;
    const errorHook = (_a = config.errorHook) !== null && _a !== void 0 ? _a : (error => console.error(error));
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method == 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    else if (req.method != 'POST') {
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
        var _a;
        let request;
        try {
            request = JSON.parse(body);
            if (!(0, simple_rpc_over_http_shared_lib_1.validateRequest)(request)) {
                throw 'Invalid request body';
            }
        }
        catch (error) {
            errorHook(error);
            res.writeHead(405);
            res.end();
            return;
        }
        const response = await handleRpc(request, config);
        if ('error' in response) {
            const errorCode = (_a = responseMetadata === null || responseMetadata === void 0 ? void 0 : responseMetadata.statusCode) !== null && _a !== void 0 ? _a : 500;
            if (errorCode >= 500) {
                errorHook(response.error);
                res.writeHead(errorCode);
                res.end();
            }
            else {
                res.writeHead(errorCode);
                res.end(JSON.stringify(response));
            }
        }
        else {
            res.writeHead(200);
            res.end(JSON.stringify(response));
        }
    });
}
exports.processRequest = processRequest;
