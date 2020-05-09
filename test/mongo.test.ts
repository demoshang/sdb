import test from 'ava';

import { personMongoModel, mongo } from './util';

test.after(async (t) => {
  await personMongoModel.drop();
  await mongo.disconnect();
  t.pass();
});

test.beforeEach(async (t) => {
  await personMongoModel.deleteMany({});
  t.pass();
});

test('insertOne && findOne', async (t) => {
  const name = `insertOne ${Date.now()}`;

  await personMongoModel.insertOne({
    name,
  });

  const nu = await personMongoModel.countDocuments({ name });
  t.is(nu, 1);
  const person = await personMongoModel.findOne({ name });
  t.is(person?.name, name);
});

test('insertMany && find', async (t) => {
  const name1 = `insert 1 ${Date.now()}`;
  const name2 = `insert 2 ${Date.now()}`;

  await personMongoModel.insertMany([
    {
      name: name1,
    },
    {
      name: name2,
    },
  ]);

  const persons = await personMongoModel.find({}, { sort: { name: -1 }, skip: 0 });
  const arr = persons.map(({ name }) => {
    return name;
  });

  t.deepEqual([name2, name1], arr);
});

test('countDocuments && updateOne && updateMany', async (t) => {
  const name1 = `insert 1 ${Date.now()}`;
  const name2 = `insert 2 ${Date.now()}`;
  const name3 = `insert 3 ${Date.now()}`;

  await personMongoModel.insertMany([
    {
      name: name1,
      age: 20,
    },
    {
      name: name2,
      age: 20,
    },
  ]);

  let nu = await personMongoModel.countDocuments({});
  t.is(nu, 2);

  await personMongoModel.updateMany({ age: 20 }, { age: 50 });
  nu = await personMongoModel.countDocuments({ age: 50 });
  t.is(nu, 2);

  await personMongoModel.updateOne({ age: 50 }, { age: 20 });
  nu = await personMongoModel.countDocuments({ age: 20 });
  t.is(nu, 1);

  await personMongoModel.updateOne({ name: name3 }, { age: 20 }, { upsert: true });
  nu = await personMongoModel.countDocuments({ name: name3 });
  t.is(nu, 1);
});

test('deleteOne && deleteMany', async (t) => {
  const name1 = `insert 1 ${Date.now()}`;
  const name2 = `insert 2 ${Date.now()}`;
  const name3 = `insert 3 ${Date.now()}`;

  await personMongoModel.insertMany([
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

  let nu = await personMongoModel.countDocuments({});
  t.is(nu, 3);

  await personMongoModel.deleteOne({ age: 20 });
  nu = await personMongoModel.countDocuments({});
  t.is(nu, 2);

  await personMongoModel.deleteMany({ age: 20 });
  nu = await personMongoModel.countDocuments({});
  t.is(nu, 0);
});

test('createIndex && dropIndex', async (t) => {
  await personMongoModel.createIndex('name', { unique: true });
  await personMongoModel.createIndex('age', { unique: true });

  await personMongoModel.insertOne({ name: 'name', age: 18 });

  await t.throwsAsync(
    async () => {
      await personMongoModel.insertOne({ name: 'name' });
    },
    { message: /unique|duplicate/ }
  );

  await t.throwsAsync(
    async () => {
      await personMongoModel.updateOne({ name: 'name2' }, { age: 18 }, { upsert: true });
    },
    { message: /unique|duplicate/ }
  );

  await personMongoModel.dropIndex('name_1');

  await t.notThrowsAsync(async () => {
    await personMongoModel.insertOne({ name: 'name' });
  });
});

test('schema check', async (t) => {
  await t.throwsAsync(
    async () => {
      await personMongoModel.insertOne({});
    },
    { message: /\$\.name.*required/ }
  );

  await t.throwsAsync(
    async () => {
      await personMongoModel.insertOne({ name: 'name', age: 10 });
    },
    { message: /\$\.age.*gte/ }
  );

  await t.throwsAsync(
    async () => {
      await personMongoModel.insertOne({ name: 'name', gender: 'male_' });
    },
    { message: /\$\.gender.*enum/ }
  );

  await personMongoModel.insertOne({ name: 'name_default_age' });
  const person = await personMongoModel.findOne({ name: 'name_default_age' });
  t.is(person?.age, 20);
});

test('plugin', async (t) => {
  await personMongoModel.insertOne({ name: 'name', age: 20 });

  let nu = await personMongoModel.countDocuments({ age: { $gte: 20 } });
  t.is(nu, 1);

  nu = await personMongoModel.countDocuments({
    $and: [{ age: { $gte: 20 } }, { name: 'name' }],
  });

  t.is(nu, 1);

  await t.throwsAsync(
    async () => {
      await personMongoModel.countDocuments({
        $and: { age: { $gte: 20 } },
      });
    },
    { message: /need array value/ }
  );

  nu = await personMongoModel.countDocuments({
    name: {
      $in: ['name', 'name1'],
    },
  });
  t.is(nu, 1);

  await personMongoModel.updateOne({ name: 'name' }, { hobbies: ['a', 'b'] });
  nu = await personMongoModel.countDocuments({ hobbies: { $elemMatch: { $in: ['a'] } } });
  t.is(nu, 1);

  await personMongoModel.updateOne({ name: 'name' }, { $push: { hobbies: 'c' } });
  let doc = await personMongoModel.findOne({ name: 'name' });
  t.is(doc?.hobbies?.length, 3);

  await personMongoModel.updateOne({ name: 'name' }, { $addToSet: { hobbies: 'a' } });
  doc = await personMongoModel.findOne({ name: 'name' });
  t.is(doc?.hobbies?.length, 3);

  await personMongoModel.updateOne({ name: 'name' }, { $pull: { hobbies: 'a' } });
  doc = await personMongoModel.findOne({ name: 'name' });
  t.is(doc?.hobbies?.length, 2);

  await personMongoModel.updateOne({ name: 'name' }, { $push: { hobbies: { $each: ['a', 'b'] } } });
  doc = await personMongoModel.findOne({ name: 'name' });
  t.is(doc?.hobbies?.length, 4);
});
