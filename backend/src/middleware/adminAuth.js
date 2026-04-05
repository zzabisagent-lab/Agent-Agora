const requireRole = require('./requireRole');

module.exports = requireRole(['admin'], 'Admin access required');
