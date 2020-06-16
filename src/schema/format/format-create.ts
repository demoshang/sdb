// @ts-ignore
import AJS from 'another-json-schema';

function formatCreate(schema: any, doc: any, opts?: object) {
  if (schema instanceof AJS) {
    const result = schema.validate(doc, opts);
    if (!result.valid) {
      throw result.error;
    }
  }
  return doc;
}

export { formatCreate };
