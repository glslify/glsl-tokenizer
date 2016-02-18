# glsl-tokenizer

Maps GLSL string data into GLSL tokens, either synchronously or using a
streaming API.

``` javascript
var tokenString = require('glsl-tokenizer/string')
var tokenStream = require('glsl-tokenizer/stream')
var fs = require('fs')

// Synchronously:
var tokens = tokenString(fs.readFileSync('some.glsl'))

// Streaming API:
fs.createReadStream('some.glsl')
  .pipe(tokenStream())
  .on('data', function(token) {
    console.log(token.data, token.position, token.type)
  })
```

# API

## tokens = require('glsl-tokenizer/string')(src, [opt])

Returns an array of `tokens` given the GLSL source string `src`

## stream = require('glsl-tokenizer/stream')([opt])

Emits 'data' events whenever a token is parsed with a token object as output.

# Tokens

```javascript
{ 'type': TOKEN_TYPE
, 'data': "string of constituent data"
, 'position': integer position within the GLSL source
, 'line': line number within the GLSL source
, 'column': column number within the GLSL source }
```

The available token types are:

* `block-comment`: `/* ... */`
* `line-comment`: `// ... \n`
* `preprocessor`: `# ... \n`
* `operator`: Any operator. If it looks like punctuation, it's an operator.
* `float`: Optionally suffixed with `f`
* `ident`: User defined identifier.
* `builtin`: Builtin function.
* `eof`: Emitted on `end`; data will === `'(eof)'`.
* `integer`
* `whitespace`
* `keyword`

# License

MIT, see [LICENSE.md](LICENSE.md) for further information.
