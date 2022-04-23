const { mongoDbUrl, mongoDbPassword, mongoDbName, mongoDbUsername } = require('../config.json');
const { MongoClient, Collection } = require('mongodb');

// Connection URL
const url = mongoDbUrl
  .replace('<database>', mongoDbName)
  .replace('<username>', mongoDbUsername)
  .replace('<password>', mongoDbPassword);
const client = new MongoClient(url);

async function connect() {
  await client.connect();

  const db = client.db(mongoDbName);
  const collection = db.collection('documents');

  return collection;
}

/**
 * 
 * @param {Collection} collection 
 */
async function insert(collection, data) {
  await collection.insertOne(data)
}

/**
 * 
 * @param {Collection} collection 
 */
async function upsert(collection, query, update, insert) {
  await collection.updateOne(query, { $set: update, $setOnInsert: insert }, { upsert: true });
}

/**
 * 
 * @param {Collection} collection 
 */
 async function deleteDocument(collection, data) {
  await collection.deleteOne({ ...data });
}

/**
 * 
 * @param {Collection} collection 
 */
async function findDocumentsUpdatedAfterOneDay(collection) {
  return collection.find({
    "updatedAt": { 
      // get only documents updated after more than 1 day
      $gte: new Date(new Date().getTime() + (1000 * 60 * 60 * 24))
    }
  }).toArray();
}

module.exports = {
  connect,
  insert,
  upsert,
  deleteDocument,
  findDocumentsUpdatedAfterOneDay
}