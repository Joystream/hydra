declare type MethodDecorator = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => any;
export declare function debug(key: string): MethodDecorator;
export {};
