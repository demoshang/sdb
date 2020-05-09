import { isPlainObject, cloneDeep } from 'lodash';

import { getSchema } from '../get-schema';
import { formatQuery } from './format-query';
import { formatSet } from './format-set';

/* eslint-disable no-param-reassign */

function formatUpdate(
  compiledSchema: object,
  doc: { [key: string]: any },
  schemaPath = '',
  parentKey?: string,
  opts = {}
) {
  // update operators will not check `default` & `required`
  opts = {
    required: false,
    default: false,
    ...opts,
  };

  if (isPlainObject(doc)) {
    Object.entries(doc).forEach(([key, subDoc]) => {
      const isOperator = /^\$/.test(key);
      const subSchemaPath = isOperator ? schemaPath : `${schemaPath ? `${schemaPath}.` : ''}${key}`;

      if (!isOperator) {
        doc[key] = formatUpdate(compiledSchema, subDoc, subSchemaPath, key, opts);
        return;
      }

      if (key === '$set') {
        const schema = getSchema(compiledSchema, subSchemaPath);
        doc[key] = formatSet(schema, subDoc);
      } else if (['$min', '$max', '$unset', '$pop', '$slice'].includes(key)) {
        // do nothing
      } else {
        switch (key) {
          case '$addToSet':
            doc[key] = formatUpdate(compiledSchema, subDoc, subSchemaPath, key, {
              ignoreNodeType: true,
            });
            break;
          case '$each':
          case '$push':
          case '$inc':
            doc[key] = formatUpdate(compiledSchema, subDoc, subSchemaPath, key);
            break;
          case '$pull': {
            const schema = getSchema(compiledSchema, subSchemaPath);
            doc[key] = formatQuery(schema, subDoc);
            break;
          }
          default:
            throw new TypeError(`${key} not support`);
        }
      }
    });
  } else {
    const schema = getSchema(compiledSchema, schemaPath);
    if (Array.isArray(doc)) {
      const result = schema.validate(doc, opts);
      if (!result.valid) {
        throw result.error;
      }
      doc = result.result;
    } else {
      if (!parentKey) {
        throw new TypeError(`no parentKey found, ${schemaPath}`);
      }

      // eg: 'posts.comments' -> 'comments'
      const key = parentKey.split('.').slice(-1)[0];
      const result = schema._parent.validate(
        { [key]: doc },
        {
          ignoreNodeType: true,
          ...opts,
        }
      );
      if (!result.valid) {
        throw result.error;
      }
      doc = result.result[key];
    }
  }
  return doc;
}

function updateAppendSet(compiledSchema: object, doc: { [key: string]: any }) {
  const hasOperator = Object.keys(doc).find((key) => {
    return /^\$/.test(key);
  });

  if (!hasOperator) {
    const obj = cloneDeep(doc);
    Object.keys(doc).forEach((key) => {
      delete doc[key];
    });
    doc.$set = obj;
  }

  return formatUpdate(compiledSchema, doc);
}

export { updateAppendSet as formatUpdate };
