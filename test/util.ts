import { resolve as pathResolve } from 'path';

import { AJS, FDB, MDB, Types } from '..';

const fileDB = new FDB(`file://${pathResolve(__dirname, '../.tmp/')}`);

const mongo = new MDB();
mongo.connect('mongodb://localhost:27017/test');

AJS.register('string[]', (...args: any[]) => {
  const [actual, expected, , parent] = args;
  if (Array.isArray(parent)) {
    return expected && typeof actual === 'string';
  }

  return expected;
});

const personSchema = {
  name: { type: 'string', required: true },
  age: { type: 'number', gte: 18, default: 20 },
  gender: { type: 'string', enum: ['male', 'female'] },
  hobbies: { type: Types.Mixed, 'string[]': true },
};

const personModel = fileDB.model<{ name?: string; age?: number; gender?: string; hobbies?: any[] }>(
  'Person',
  personSchema
);

personModel.addPlugin('update log', {
  beforeUpdateOne(query: any, doc: any) {
    console.info('beforeUpdateOne: ', { query, doc });
  },
  afterUpdateOne(result: any) {
    console.info('afterUpdateOne: ', result);
  },
});

const personMongoModel = mongo.model<{
  name?: string;
  age?: number;
  gender?: string;
  hobbies?: any[];
}>('Person', personSchema);

const sdb2 = new FDB('file://', { memory: true });
const person2Model = sdb2.model<any>('Person', personSchema);
const sdb3 = new FDB('nedb://memory');
const person3Model = sdb3.model<any>('Person', personSchema);

export { fileDB as nedb, mongo, personModel, personMongoModel, person2Model, person3Model };
