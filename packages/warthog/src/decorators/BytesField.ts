import { ColumnNumericOptions } from 'typeorm/decorator/options/ColumnNumericOptions';
import { ColumnCommonOptions } from 'typeorm/decorator/options/ColumnCommonOptions';

import { DecoratorCommonOptions } from '../metadata';
import { composeMethodDecorators } from '../utils';
import { ByteaColumnType, StringWhereOperator } from '../torm';
import { Bytes } from '../tgql';

import { getCombinedDecorator } from './getCombinedDecorator';

interface BytesFieldOptions
  extends ColumnCommonOptions,
    ColumnNumericOptions,
    DecoratorCommonOptions {
  dataType?: ByteaColumnType;
  filter?: boolean | StringWhereOperator[];
}

export function BytesField(options: BytesFieldOptions = {}): any {
  const { dataType, filter, sort, ...dbOptions } = options;
  const nullableOption = options.nullable === true ? { nullable: true } : {};

  const factories = getCombinedDecorator({
    fieldType: 'bytea',
    warthogColumnMeta: options,
    gqlFieldType: Bytes,
    dbType: 'bytea',
    dbColumnOptions: { ...nullableOption, ...dbOptions },
  });

  return composeMethodDecorators(...factories);
}
