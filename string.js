var tokenize = require('./index')

module.exports = tokenizeString

function tokenizeString(str) {
  var generator = tokenize()
  var tokens = []

  tokens = tokens.concat(generator(str))
  tokens = tokens.concat(generator(null))

  return tokens
}
