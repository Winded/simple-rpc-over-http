"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildService = void 0;
function performRequest(service, method, parameters) {
    return __awaiter(this, void 0, void 0, function* () {
        let session = undefined;
        if (service.sessionProvider) {
            session = service.sessionProvider();
        }
        let response = yield fetch(service.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                service: service.serviceName,
                method: method,
                parameters: parameters,
                session: session
            })
        });
        const jsonResponse = yield response.json();
        if (jsonResponse.error) {
            throw jsonResponse.error;
        }
        return jsonResponse.details;
    });
}
function buildService(config) {
    const instance = new Proxy({}, {
        get(_, name) {
            return (...parameters) => __awaiter(this, void 0, void 0, function* () {
                return yield performRequest(config, name.toString(), parameters);
            });
        }
    });
    return instance;
}
exports.buildService = buildService;
