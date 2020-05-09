/* eslint-disable no-undef */
import AJS from 'another-json-schema';

import { formatCreate } from './format/format-create';
import { formatQuery } from './format/format-query';
import { formatUpdate } from './format/format-update';

const { Types } = AJS;

interface SchemaType {
  type:
    | 'string'
    | 'number'
    | 'boolean'
    | typeof Types.ObjectId
    | typeof Types.String
    | typeof Types.Number
    | typeof Types.Date
    | typeof Types.Buffer
    | typeof Types.Boolean
    | typeof Types.Mixed;
}

type SchemaEq = { eq?: boolean } | { equal?: boolean };

export type SchemaItem = (SchemaType & SchemaEq) & { gt?: number } & { gte?: number } & {
  t?: number;
} & {
  te?: number;
} & { range?: [number, number] } & { enum?: any[] } & { pattern?: RegExp } & { default?: any } & {
  required?: boolean;
} & { [key: string]: string };

export interface SchemaJson {
  [key: string]: SchemaItem;
}

class Schema extends AJS {
  constructor(name: string, schema: object) {
    super(name, { _id: { type: Types.ObjectId }, ...schema });
  }

  public static globalPlugins(schema: object) {
    return {
      beforeCountDocuments(...args: any[]) {
        formatQuery(schema, args[0]);
      },
      beforeDeleteMany(...args: any[]) {
        formatQuery(schema, args[0]);
      },
      beforeDeleteOne(...args: any[]) {
        formatQuery(schema, args[0]);
      },
      beforeFind(...args: any[]) {
        formatQuery(schema, args[0]);
      },
      beforeFindOne(...args: any[]) {
        formatQuery(schema, args[0]);
      },
      beforeInsertMany(docs: any[]) {
        docs.forEach((doc) => formatCreate(schema, doc));
      },
      beforeInsertOne(doc: any) {
        formatCreate(schema, doc);
      },
      beforeUpdateMany(query: any, doc: any) {
        formatQuery(schema, query);
        formatUpdate(schema, doc);
      },
      beforeUpdateOne(query: any, doc: any) {
        formatQuery(schema, query);
        formatUpdate(schema, doc);
      },
    };
  }
}

export { Schema, Types };
