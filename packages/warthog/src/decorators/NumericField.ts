import { ColumnNumericOptions } from 'typeorm/decorator/options/ColumnNumericOptions';
import { ColumnCommonOptions } from 'typeorm/decorator/options/ColumnCommonOptions';

import { DecoratorCommonOptions } from '../metadata';
import { composeMethodDecorators } from '../utils';
import { NumericColumnType, NumericWhereOperator } from '../torm';
import { GraphQLBigNumber } from '../tgql/GraphQLBigNumber';

import { getCombinedDecorator } from './getCombinedDecorator';

interface NumericFieldOptions
  extends ColumnCommonOptions,
    ColumnNumericOptions,
    DecoratorCommonOptions {
  dataType?: NumericColumnType;
  filter?: boolean | NumericWhereOperator[];
}

export function NumericField(options: NumericFieldOptions = {}): any {
  const { dataType, filter, sort, ...dbOptions } = options;
  const nullableOption = options.nullable === true ? { nullable: true } : {};

  const factories = getCombinedDecorator({
    fieldType: 'numeric',
    warthogColumnMeta: options,
    gqlFieldType: GraphQLBigNumber,
    dbType: options.dataType ?? 'numeric',
    dbColumnOptions: { ...nullableOption, ...dbOptions },
  });

  return composeMethodDecorators(...factories);
}
