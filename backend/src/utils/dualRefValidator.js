/**
 * dualRefValidator
 *
 * Returns a Mongoose pre('validate') hook that enforces dual-ref integrity:
 *   - if typeField === 'agent' → agentField required, humanField must be null/undefined
 *   - if typeField === 'human' → humanField required, agentField must be null/undefined
 *
 * Usage:
 *   schema.pre('validate', dualRefValidator('author_type', 'author_agent', 'author_human'));
 */
function dualRefValidator(typeField, agentField, humanField) {
  return function (next) {
    const type = this[typeField];

    if (type === 'agent') {
      if (!this[agentField]) {
        return next(
          new Error(
            `${agentField} is required when ${typeField} is 'agent'`
          )
        );
      }
      this[humanField] = null;
    } else if (type === 'human') {
      if (!this[humanField]) {
        return next(
          new Error(
            `${humanField} is required when ${typeField} is 'human'`
          )
        );
      }
      this[agentField] = null;
    }

    next();
  };
}

module.exports = dualRefValidator;
