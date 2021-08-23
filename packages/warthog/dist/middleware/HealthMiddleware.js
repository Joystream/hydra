"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheckMiddleware = void 0;
function healthCheckMiddleware(req, res) {
    res.send({ data: 'alive' });
    return Promise.resolve();
}
exports.healthCheckMiddleware = healthCheckMiddleware;
//# sourceMappingURL=HealthMiddleware.js.map