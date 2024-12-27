import { Collection, Db, Document, MongoClient } from 'mongodb';

export async function setupDB(
  url: string,
  dbName: string,
): Promise<[MongoClient, Db]> {
  const client = new MongoClient(url);

  await client.connect();

  const database = client.db(dbName);

  return [client, database];
}

async function collectionExists(
  db: Db,
  collectionName: string,
): Promise<boolean> {
  const collections = await db
    .listCollections({ name: collectionName })
    .toArray();
  return collections.length > 0;
}

export async function ensureCollection(
  db: Db,
  collectionName: string,
): Promise<void> {
  if (!(await collectionExists(db, collectionName))) {
    await db.createCollection(collectionName);
  }
}

export function getCollection<T extends Document>(
  database: Db,
  collectionName: string,
): Collection<T> {
  return database.collection(collectionName);
}

export async function indexExists(
  collection: Collection<any>,
  indexName: string,
): Promise<boolean> {
  const existingIndexes = await collection.indexes();
  return existingIndexes.some((index) => index.name === indexName);
}

export async function ensureIndex(
  collection: Collection<any>,
  fields: any,
  options: any,
  indexName: string,
) {
  if (!(await indexExists(collection, indexName))) {
    await collection.createIndex(fields, options);
  }
}
