"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateResponse = exports.validateRequest = void 0;
function validateRequest(request) {
    return ['service', 'method', 'parameters'].reduce((result, field) => result && field in request, true);
}
exports.validateRequest = validateRequest;
function validateResponse(response) {
    return true;
}
exports.validateResponse = validateResponse;
