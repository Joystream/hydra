/// <reference types="node" />
import { ApolloServer, OptionsJson, ApolloServerExpressConfig } from 'apollo-server-express';
import { PubSubEngine, PubSubOptions } from 'graphql-subscriptions';
import { Request } from 'express';
import express = require('express');
import { GraphQLSchema } from 'graphql';
import { Binding } from 'graphql-binding';
import { Server as HttpServer } from 'http';
import { Server as HttpsServer } from 'https';
import { AuthChecker } from 'type-graphql';
import { Container } from 'typedi';
import { Connection, ConnectionOptions } from 'typeorm';
import { Logger } from '../core/logger';
import { Config } from './config';
import { BaseContext } from './Context';
export interface ServerOptions<T> {
    container?: Container;
    apolloConfig?: ApolloServerExpressConfig;
    authChecker?: AuthChecker<T>;
    autoGenerateFiles?: boolean;
    context?: (request: Request) => object;
    expressApp?: express.Application;
    host?: string;
    generatedFolder?: string;
    logger?: Logger;
    middlewares?: any[];
    pubSub?: PubSubEngine | PubSubOptions;
    openPlayground?: boolean;
    port?: string | number;
    resolversPath?: string[];
    warthogImportPath?: string;
    introspection?: boolean;
    bodyParserConfig?: OptionsJson;
    playgroundConfig?: {
        version?: string;
        cdnUrl?: string;
    };
    onBeforeGraphQLMiddleware?: (app: express.Application) => void;
    onAfterGraphQLMiddleware?: (app: express.Application) => void;
}
export declare class Server<C extends BaseContext> {
    private appOptions;
    private dbOptions;
    config: Config;
    apolloConfig?: ApolloServerExpressConfig;
    authChecker?: AuthChecker<C>;
    connection: Connection;
    container: Container;
    expressApp: express.Application;
    graphQLServer: ApolloServer;
    httpServer: HttpServer | HttpsServer;
    logger: Logger;
    schema?: GraphQLSchema;
    bodyParserConfig?: OptionsJson;
    constructor(appOptions: ServerOptions<C>, dbOptions?: Partial<ConnectionOptions>);
    getLogger(): Logger;
    establishDBConnection(): Promise<Connection>;
    getServerUrl(): string;
    getGraphQLServerUrl(): string;
    getBinding(options?: {
        origin?: string;
        token?: string;
    }): Promise<Binding>;
    buildGraphQLSchema(): Promise<GraphQLSchema>;
    generateFiles(): Promise<void>;
    private startHttpServer;
    start(): Promise<this>;
    stop(): Promise<void>;
}
export declare const App: typeof Server;
