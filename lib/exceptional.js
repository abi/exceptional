(function() {
  var blue, dir, error, exists, log, magenta, path, pred, printRelevantLines, pyellow, read, red, util, _, _ref;
  path = require('path');
  util = require('util');
  read = require('node_util').sync().read;
  _ref = require('termspeak'), red = _ref.red, pred = _ref.pred, blue = _ref.blue, pyellow = _ref.pyellow, magenta = _ref.magenta;
  _ = require('underscore');
  _.mixin(require('underscore.string'));
  log = console.log, dir = console.dir;
  exists = path.existsSync;
  process.on('uncaughtException', function(err) {
    error(err);
    return process.exit(-1);
  });
  error = function(err) {
    var $, char, file, line, lineno, results, _i, _len, _ref, _results;
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
        _results.push(_(_(line).strip()).startsWith('at') ? (results = line.match(/at [^\(\/]*[\(]{0,1}(\/[^\:]*)\:(\d*)\:(\d*)/), results ? (($ = results[0], file = results[1], lineno = results[2], char = results[3], $ = results[4], results), printRelevantLines(file, lineno, char)) : pyellow(line)) : pred(line));
      }
      return _results;
    } catch (e) {
      log('EXCEPTION IN EXCEPTIONAL. THE WORLD IS GOING TO EXPLODE.');
      log(e.message);
      return log(e.stack);
    }
  };
  printRelevantLines = function(name, lineno, char) {
    var cur_lineno, endLine, file, l, lines, relevantLines, startLine, totalLines, _i, _len, _results;
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
  exports.error = error;
}).call(this);
