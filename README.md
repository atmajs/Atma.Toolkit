### Atma.js Toolkit


```bash
> npm install atma -g
# ...
> atma --help
```

```bash
> atma [action] [arg] [...] -KEY VALUE [...]
> atma [*.json | *.js | *.yml]
# Load Config and process
#   .json - JSON
#   .yml - yml
#   .js - JS Module, that exports tasks(s)
```

### Embedded Actions

- [Build](#build)
- [Shell](#shell)
- [Transpiler](#transpile)
- [Run scripts](#custom)
- [HTTP Server](#server)
- [Reference](#reference)
- [Generate](#gen)


_... some more, just run atma -help_

To get help from cli for a particular action run `$ atma actionName -help`

### Config

Configuration object consists from any number of actions/tasks you want to run.

_Javascript sample_
```javascript
// Single action
module.exports = ActionObject;

// Multiple actions
module.exports = [ActionObject, ActionObject, /*..*/];

// Grouped actions
module.exports = {
    groupName: ActionObject, // [ActionObject]
    otherGroup: ActionObject, // [ActionObject]
    
    // optional    
    defaults: ['groupName']
}

/*
 * Normally, if you run `atma config.js` then all grouped actions will be started,
 * but if `defaults` property is used, then only that groups will be activated.
 * Also you can run any group with: 'atma config.js groupName'
*/

```

#### ActionObject
```javascript
{
    action: 'NAME',
    // ... action configuration
}
```

If ActionObject is in a group, and that groupname has the name of existed action,
then you can ommit 'action' property
```javascript
module.exports = {
    copy: {
        // action: 'copy' - is not required
		files: {
			'filePath': 'destinationPath',
            // ...
		}
    }
}
```

## Actions

#### build

Application Builder for (IncludeJS)[http://atmajs.com/include]

Features:

- Combine **javascript** into a single file
    - extract all scripts from main HTML file
    - extract all nested scripts included with IncludeJS
    - preprocess javascript if coffeescript or any other supported loader is used

- Combine **style** into a single file
    - extract all style links from main HTML file
    - extract all nested styles included with IncludeJS
    - copy images or fonts, when located not in a working directory (e.g. are referened)
    - preprocess css if less or any other supported loader is used

- Combine **templates** into resulted HTML file
    - extract all nested IncludeJS `load`s and embed them into the HTML


```javascript
{
    "action": "build"
    
    // <String> — HTML input file
    "file": "index.dev.html",
    
    // <Boolean> — run MinifyJS and clean-css
    "minify": true,
    
    // <Object> - optional — UglifyJS compressor settings. @default {global_defs: {DEBUG: false}}
    "uglify": {} 
    "jshint" : {
        "options" : Object // — JSHINT options
        "globals" : Object // — global variables. @default {"window": false, "document": false}
        "ignore"  : Object // — file names to ignore
    }
    "outputMain": "index.html" // — output name of a built html
    "outputSources": "build/"  // — directory of combined/copied resources
}
```

#### project-import
```javascript
{
    action: "project-import"
}
```
Copy resources, that are used by current project, from referenced directories in .reference/* to .import directory

#### project-reference
```javascript
{
    action: "project-reference"
}
```
Switch back from "project-import" to resource referencing

#### transpiler
```javascript
{
	action: 'transpile',
	source: 'scripts/**.es6',
	extension: 'js'
}
# or many
{
	action: 'transpile',
	many:[
		{
			source: 'scripts/**.es6',
			extension: 'js'
		},
		{
			source: 'styles/**.less',
			extension: 'css'
		}
	]
}
```
```bash
atma transpile --source "scripts/**.es6" --extension js
```

Preprocess files and save at the same directory just with another extension. You can quickly transpile ES6 modules to ES5, LESS to CSS and so on.

To make transpiler work you have to install appropriate plugins: like [Atma.Babel](https://github.com/atmajs/atma-loader-babel)

**Watch files for changes: **
```bash
atma transpile --source "scripts/**.es6" --extension js --watch
# Have you set settings to configuration file?
atma run MyTranspiles --watch
```

#### shell
```javascript
{
    action: "shell",

    /* Commands: Array or String */
    command:  [
        "cmd /C copy /B index.html c:/app",
        "cmd /C copy /B index.build/ c:/app/index.build",
        // ... other commands
    ]

}
```
Execuate shell commands

#### custom
```javascript
{
    action: "custom",
    script: "scriptPath.js"
}
```
Or from CLI

```bash
> atma custom scriptPath
```

Custom script should export `process(config, done)` function
```javascript
// scriptPath.js

include.exports = {
    process: function(config, done){
        // config is current ActionObject - it can contain additional information
        // for a script

        // do smth. and call done if ready
        done(/* ?error */);
    }
}

@IMPORTANT

/*
    Any require(module) could also be resolved from global npm directory

    Example, you have installed jQuery globally - > npm install jquery -g
    and you can use it from the script as if it was installed in a directory, where
    scriptPath.js is located.

    var jquery = require('jquery');
    This is perfect for a cli scripting.

    Also you can use IncludeJS API here - as io.File:

    var content = new io.File('someTxt').read();

    new io.Directory().readFiles('*.txt).files.forEach(function(file){
        var txt = file.read() + '...';

        new io.File('path').write(txt);
    });
*/

```

### HTTP Server
```bash
$ atma server --help
```

Start http(s) server in current working directory.

```atma [action] -KEY VALUE```

```bash
> atma server -port 5500
```

### Reference (Symbolic Links)

```javascript
{
    "action": "reference"
    "path": directory path || name of a project from globals.txt
    "name": reference name /* optional @default directory name*/
}
```

```bash
> atma reference atmajs
```

Creates symbolic link in "%current directory%/.reference" folder


### gen

Scaffolding

```javascript
{
    action: "gen",
    name: "name"
}
```
```bash
> atma gen [name]
```

Templates:

- starter - MaskJS/mask.bindings/jmask/mask.compo/IncludeJS/Ruqq/jQuery
- compo - creates component template *.js/*.css/*.mask : ```> atma template compo desiredName"
- server - create node.js bootstrap project
- todoapp - creates todomvc sample application


You can create any other templates - just put all required files to:
``` %npm-global-directory%/node_modules/atma/template/%YourTemplateName% ```

### Download Atma Libraries

```bash
> atma atma-clone
# only primary libraries are cloned from github, to clone all:
> atma atma-clone --all
```

### Global Projects and default routes:

```bash
> atma globals
```

Sample:
```yml

projects:
    atma: 
        path: "file:///c:/Development/atma/"

defaultRoutes:
    atma_lib: 		"{atma}/{0}/lib/{1}.js"
    atma_ruqq: 		"{atma}/ruqq/lib/{0}.js"
    atma_compo: 	"{atma}/compos/{0}/lib/{1}.js"
    
```
