/* eslint-disable prettier/prettier */
import { logger } from "@packages/common";
import { Collection, Db, Document, MongoClient } from "mongodb";

import { processCollections, setupIndexes } from "./config";
import { CollectionConfig, ConfigMongoDb, IClientStore } from "./interface";

const clientStore: IClientStore[] = [];


export async function setupMongoDatabase(config: ConfigMongoDb, collections?: CollectionConfig | null): Promise<null | IClientStore> {
  const { clientUrl, dbName } = config;
  try {
    const existingClient = clientStore.find(
      (client) => client.clientUrl === clientUrl && client.dbName === dbName
    );

    if (existingClient) {
      return existingClient;
    }

    const client = new MongoClient(clientUrl);
    await client.connect();
    const database: Db = client.db(dbName);
    logger.info(`MongoDB connected to database: ${dbName}`);

    if (collections) {
      const collectionHandle = processCollections(collections);
      await setupIndexes(database, collectionHandle);
    }

    const clientElement: IClientStore = {
      client,
      database,
      clientUrl,
      dbName,
    };

    clientStore.push(clientElement);
    return clientElement;
  } catch (error) {
    logger.error(`Failed to connect to MongoDB at ${config.clientUrl} with database ${config.dbName}`);
    logger.error(error);
    return null;
  }
}

export function getCollection<TSchema extends Document>(
  database: Db | undefined,
  collectionName: string,
): Collection<TSchema> {
  if (!database) {
    throw new Error(`MongoDB database instance doesn't exist`);
  }
  database
    .listCollections({ name: collectionName })
    .toArray()
    .then((collections) => {
      if (collections.length === 0) {
        database
          .createCollection(collectionName)
          .then(() => {
            console.log(`Collection ${collectionName} created`);
          })
          .catch((err) => {
            console.error(`Failed to create collection: ${err}`);
          });
      }
    })
    .catch((err) => {
      console.error(`Failed to list collections: ${err}`);
    });

  return database.collection<TSchema>(collectionName);
}
