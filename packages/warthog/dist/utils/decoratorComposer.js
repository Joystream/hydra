"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.composeClassDecorators = exports.composeMethodDecorators = void 0;
function composeMethodDecorators() {
    var factories = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        factories[_i] = arguments[_i];
    }
    return function (target, propertyKey, descriptor) {
        factories.forEach(function (factory) { return factory(target, propertyKey, descriptor); });
    };
}
exports.composeMethodDecorators = composeMethodDecorators;
// any[] -> ClassDecoratorFactory[]
function composeClassDecorators() {
    var factories = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        factories[_i] = arguments[_i];
    }
    return function (target) {
        // Do NOT return anything here or it will take over the class it's decorating
        // See: https://www.typescriptlang.org/docs/handbook/decorators.html
        factories.forEach(function (factory) {
            return factory(target);
        });
    };
}
exports.composeClassDecorators = composeClassDecorators;
//# sourceMappingURL=decoratorComposer.js.map