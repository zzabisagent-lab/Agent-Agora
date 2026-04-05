const requireRole = require('./requireRole');

module.exports = requireRole(['participant', 'admin'], 'Participant access required');
