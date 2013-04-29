### IncludeJS Build Tool / nodejs "bash" scripts


@see [IncludeJS Project](http://libjs.it/#includeBuilder)


```bash
> npm install includejs -g
# ...
> ijs -help
```

```bash
> ijs [action] [arg] [...] -KEY VALUE [...]
> ijs [*.html] -minify -KEY VALUE
> ijs [*.config | *.js]
# Load Config and process
#   .config - JSON
#   .js - javascript should set config object to globals
```

### Config

Configuration object consists from any number of actions you want to run.
```javascript
// Single action
global.config = ActionObject;

// Multiple actions
global.config = [ActionObject, ActionObject, /*..*/];

// Grouped actions
global.config = {
    groupName: ActionObject, // [ActionObject]
    otherGroup: ActionObject, // [ActionObject]
    //? defaults: ['groupName']
}

/* normally, if you run "ijs config.js" then all grouped actions will be started,
   but if 'defaults' property is used, then only that groups will be activated.
   Also you can run any group with: 'ijs config.js groupName'
*/

```

### ActionObject
```javascript
{
    action: 'NAME',
    // ... action settings
}
```

If ActionObject is in a group, and that groupname has the name of existed action,
then you can ommit 'action' property
```javascript
global.config = {
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
It is actually the purpose this tool was created for - it combines all resources
included with IncludeJS in your app to a single one-page app

```javascript
{
    "action": "build"
    "file": "index.dev.html" // — {String} - HTML input file
    "minify": true, // — {Boolean} — run MinifyJS and clean-css
    "uglify": {} // — {Object:optional} - UglifyJS compressor settings. @default {global_defs: {DEBUG: false}}
    "jshint" : {
        "options" : // —  {Object} - JSHINT options
        "globals" : // —  {Object} - global variables. @default {"window": false, "document": false}
        "ignore"  : // —  {Object} - file names to ignore
    }
    "outputMain": "index.html" — output name of a built html"
    "outputSources": "build/" — directory of combined/copied resources"
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

#### Custom Scripts - (bash scripts)
```javascript
{
    action: "custom",
    script: "scriptPath.js"
}
```
Run any javascript

```bash
> ijs custom scriptPath
```

Custom script should export process(config, done){} function
````javascript
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

````

### Server
```javascrit
{
    action: 'server',
    port: 5777, // default 5777
    open: 'index.dev.html' // auto open file in browser
}
```

Start integrated server in a current working directory.

To start the server direct from command line, use cli action pattern

```ijs [action] -KEY VALUE```
```bash
> ijs server -port 5500
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
> ijs reference libjs
```

Creates symbolic link in "%current directory%/.reference" folder


### Template - Scaffolding
```javascript
{
    action: "template",
    name: "name"
}
```
```bash
> ijs template [name]
```

Templates:

- starter - MaskJS/mask.bindings/jmask/mask.compo/IncludeJS/Ruqq/jQuery
- compo - creates component template *.js/*.css/*.mask : ```> ijs template compo desiredName"

- todoapp - creates todomvc sample application

You can create any other templates - just put the files to:
```%npm-global-directory%/node_modules/includejs/template/%YourTemplateName%```

### Clone LibJS Libraries

```bash
> ijs git-clone
```

### Global Projects and default routes:

```bash
> ijs globals
```

Sample:
```javascript
{
	"projects":{
		"libjs" : {
			"path": "file:///c:/Development/libjs/"
		}
	},
	"defaultRoutes":{
		"lib": 			"{libjs}/{0}/lib/{1}.js",
        "ruqq": 		"{libjs}/ruqq/lib/{0}.js",
		"compo": 		"{libjs}/compos/{0}/lib/{1}.js"
	}
}
```
