import { isPlainObject, reduce } from 'lodash';

import { arrayFormatOperators, singleFormatOperators } from '../constants';
import { getSchema } from '../get-schema';

function formatQuery(compiledSchema: object, query: any, schemaPath = '', parentKey?: string) {
  /* eslint-disable no-param-reassign */

  // 递归检查属性
  if (isPlainObject(query)) {
    Object.entries(query).forEach(([key, subQuery]: [string, any]) => {
      const isOperator = /^\$/.test(key);
      const subSchemaPath = isOperator ? schemaPath : `${schemaPath ? `${schemaPath}.` : ''}${key}`;

      if (!isOperator) {
        query[key] = formatQuery(compiledSchema, subQuery, subSchemaPath, key);
      } else if (singleFormatOperators.includes(key)) {
        query[key] = formatQuery(compiledSchema, subQuery, subSchemaPath, parentKey);
      } else if (arrayFormatOperators.includes(key)) {
        if (!Array.isArray(subQuery)) {
          throw new TypeError(
            `operator ${key} need array value, but got ${JSON.stringify(subQuery)}`
          );
        }

        query[key] = subQuery.map((subQueryItem) => {
          return formatQuery(compiledSchema, subQueryItem, subSchemaPath, parentKey);
        });
      } else {
        // do nothing
      }
    });

    return query;
  }

  if (!parentKey) {
    return query;
  }

  // schema格式化当前值
  const schema = getSchema(compiledSchema, schemaPath);
  if (!schema || !schema._leaf) {
    return query;
  }

  const opts = reduce(
    schema._children,
    (result, _value, key) => {
      result[key] = false;
      return result;
    },
    {
      additionalProperties: true,
      ignoreNodeType: true,
      required: false,
      default: false,
    } as any
  );
  // try format, if false then pass
  if (Array.isArray(query)) {
    return schema.validate(query, opts).result;
  }
  // eg: 'posts.comments' -> 'comments'
  const key = parentKey.split('.').slice(-1)[0];
  return schema._parent.validate({ [key]: query }, opts).result[key];
}

export { formatQuery };
