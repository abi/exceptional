path            = require 'path'
util            = require 'util'
{read}                                  = require('node_util').sync()
{red, blue, pyellow, magenta}           = require 'termspeak'

_               = require 'underscore'
_.mixin require 'underscore.string'

# Aliases
# -------

{log, dir}    = console
exists  = path.existsSync
            
# Setup
# -----

process.on 'uncaughtException', (err) ->
    error err
    process.exit -1

# Module
# -------

error = (err) ->

    # TODO: Add colors
    if err.name? is 'AssertionError'
        log "Actual: #{util.inspect err.actual}"
        log "Expected: #{util.inspect err.expected}"
        log "Operator: #{err.operator}"
                
    try
        for line in err.stack.split '\n'
            
            line = line.toString()
            
            # First line of the error message
            if line.split('(').length < 2 and line.split('/').length > 1
                temp = line.split('/')
                temp.shift()
                temp = '/' + temp.join('/')
                [name, lineno, char] = temp.split(':')
                extractRelevantLines name, lineno, char
                
            # Line doesn't contain a path
            if line.split('(').length < 2
                log red(line)
                continue
            
            [name, lineno, char] = line.split('(')[1].split(')')[0].split(':')
            
            # Only user or library files (not core node.js files have absolute paths)
            if name.split('/').length > 1
                extractRelevantLines name, lineno, char
            else
                pyellow line.split('at ')[1]
                
    catch e
        log 'EXCEPTION IN EXCEPTIONAL. THE WORLD IS GOING TO EXPLODE.'
        log e.message
        log e.stack
        

extractRelevantLines = (name, lineno, char) ->
    name = name.replace '.coffee', '.js'
    pyellow name

    lineno = parseInt lineno
    char   = parseInt char

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
        cur_lineno += 1
        if cur_lineno is lineno
            # - 2 because string indexes start at 0 but the error message's string index starts at 1
            # and we want '>' to appear one before the the actual error.
            l = _(l).splice(char - 2, 1, '>')            
            log red('\t' + cur_lineno + ": " + l)
        else
            log '\t' + cur_lineno + ": " + l