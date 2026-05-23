import { MongoMemoryReplSet } from 'mongodb-memory-server';

let mongod: MongoMemoryReplSet;

export async function setup() {
  mongod = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongod.waitUntilRunning();
  process.env.TEST_MONGODB_URI = mongod.getUri();
}

export async function teardown() {
  await mongod.stop();
}
