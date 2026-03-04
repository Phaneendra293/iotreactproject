const storage = require('../shared/storage');

module.exports = async function (context, req) {
  try {
    const { text, priority } = req.body || {};
    if (!text || typeof text !== 'string') {
      context.res = { status: 400, body: { error: 'Missing or invalid "text" in request body' } };
      return;
    }
    const task = await storage.addTask({ text, priority: priority || 'medium' });
    context.res = { status: 201, body: task };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, body: { error: 'Failed to add task' } };
  }
};
