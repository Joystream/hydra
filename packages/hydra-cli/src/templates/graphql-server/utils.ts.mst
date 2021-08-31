import { ObjectLiteral } from 'typeorm';

export function mergeParameters(params: any[]): ObjectLiteral {
  return params
    .filter((p) => p !== undefined && p !== '')
    .reduce((acc, p, i) => {
      acc[`param${i}`] = p;
      return acc;
    }, {});
}

export function mergeParameterKeys(
  params: ObjectLiteral,
  keyPrefix: string,
  values: any[]
): ObjectLiteral {
  return values.reduce((acc, p, i) => {
    acc[`${keyPrefix}${i}`] = p;
    return acc;
  }, params);
}
