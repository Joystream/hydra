import { IDType } from './types';
export declare abstract class BaseGraphQLObject {
    id: IDType;
    createdAt: Date;
    createdById?: IDType;
    updatedAt?: Date;
    updatedById?: IDType;
    deletedAt?: Date;
    deletedById?: IDType;
    version: number;
}
export declare abstract class BaseModel implements BaseGraphQLObject {
    id: IDType;
    createdAt: Date;
    createdById: IDType;
    updatedAt?: Date;
    updatedById?: IDType;
    deletedAt?: Date;
    deletedById?: IDType;
    version: number;
    getId(): string;
    getValue(field: any): any;
    setId(): void;
}
export declare abstract class BaseModelUUID implements BaseGraphQLObject {
    id: IDType;
    createdAt: Date;
    createdById: IDType;
    updatedAt?: Date;
    updatedById?: IDType;
    deletedAt?: Date;
    deletedById?: IDType;
    version: number;
}
