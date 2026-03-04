const storage = require('../shared/storage');

module.exports = async function (context, req) {
  try {
    const id = (context.bindingData && context.bindingData.id) || (req && req.query && req.query.id);
    if (!id) {
      context.res = { status: 400, body: { error: 'Missing task id in route' } };
      return;
    }
    const ok = await storage.deleteTask(id);
    if (!ok) {
      context.res = { status: 404, body: { error: 'Task not found' } };
      return;
    }
    context.res = { status: 204, body: null };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, body: { error: 'Failed to delete task' } };
  }
};
