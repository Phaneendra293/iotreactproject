const storage = require('../shared/storage');

module.exports = async function (context, req) {
  try {
    const tasks = await storage.readTasks();
    context.res = {
      status: 200,
      body: tasks
    };
  } catch (err) {
    context.log.error(err);
    context.res = {
      status: 500,
      body: { error: 'Failed to read tasks' }
    };
  }
};
