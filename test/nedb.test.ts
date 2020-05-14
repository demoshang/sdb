import test from 'ava';

import { omit } from 'lodash';
import { nedb, person2Model, person3Model, personModel } from './util';

test.after(async (t) => {
  await personModel.dropIndex('age_1');
  await personModel.drop(true);
  await nedb.disconnect();
  t.pass();
});

test.beforeEach(async (t) => {
  await personModel.deleteMany({});
  t.pass();
});

test('db connect', async (t) => {
  const name = `insertOne ${Date.now()}`;

  await person2Model.insertOne({
    name,
  });
  let nu = await person2Model.countDocuments({ name });
  t.is(nu, 1);

  await person3Model.insertOne({
    name,
  });
  nu = await person3Model.countDocuments({ name });
  t.is(nu, 1);

  await t.throwsAsync(async () => {
    person2Model.addPlugin('', '');
  });

  await t.throwsAsync(async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    await person2Model.xxxx();
  });
});

test('insertOne && findOne', async (t) => {
  const name = `insertOne ${Date.now()}`;

  await personModel.insertOne({
    name,
  });

  const nu = await personModel.countDocuments({ name });
  t.is(nu, 1);
  const person = await personModel.findOne({ name });
  t.is(person?.name, name);
});

test('insertMany && find', async (t) => {
  const name1 = `insert 1 ${Date.now()}`;
  const name2 = `insert 2 ${Date.now()}`;

  await personModel.insertMany([
    {
      name: name1,
    },
    {
      name: name2,
    },
  ]);

  const persons = await personModel.find({}, { sort: { name: -1 }, skip: 0 });
  const arr = persons.map(({ name }) => {
    return name;
  });

  t.deepEqual([name2, name1], arr);
});

test('countDocuments && updateOne && updateMany', async (t) => {
  const name1 = `insert 1 ${Date.now()}`;
  const name2 = `insert 2 ${Date.now()}`;
  const name3 = `insert 3 ${Date.now()}`;

  await personModel.insertMany([
    {
      name: name1,
      age: 20,
    },
    {
      name: name2,
      age: 20,
    },
  ]);

  let nu = await personModel.countDocuments({});
  t.is(nu, 2);

  await personModel.updateMany({ age: 20 }, { age: 50 });
  nu = await personModel.countDocuments({ age: 50 });
  t.is(nu, 2);

  await personModel.updateOne({ age: 50 }, { age: 20 });
  nu = await personModel.countDocuments({ age: 20 });
  t.is(nu, 1);

  await personModel.updateOne({ name: name3 }, { age: 20 }, { upsert: true });
  nu = await personModel.countDocuments({ name: name3 });
  t.is(nu, 1);
});

test('deleteOne && deleteMany', async (t) => {
  const name1 = `insert 1 ${Date.now()}`;
  const name2 = `insert 2 ${Date.now()}`;
  const name3 = `insert 3 ${Date.now()}`;

  await personModel.insertMany([
    {
      name: name1,
      age: 20,
    },
    {
      name: name2,
      age: 20,
    },
    {
      name: name3,
      age: 20,
    },
  ]);

  let nu = await personModel.countDocuments({});
  t.is(nu, 3);

  await personModel.deleteOne({ age: 20 });
  nu = await personModel.countDocuments({});
  t.is(nu, 2);

  await personModel.deleteMany({ age: 20 });
  nu = await personModel.countDocuments({});
  t.is(nu, 0);
});

test('createIndex && dropIndex', async (t) => {
  await personModel.createIndex({ name: 1 }, { unique: true });
  await personModel.createIndex('age', { unique: true });

  await personModel.insertOne({ name: 'name', age: 18 });

  await t.throwsAsync(
    async () => {
      await personModel.insertOne({ name: 'name' });
    },
    { message: /unique|duplicate/ }
  );

  await t.throwsAsync(
    async () => {
      await personModel.updateOne({ name: 'name2' }, { age: 18 }, { upsert: true });
    },
    { message: /unique|duplicate/ }
  );

  await personModel.dropIndex('name_1');
  // await personModel.dropIndex('age_1');

  await t.notThrowsAsync(async () => {
    await personModel.insertOne({ name: 'name' });
  });

  await t.throwsAsync(
    async () => {
      await personModel.createIndex({ name: 1, age: 1 }, { unique: true });
    },
    { message: /only one field/ }
  );
});

test('schema check', async (t) => {
  await t.throwsAsync(
    async () => {
      await personModel.insertOne({});
    },
    { message: /\$\.name.*required/ }
  );

  await t.throwsAsync(
    async () => {
      await personModel.insertOne({ name: 'name', age: 10 });
    },
    { message: /\$\.age.*gte/ }
  );

  await t.throwsAsync(
    async () => {
      await personModel.insertOne({ name: 'name', gender: 'male_' });
    },
    { message: /\$\.gender.*enum/ }
  );

  await personModel.insertOne({ name: 'name_default_age' });
  const person = await personModel.findOne({ name: 'name_default_age' });
  t.is(person?.age, 20);
});

test('ignore attributes not schema ', async (t) => {
  const base = { name: 'name', age: 18 };
  await t.notThrowsAsync(async () => {
    await personModel.insertOne({ ...base, xxxxx: 1, a: { b: { c: 1 } } });
  });

  const person = await personModel.findOne({});
  t.deepEqual(omit(person, ['_id', 'createdAt', 'updatedAt']), base);
});

test('plugin', async (t) => {
  await personModel.insertOne({ name: 'name', age: 20 });

  let nu = await personModel.countDocuments({ age: { $gte: 20 } });
  t.is(nu, 1);

  nu = await personModel.countDocuments({
    $and: [{ age: { $gte: 20 } }, { name: 'name' }],
  });

  t.is(nu, 1);

  await t.throwsAsync(
    async () => {
      await personModel.countDocuments({
        $and: { age: { $gte: 20 } },
      });
    },
    { message: /need array value/ }
  );

  nu = await personModel.countDocuments({
    name: {
      $in: ['name', 'name1'],
    },
  });
  t.is(nu, 1);

  await personModel.updateOne({ name: 'name' }, { hobbies: ['a', 'b'] });
  nu = await personModel.countDocuments({ hobbies: { $elemMatch: { $in: ['a'] } } });
  t.is(nu, 1);

  await personModel.updateOne({ name: 'name' }, { $push: { hobbies: 'c' } });
  let doc = await personModel.findOne({ name: 'name' });
  t.is(doc?.hobbies?.length, 3);

  await personModel.updateOne({ name: 'name' }, { $addToSet: { hobbies: 'a' } });
  doc = await personModel.findOne({ name: 'name' });
  t.is(doc?.hobbies?.length, 3);

  await personModel.updateOne({ name: 'name' }, { $pull: { hobbies: 'a' } });
  doc = await personModel.findOne({ name: 'name' });
  t.is(doc?.hobbies?.length, 2);

  await personModel.updateOne({ name: 'name' }, { $push: { hobbies: { $each: ['a', 'b'] } } });
  doc = await personModel.findOne({ name: 'name' });
  t.is(doc?.hobbies?.length, 4);
});
