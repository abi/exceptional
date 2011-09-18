(function() {
  var blue, dir, error, exists, extractRelevantLines, log, magenta, path, pyellow, read, red, util, _, _ref;
  path = require('path');
  util = require('util');
  read = require('node_util').sync().read;
  _ref = require('termspeak'), red = _ref.red, blue = _ref.blue, pyellow = _ref.pyellow, magenta = _ref.magenta;
  _ = require('underscore');
  _.mixin(require('underscore.string'));
  log = console.log, dir = console.dir;
  exists = path.existsSync;
  process.on('uncaughtException', function(err) {
    error(err);
    return process.exit(-1);
  });
  error = function(err) {
    var char, line, lineno, name, temp, _i, _len, _ref, _ref2, _ref3, _results;
    if ((err.name != null) === 'AssertionError') {
      log("Actual: " + (util.inspect(err.actual)));
      log("Expected: " + (util.inspect(err.expected)));
      log("Operator: " + err.operator);
    }
    try {
      _ref = err.stack.split('\n');
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        line = line.toString();
        if (line.split('(').length < 2 && line.split('/').length > 1) {
          temp = line.split('/');
          temp.shift();
          temp = '/' + temp.join('/');
          _ref2 = temp.split(':'), name = _ref2[0], lineno = _ref2[1], char = _ref2[2];
          extractRelevantLines(name, lineno, char);
        }
        if (line.split('(').length < 2) {
          log(red(line));
          continue;
        }
        _ref3 = line.split('(')[1].split(')')[0].split(':'), name = _ref3[0], lineno = _ref3[1], char = _ref3[2];
        _results.push(name.split('/').length > 1 ? extractRelevantLines(name, lineno, char) : pyellow(line.split('at ')[1]));
      }
      return _results;
    } catch (e) {
      log('EXCEPTION IN EXCEPTIONAL. THE WORLD IS GOING TO EXPLODE.');
      log(e.message);
      return log(e.stack);
    }
  };
  extractRelevantLines = function(name, lineno, char) {
    var cur_lineno, endLine, file, l, lines, relevantLines, startLine, totalLines, _i, _len, _results;
    name = name.replace('.coffee', '.js');
    pyellow(name);
    lineno = parseInt(lineno);
    char = parseInt(char);
    file = read(path.resolve(name)).toString();
    lines = file.split('\n');
    totalLines = lines.length;
    if (lineno - 5 <= 0) {
      startLine = 1;
    } else {
      startLine = lineno - 5;
    }
    if (lineno + 5 > totalLines) {
      endLine = totalLines;
    } else {
      endLine = lineno + 5;
    }
    relevantLines = lines.slice(startLine - 1, endLine - 1);
    cur_lineno = startLine;
    _results = [];
    for (_i = 0, _len = relevantLines.length; _i < _len; _i++) {
      l = relevantLines[_i];
      if (cur_lineno === lineno) {
        l = _(l).splice(char - 2, 1, '>');
        log(red('\t' + cur_lineno + ": " + l));
      } else {
        log('\t' + cur_lineno + ": " + l);
      }
      _results.push(cur_lineno += 1);
    }
    return _results;
  };
}).call(this);
