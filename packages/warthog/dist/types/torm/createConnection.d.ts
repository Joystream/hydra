import { ConnectionOptions } from 'typeorm';
import { SnakeNamingStrategy } from './SnakeNamingStrategy';
export declare function getBaseConfig(): {
    cli: {
        entitiesDir: string | undefined;
        migrationsDir: string | undefined;
        subscribersDir: string | undefined;
    };
    database: string;
    entities: string[];
    host: string;
    logger: string | undefined;
    logging: string;
    migrations: string[];
    namingStrategy: SnakeNamingStrategy;
    password: string | undefined;
    port: number;
    subscribers: string[];
    synchronize: boolean;
    type: string;
    username: string | undefined;
};
export declare const createDBConnection: (dbOptions?: Partial<ConnectionOptions>) => Promise<import("typeorm").Connection>;
