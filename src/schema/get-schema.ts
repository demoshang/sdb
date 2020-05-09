import { get } from 'lodash';

function getSchema(schema: object, schemaPath: string) {
  // case:
  //   1. "posts"
  //   2. "posts.comments"
  //   3. "posts.0"
  //   4. "posts.0.comments"
  //   5. "posts.$[]"
  //   6. "posts.$[].comments"
  //   7. "posts.$[elem]"
  //   8. "posts.$[elem].comments"
  //   9. "posts.$"
  //   10. "posts.$.comments"
  return schemaPath
    ? get(
        schema,
        `_children.${schemaPath // 1 2
          .replace(/\.\d+/g, '') // 3 4
          .replace(/\.\$\[\w*\]/g, '') // 5 6 7 8
          .replace(/\.\$/g, '') // 9 10
          .split('.')
          .join('._children.')}`
      )
    : schema;
}

export { getSchema };
