/*
  Cosmos-backed storage for Azure Functions.
  - If COSMOS_ENDPOINT and COSMOS_KEY are set, use Cosmos DB.
  - Otherwise fall back to local file storage at ../data/tasks.json (useful for local dev without Cosmos).

  Database: todoDB
  Container: tasks
  Partition key: /id (each item uses its id as partition key for simplicity)
*/
const fs = require('fs').promises;
const path = require('path');
let cosmosClient;
let container;

const { COSMOS_DB = 'todoDB', COSMOS_CONTAINER = 'tasks' } = process.env;
const dataFile = path.join(__dirname, '..', 'data', 'tasks.json');

async function initCosmos() {
  if (container) return container;
  const endpoint = process.env.COSMOS_ENDPOINT;
  const key = process.env.COSMOS_KEY;
  if (!endpoint || !key) return null;

  const { CosmosClient } = require('@azure/cosmos');
  cosmosClient = new CosmosClient({ endpoint, key });

  // Ensure database and container exist
  const { database } = await cosmosClient.databases.createIfNotExists({ id: COSMOS_DB });
  const { container: created } = await database.containers.createIfNotExists({
    id: COSMOS_CONTAINER,
    partitionKey: { paths: ['/id'] }
  });
  container = created;
  return container;
}

async function readTasks() {
  const cont = await initCosmos();
  if (cont) {
    const iterator = cont.items.readAll();
    const { resources } = await iterator.fetchAll();
    return resources;
  }

  // Fallback to file storage
  try {
    const raw = await fs.readFile(dataFile, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writeTasks(tasks) {
  // Only used by fallback file storage
  await fs.mkdir(path.dirname(dataFile), { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify(tasks, null, 2), 'utf8');
}

async function addTask({ text, priority = 'medium' }) {
  const cont = await initCosmos();
  const id = String(Date.now());
  const task = { id, text, priority, done: false };
  if (cont) {
    const { resource } = await cont.items.create(task);
    return resource;
  }

  const tasks = await readTasks();
  tasks.unshift(task);
  await writeTasks(tasks);
  return task;
}

async function deleteTask(id) {
  const cont = await initCosmos();
  if (cont) {
    try {
      // partitionKey is the id (see createIfNotExists partition key)
      await cont.item(String(id), String(id)).delete();
      return true;
    } catch (err) {
      if (err.code === 404 || err.statusCode === 404) return false;
      throw err;
    }
  }

  const tasks = await readTasks();
  const filtered = tasks.filter(t => String(t.id) !== String(id));
  if (filtered.length === tasks.length) return false;
  await writeTasks(filtered);
  return true;
}

module.exports = { readTasks, writeTasks, addTask, deleteTask };
