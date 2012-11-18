module.exports = tokenize

var Stream = require('stream').Stream

var literals = require('./lib/literals')
  , operators = require('./lib/operators')
  , builtins = require('./lib/builtins')

var NORMAL = 999          // <-- never emitted
  , TOKEN = 9999          // <-- never emitted 
  , BLOCK_COMMENT = 0 
  , LINE_COMMENT = 1
  , PREPROCESSOR = 2
  , OPERATOR = 3
  , INTEGER = 4
  , FLOAT = 5
  , IDENT = 6
  , BUILTIN = 7
  , KEYWORD = 8
  , WHITESPACE = 9
  , EOF = 10 

var map = [
    'block-comment'
  , 'line-comment'
  , 'preprocessor'
  , 'operator'
  , 'integer'
  , 'float'
  , 'ident'
  , 'builtin'
  , 'keyword'
  , 'whitespace'
  , 'eof'
]

function create_stream() {
  var stream = new Stream
  stream.readable =
  stream.writable = true
  return stream
}

function tokenize() {
  var stream = create_stream()
  stream.write = write
  stream.end = end

  var i = 0
    , total = 0
    , mode = NORMAL 
    , c
    , last
    , content = []
    , token_idx = 0
    , token_offs = 0
    , start = 0
    , isnum = false
    , isoperator = false
    , input
    , len

  return stream

  function token(data) {
    if(data.length) {
      stream.emit('data', {type:map[mode], data: data, position: start})
    }
  }

  function write(chunk) {
    i = 0
    input = chunk.toString()
    len = input.length
    while(c = input[i], i < len) switch(mode) {
      case BLOCK_COMMENT: i = block_comment(), last = c; break
      case LINE_COMMENT: i = line_comment(), last = c; break
      case PREPROCESSOR: i = preprocessor(), last = c; break 
      case OPERATOR: i = operator(), last = c; break
      case INTEGER: i = integer(), last = c; break
      case FLOAT: i = decimal(), last = c; break
      case TOKEN: i = readtoken(), last = c; break
      case WHITESPACE: i = whitespace(), last = c; break
      case NORMAL: i = normal(), last = c; break
    }

    total += chunk.length
  } 

  function end(chunk) {
    if(arguments.length) {
      write(chunk)
    }

    mode = EOF
    token('(eof)')
    stream.readable = false
    stream.closed = true
    stream.emit('close')
  }

  function normal() {
    content = content.length ? [] : content

    if(last === '/' && c === '/') {
      start = total + i - 1
      mode = LINE_COMMENT
      return i + 1
    }

    if(last === '/' && c === '*') {
      start = total + i - 1
      mode = BLOCK_COMMENT
      return i + 1
    }

    if(c === '#') {
      mode = PREPROCESSOR
      start = total + i
      return i
    }

    if(/\s/.test(c)) {
      mode = WHITESPACE
      start = total + i
      return i
    }

    isnum = /\d/.test(c)
    isoperator = /[^\w_]/.test(c)

    start = total + i
    mode = isnum ? INTEGER : isoperator ? OPERATOR : TOKEN
    return i
  }

  function whitespace() {
    if(/[^\s]/g.test(c)) {
      token(content.join(''))
      mode = NORMAL
      return i
    }
    content.push(c)
    return i + 1
  }

  function preprocessor() {
    if(c === '\n' && last !== '\\') {
      token(content.join(''))
      mode = NORMAL
      return i
    }
    content.push(c)
    return i + 1
  }

  function line_comment() {
    return preprocessor()
  }

  function block_comment() {
    if(c === '/' && last === '*') {
      token(content.join(''))
      mode = NORMAL
    }

    content.push(c)
    return i + 1
  }

  function operator() {
    if(last === '.' && /\d/.test(c)) {
      mode = FLOAT
      return i
    }

    var is_composite_operator = content.length === 2 && c !== '='
    if(/[\w_\d\s]/.test(c) || is_composite_operator) {
      while(determine_operator(content));
      mode = NORMAL
      return i
    }

    content.push(c)
    return i + 1
  }

  function determine_operator(buf) {
    var j = 0
      , idx

    do {
      idx = operators.indexOf(buf.slice(0, buf.length + j).join(''))
      if(idx === -1) { 
        j -= 1
        continue
      }
      
      token(operators[idx])

      start += operators[idx].length
      content = content.slice(operators[idx].length)
      return content.length
    } while(1)
  }

  function integer() {
    if(c === '.') {
      content.push(c)
      mode = FLOAT
      return i + 1
    }

    if(/[^\d]/.test(c)) {
      token(content.join(''))
      mode = NORMAL
      return i
    }

    content.push(c)
    return i + 1
  }

  function decimal() {
    if(c === 'f') {
      content.push(c)
      i += 1
    }
    if(/[^\d]/.test(c)) {
      token(content.join(''))
      mode = NORMAL
      return i
    }
    content.push(c)
    return i + 1
  }

  function readtoken() {
    if(/[^\d\w_]/.test(c)) {
      var contentstr = content.join('')
      if(literals.indexOf(contentstr) > -1) {
        mode = KEYWORD
      } else if(builtins.indexOf(contentstr) > -1) {
        mode = BUILTIN
      } else {
        mode = IDENT
      }
      token(content.join(''))
      mode = NORMAL
      return i
    }
    content.push(c)
    return i + 1
  }
}
