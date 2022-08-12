const ToDo = require('../models/ToDo');

module.exports = async (req, res, next) => {
  try {
    const item = await ToDo.getById(req.params.id);
    if (!item || item.user_id !== req.user.id) {
      throw new Error('You do not have access to view this page');
    }
    next();
  } catch (e) {
    e.status = 403;
    next(e);
  }
};
