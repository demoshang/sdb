import { SDB } from '..';

const sdb = new SDB('memory');

const personSchema = {
  name: { type: 'string', required: true },
  age: { type: 'number', gte: 18, default: 20 },
  gender: { type: 'string', enum: ['male', 'female'] },
};

const personModel = sdb.model<{ name?: string; age?: number; gender?: string }>(
  'Person',
  personSchema
);

export { sdb, personModel };
