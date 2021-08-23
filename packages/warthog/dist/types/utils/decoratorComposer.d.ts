import { ClassType } from '../core';
export declare type MethodDecoratorFactory = (target: object, propertyKey: string, descriptor: PropertyDescriptor) => any;
export declare function composeMethodDecorators(...factories: MethodDecoratorFactory[]): (target: object, propertyKey: string, descriptor: PropertyDescriptor) => any;
export declare type ClassDecoratorFactory = (target: ClassType) => any;
export declare function composeClassDecorators(...factories: any[]): (target: ClassType) => any;
