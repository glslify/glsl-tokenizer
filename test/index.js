var test = require('tape')
var path = require('path')
var fs   = require('fs')

var tokenizeStream = require('../stream')
var tokenizeString = require('../string')
var expected = require('./expected.json')

var invalid = path.join(__dirname, 'invalid-chars.glsl')
var fixture = path.join(__dirname, 'fixture.glsl')

test('floats', function (t) {
  var src = '3.0e-2';
  var tokens = tokenizeString(src);

  console.log(tokens);

  t.end();
});

test('glsl-tokenizer/string', function(t) {
  var src = fs.readFileSync(fixture, 'utf8')
  var tokens = tokenizeString(src)

  t.ok(Array.isArray(tokens), 'returns an array of tokens')
  t.ok(tokens.length, 'length is above 0')

  // If this test fails, then you'll probably want to consider
  // bumping the major version.
  t.deepEqual(tokens, expected, 'matches exactly the expected output')

  t.end()
})

test('glsl-tokenizer/stream', function(t) {
  var input  = fs.createReadStream(fixture)
  var output = input.pipe(tokenizeStream())
  var tokens = []

  output.on('data', function(token) {
    if (typeof token !== 'object') t.fail('token is not an object')
    tokens.push(token)
  })

  output.once('end', function() {
    t.ok(tokens.length > 0, 'emitted at least once')

    // If this test fails, then you'll probably want to consider
    // bumping the major version.
    t.deepEqual(tokens, expected, 'matches exactly the expected output')
    t.end()
  })
})

test('glsl-tokenizer: invalid characters', function(t) {
    var src = fs.readFileSync(invalid, 'utf8')
    var tokens = tokenizeString(src)

    t.pass('does not hang!')

    var operators = tokens.filter(function(t) {
      return t.type === 'operator'
    }).map(function(t) {
      return t.data
    }).join('')

    t.equal(operators, "@{(){();}(){''}}=();.();(){=();}", 'collects all expected "operator" characters')
    t.end()
})
