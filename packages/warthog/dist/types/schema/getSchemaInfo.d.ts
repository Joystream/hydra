import { IntrospectionObjectType, IntrospectionSchema } from 'graphql';
import { BuildSchemaOptions } from 'type-graphql';
export declare function getSchemaInfo(options: BuildSchemaOptions): Promise<{
    mutationType: IntrospectionObjectType | undefined;
    queryType: IntrospectionObjectType;
    schema: import("graphql").GraphQLSchema;
    schemaIntrospection: IntrospectionSchema;
    subscriptionType: IntrospectionObjectType | undefined;
}>;
