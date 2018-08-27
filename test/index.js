var test = require('tape')
var path = require('path')
var fs   = require('fs')

var tokenizeStream = require('../stream')
var tokenizeString = require('../string')
var expected = require('./expected.json')

var invalid = path.join(__dirname, 'invalid-chars.glsl')
var fixture = path.join(__dirname, 'fixture.glsl')
var fixtureWindows = path.join(__dirname, 'fixture-windows.glsl')
var fixture300es = path.join(__dirname, 'fixture-300es.glsl')

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

test('glsl-tokenizer/string windows carriage returns', function(t) {
  var src = fs.readFileSync(fixtureWindows, 'utf8')
  var tokens = tokenizeString(src)

  t.ok(Array.isArray(tokens), 'returns an array of tokens')
  t.ok(tokens.length, 'length is above 0')

  t.equal(tokens[0].data, '#define PHYSICAL');
  // upstream in stackgl/headless-gl
  t.equal(tokens[0].data.match(/^\s*\#\s*(.*)$/)[1], 'define PHYSICAL');

  t.end()
})

test('version 300es', function(t) {
  var src = fs.readFileSync(fixture300es, 'utf8')
  var tokens = tokenizeString(src, { version: '300 es' })

  t.deepEqual(tokens.filter(function (t) {
    return t.type === 'keyword'
  }).map(function (t) {
    return t.data
  }), [ 'out', 'vec4', 'in', 'vec2', 'uniform', 'usampler2DArray', 'void', 'vec4', 'vec4' ], 'matches 300es tokens')

  t.deepEqual(tokens.filter(function (t) {
    return t.type === 'builtin'
  }).map(function (t) {
    return t.data
  }), [ 'textureLod' ], 'matches 300es builtins')

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

test('floats: should recognize negative exp', function (t) {
  var src = '3.0e-2';
  var tokens = tokenizeString(src);

  t.deepEqual(tokenizeString('3.0e-2'), [
    { column: 6, data: '3.0e-2', line: 1, position: 0, type: 'float' },
    { column: 6, data: '(eof)', line: 1, position: 0, type: 'eof' }
  ]);

  t.deepEqual(tokenizeString('3.0-2.0'), [
    { type: 'float', data: '3.0', position: 0, line: 1, column: 3 },
    { type: 'operator', data: '-', position: 3, line: 1, column: 4 },
    { type: 'float', data: '2.0', position: 4, line: 1, column: 7 },
    { type: 'eof', data: '(eof)', position: 4, line: 1, column: 7 }
  ]);

  t.end();
});

test('uint / int data types', function (t) {
  t.deepEqual(tokenizeString('uint x;'), [
    {type: "keyword", data: "uint", position: 0, line: 1, column: 4},
    {type: "whitespace", data: " ", position: 4, line: 1, column: 5},
    {type: "ident", data: "x", position: 5, line: 1, column: 6},
    {type: "operator", data: ";", position: 6, line: 1, column: 6},
    {type: "eof", data: "(eof)", position: 6, line: 1, column: 7}
  ]);

  t.deepEqual(tokenizeString('int x;'), [
    {type: "keyword", data: "int", position: 0, line: 1, column: 3},
    {type: "whitespace", data: " ", position: 3, line: 1, column: 4},
    {type: "ident", data: "x", position: 4, line: 1, column: 5},
    {type: "operator", data: ";", position: 5, line: 1, column: 5},
    {type: "eof", data: "(eof)", position: 5, line: 1, column: 6}
  ]);

  t.end();
});
