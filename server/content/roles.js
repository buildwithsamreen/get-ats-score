// Common keywords per target role, used when the user has no job description.
// Order is rough importance (most commonly requested first). "a|b" lists
// synonyms: any one counts as a match and the first is shown to the user.
// `aliases` help guess a role from a job title.

// Data lives in roles.json so the client can build a keyword page per role from it.
// Each role also has sampleSummary/sampleBullets (shown on those pages).
const ROLES = require('./roles.json')

const roleById = (id) => ROLES.find((r) => r.id === id)

module.exports = { ROLES, roleById }
