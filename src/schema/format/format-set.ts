import { isPlainObject } from 'lodash';

import { getSchema } from '../get-schema';

/* eslint-disable no-param-reassign */

function formatSet(
  compiledSchema: any,
  doc: any,
  schemaPath = '',
  parentKey?: string,
  subSchema = compiledSchema,
  schemaPrivilege: 'unset' | 'keep' | 'error' = 'unset'
) {
  if (isPlainObject(doc) && !subSchema._leaf) {
    Object.entries(doc).forEach(([key, subDoc]) => {
      const subSchemaPath = `${schemaPath ? `${schemaPath}.` : ''}${key}`;
      subSchema = getSchema(compiledSchema, subSchemaPath);
      doc[key] = formatSet(compiledSchema, subDoc, subSchemaPath, key, subSchema, schemaPrivilege);
    });
  } else {
    const schema = getSchema(compiledSchema, schemaPath);
    if (!schema) {
      if (schemaPrivilege === 'error') {
        throw new Error(`No schema found on path: $.${schemaPath}`);
      } else if (schemaPrivilege === 'keep') {
        return doc;
      }

      return undefined;
    }
    // only leaf & only check type & ignoreNodeType
    if (Array.isArray(doc)) {
      const result = schema.validate(doc);
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
          required: false,
          default: false,
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

export { formatSet };
