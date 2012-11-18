# glsl-tokenizer

a [readable / writable stream](https://github.com/dominictarr/stream-spec#through-sync-writable-and-readable-aka-filter) that maps input to glsl tokens, if possible.

```javascript

  var fs = require('fs')
    , tokens = require('glsl-tokenizer')()

  fs.createReadStream('some.glsl')
    .pipe(tokens)
    .on('data', function(token) {
      console.log(token.data, token.position, token.type)
    })

```

# API

### tokens = require('glsl-tokenizer')()

return a tokenizer stream instance.

emits 'data' events whenever a token is parsed with a token object as output.

# tokens

```javascript

{ 'type': TOKEN_TYPE
, 'data': "string of constituent data"
, 'position': integer position within the data stream }

```

The available token type are:

* `BLOCK_COMMENT`: `/* ... */`
* `LINE_COMMENT`: `// ... \n`
* `PREPROCESSOR`: `# ... \n`
* `OPERATOR`: Any operator. If it looks like punctuation, it's an operator.
* `INTEGER`
* `FLOAT`: Optionally suffixed with `f`
* `IDENT`: User defined identifier.
* `BUILTIN`: Builtin function
* `KEYWORD`
* `WHITESPACE`
* `EOF`: emitted on `end`; data will === `'(eof)'.

# License

MIT
