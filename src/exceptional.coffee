path            = require 'path'
util            = require 'util'
{read}          = require('node_util').sync()
{red, pred, blue, pyellow, magenta}           = require 'termspeak'

_               = require 'underscore'
_.mixin require 'underscore.string'

# Aliases
# -------

{log, dir}    = console
exists  = path.existsSync

process.on 'uncaughtException', (err) ->
    error err
    process.exit -1

error = (err) ->

    # TODO: Add colors
    # TODO: Use eyes.js
    if err.name? is 'AssertionError'
        log "Actual: #{util.inspect err.actual}"
        log "Expected: #{util.inspect err.expected}"
        log "Operator: #{err.operator}"
                
    try
        for line in err.stack.split '\n'
            line = line.toString()
                        
            # Stack traces include lines with the error message (usually the first line) but we distinguish the
            # message from the trace based on the fact that every line in the trace starts with 'at'
            if _(_(line).strip()).startsWith('at')
                
                # A trace line something like:
                # 1. ' at Object.<anonymous> (/Users/abi/stuff/repos/node/exceptional/lib/exceptional.js:34:11)'
                # 2. 'at /Users/abi/stuff/repos/node/toast/lib/toast.js:143:14'
                results = line.match /at [^\(\/]*[\(]{0,1}(\/[^\:]*)\:(\d*)\:(\d*)/
                
                if results
                    [$, file, lineno, char, $] = results
                    printRelevantLines file, lineno, char
                else
                    # Core modules are not printed with beginning '/' and we don't want to print surrounding lines
                    # for code modules.
                    pyellow line
            else
                pred line
                
    catch e
        log 'EXCEPTION IN EXCEPTIONAL. THE WORLD IS GOING TO EXPLODE.'
        log e.message
        log e.stack
        

printRelevantLines = (name, lineno, char) ->
    pyellow name

    lineno = parseInt lineno
    char   = parseInt char

    # TODO: If the file can't be opened, then just print the original line (eph)
    file = read(path.resolve(name)).toString()
    lines = file.split('\n')
    totalLines = lines.length
    
    # Handle edge cases
    if lineno - 5 <= 0
        startLine = 1
    else
        startLine = lineno - 5
    
    if lineno + 5 > totalLines
        endLine = totalLines
    else
        endLine = lineno + 5
        
    relevantLines = lines[(startLine - 1)...(endLine - 1)]
    
    cur_lineno = startLine
    
    for l in relevantLines
        if cur_lineno is lineno
            
            # - 2 because string indexes start at 0 but the error message's string index starts at 1
            # and we want '>' to appear one before the the actual error.
            l = _(l).splice(char - 2, 1, '>')            
            log red('\t' + cur_lineno + ": " + l)
        else
            log '\t' + cur_lineno + ": " + l
        cur_lineno += 1
        
exports.error = error