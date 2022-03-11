
// source ./RootModule.js
(function(){
	
	var _node_modules_openurl_openurl = {};
var _src_Application = {};
var _src_action_Actions = {};
var _src_action_bump = {};
var _src_action_concat = {};
var _src_action_config = {};
var _src_action_copy = {};
var _src_action_custom = {};
var _src_action_help = {};
var _src_action_import = {};
var _src_action_plugin = {};
var _src_action_publish = {};
var _src_action_reference = {};
var _src_action_release = {};
var _src_action_server = {};
var _src_action_shell = {};
var _src_action_template = {};
var _src_action_transpile = {};
var _src_config_Config = {};
var _src_config_TaskSource = {};
var _src_helper_referenceHelper = {};
var _src_server_server = {};
var _src_server_server_middleware_proxy = {};
var _src_shell_Prompt = {};
var _src_shell_ShellStrategy = {};
var _src_utils_arr = {};

// source ./ModuleSimplified.js
var _src_utils_arr;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_utils_arr != null ? _src_utils_arr : {};
    var module = { exports: exports };

    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arr_each = void 0;
function arr_each(mix, fn) {
    if (Array.isArray(mix)) {
        mix.forEach(fn);
        return;
    }
    fn(mix, 0);
}
exports.arr_each = arr_each;
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_utils_arr === module.exports) {
        // do nothing if
    } else if (__isObj(_src_utils_arr) && __isObj(module.exports)) {
        Object.assign(_src_utils_arr, module.exports);
    } else {
        _src_utils_arr = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_config_TaskSource;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_config_TaskSource != null ? _src_config_TaskSource : {};
    var module = { exports: exports };

    "use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskSource = void 0;
var appcfg_1 = require("appcfg");
var atma_utils_1 = require("atma-utils");
var atma_io_1 = require("atma-io");
var arr_1 = _src_utils_arr;
var TaskSource = /** @class */ (function () {
    function TaskSource() {
        this.config = null;
        this.data = {
            sync: true
        };
    }
    TaskSource.prototype.read = function (rootConfig) {
        return __awaiter(this, void 0, void 0, function () {
            var file, action, tasks, config;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        file = getFile(rootConfig.$cli);
                        action = getAction(rootConfig);
                        if (action != null) {
                            delete rootConfig.tasks;
                            this.config = {
                                tasks: [action]
                            };
                            return [2 /*return*/, this];
                        }
                        if (file == null) {
                            if (rootConfig['tasks'] != null) {
                                tasks = rootConfig.tasks;
                                delete rootConfig.tasks;
                                this.config = {
                                    tasksAll: (0, atma_utils_1.obj_extend)({}, tasks),
                                    tasks: prepairTasks((0, atma_utils_1.obj_extend)({}, tasks), rootConfig),
                                    $prepairTasks: prepairTasks
                                };
                            }
                            return [2 /*return*/, this];
                        }
                        return [4 /*yield*/, appcfg_1.default.fetch([{
                                    path: file.uri.toLocalFile()
                                }])];
                    case 1:
                        config = _a.sent();
                        this.config = {
                            tasksAll: config.toJSON(),
                            tasks: prepairTasks(config.toJSON(), rootConfig),
                            $prepairTasks: prepairTasks
                        };
                        return [2 /*return*/, this];
                }
            });
        });
    };
    return TaskSource;
}());
exports.TaskSource = TaskSource;
;
// PRIVATE
function getFile($cli) {
    var configName = $cli.args[0], file;
    if (configName) {
        file = new atma_io_1.File(configName);
        if (file.exists())
            return file;
    }
    file = new atma_io_1.File('build.js');
    if (file.exists())
        return file;
}
function getAction(rootConfig) {
    var cli = rootConfig.$cli, action = cli.args[0];
    if (action in rootConfig.actions === false)
        return null;
    var config = {
        action: action,
        args: cli.args.slice(1)
    };
    for (var key in cli.params) {
        config[key] = cli.params[key];
    }
    return config;
}
function prepairTasks(tasks, rootConfig) {
    var _tasks = tasks;
    if (Array.isArray(tasks) === false) {
        if (typeof tasks === 'object' && tasks.action == null) {
            // assume this is grouped tasks
            var groups = getCurrentGroups(tasks, rootConfig), out_1 = [];
            for (var key in tasks) {
                // action could be also a group name
                if (typeof tasks[key] === 'object' && tasks[key].action == null) {
                    tasks[key].action = key;
                }
            }
            groups.forEach(function (groupName) {
                var cfg = tasks[groupName];
                if (cfg == null) {
                    logger.error('Config group name is undefined %s. Tasks: %s', groupName, tasks);
                }
                if (Array.isArray(cfg)) {
                    cfg.forEach(function (x) {
                        if (x == null) {
                            return;
                        }
                        if (typeof x === 'string') {
                            var config = tasks[x];
                            if (config == null) {
                                logger.error('Subarray contains no taks with the name: ', x);
                                return;
                            }
                            var obj = (0, atma_utils_1.obj_extend)({}, config);
                            obj.name = x;
                            out_1.push(obj);
                            return;
                        }
                        out_1.push(x);
                    });
                    return;
                }
                out_1.push(cfg);
            });
            tasks = out_1;
        }
        else {
            tasks = [tasks];
        }
    }
    var i = -1, imax = tasks.length;
    while (++i < imax) {
        var x = tasks[i];
        if (typeof x === 'string' && _tasks[x]) {
            if (_tasks[x] == null) {
                logger.error('Config name `%s` must be an Object or name of existing Task. Tasks: %s, All: %s', x, tasks, _tasks);
                return {};
            }
            x = tasks[i] = _tasks[x];
        }
        if (typeof x !== 'object') {
            logger.error('Config must be an Object or name of existing Task', x, i, imax, tasks);
            return {};
        }
        if ('file' in x) {
            parseFile(x);
            parseType(x);
        }
    }
    return tasks;
}
function parseFile(config) {
    var uri = new atma_utils_1.class_Uri(config.file);
    if (uri.isRelative())
        uri = new atma_utils_1.class_Uri(atma_utils_1.class_Uri.combine(process.cwd(), config.file));
    config.uri = uri.toString();
}
function parseType(config) {
    if (config.type)
        return;
    var ext = config.uri.extension, types = {
        htm: 'html',
        html: 'html',
        js: 'js',
        es6: 'js'
    };
    config.type = types[ext];
}
function getDefaults(obj) {
    return obj['defaults'] || obj['default'];
}
function getCurrentGroups(config, rootConfig) {
    var overrides = rootConfig.$cli, groups = [];
    if (overrides.args) {
        (0, arr_1.arr_each)(overrides.args, function (x) {
            if (config.hasOwnProperty(x)) {
                groups.push(x);
            }
        });
    }
    if (groups.length === 0 && getDefaults(config)) {
        (0, arr_1.arr_each)(getDefaults(config), function (x) {
            if (config.hasOwnProperty(x)) {
                groups.push(x);
                return;
            }
            logger.warn('GroupedConfig: Defaults contains not existed group name: ', x);
        });
    }
    //-delete config.defaults;
    if (groups.length === 0)
        groups = Object.keys(config);
    if (groups.length === 0)
        logger
            .warn('GroupedConfig: Defines no group names', config);
    logger(95)
        .log('GroupedConfig - groups/overrides', groups, overrides);
    return groups;
}
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_config_TaskSource === module.exports) {
        // do nothing if
    } else if (__isObj(_src_config_TaskSource) && __isObj(module.exports)) {
        Object.assign(_src_config_TaskSource, module.exports);
    } else {
        _src_config_TaskSource = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_config_Config;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_config_Config != null ? _src_config_Config : {};
    var module = { exports: exports };

    "use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
var alot_1 = require("alot");
var appcfg_1 = require("appcfg");
var atma_io_1 = require("atma-io");
var atma_utils_1 = require("atma-utils");
var TaskSource_1 = _src_config_TaskSource;
exports.Config = {
    Tasks: TaskSource_1.TaskSource,
    Utils: {
        config: {
            $resolvePathFromProject: cfg_resolvePathFromProject
        }
    },
    Configs: /** @class */ (function () {
        function class_1() {
            this.data = {
                sync: false,
            };
            this.config = {};
        }
        class_1.prototype.read = function (rootConfig) {
            return __awaiter(this, void 0, void 0, function () {
                var configs, config;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            configs = rootConfig.configs;
                            if (typeof configs !== 'string') {
                                return [2 /*return*/, this];
                            }
                            return [4 /*yield*/, appcfg_1.default.fetch([{
                                        path: configs
                                    }])];
                        case 1:
                            config = _a.sent();
                            this.config = config.toJSON();
                            return [2 /*return*/, this];
                    }
                });
            });
        };
        return class_1;
    }()),
    Plugins: /** @class */ (function () {
        function class_2() {
            this.data = {
                sync: true
            };
        }
        class_2.prototype.read = function (rootConfig) {
            return __awaiter(this, void 0, void 0, function () {
                function findPath(plugin) {
                    var cwd = atma_io_1.env.currentDir, uri = new atma_utils_1.class_Uri(cwd);
                    if (plugin[0] === '.' || plugin[0] === '/') {
                        var rel = uri.combine(plugin).toString();
                        if (atma_io_1.File.exists(rel)) {
                            return rel.toString();
                        }
                        return null;
                    }
                    var self = uri.combine("node_modules/".concat(plugin, "/package.json")).toString();
                    if (atma_io_1.File.exists(self)) {
                        return findPathInPackage(self.toString());
                    }
                    var atmaPlugin = base.combine("plugins/".concat(plugin, "/package.json")).toString();
                    if (atma_io_1.File.exists(atmaPlugin)) {
                        return findPathInPackage(atmaPlugin.toString());
                    }
                    var atmaNodeModules = base.combine("node_modules/".concat(plugin, "/package.json")).toString();
                    if (atma_io_1.File.exists(atmaNodeModules)) {
                        return findPathInPackage(atmaNodeModules.toString());
                    }
                    while (uri.path && uri.path !== '/') {
                        uri.cdUp();
                        var packageJson = uri.combine("node_modules/".concat(plugin, "/package.json")).toString();
                        if (atma_io_1.File.exists(packageJson)) {
                            return findPathInPackage(packageJson.toString());
                        }
                    }
                }
                function findPathInPackage(packagePath) {
                    var base = packagePath.substring(0, packagePath.lastIndexOf('/') + 1);
                    var path = [
                        "".concat(base, "index.js"),
                        "".concat(base, "lib/index.js")
                    ].find(atma_io_1.File.exists);
                    if (path) {
                        return path;
                    }
                    var json = atma_io_1.File.read(packagePath);
                    var script = typeof json.atmaPlugin === 'string' ? json.atmaPlugin : json.main;
                    var pathStr = new atma_utils_1.class_Uri(base).combine(script).toString();
                    if (atma_io_1.File.exists(pathStr)) {
                        return pathStr;
                    }
                    return null;
                }
                var plugins, base;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            plugins = rootConfig.plugins;
                            if (plugins == null || plugins.length === 0) {
                                return [2 /*return*/];
                            }
                            base = atma_io_1.env.applicationDir;
                            return [4 /*yield*/, (0, alot_1.default)(plugins).forEachAsync(function (plugin) { return __awaiter(_this, void 0, void 0, function () {
                                    var url, Plugin;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                url = findPath(plugin);
                                                if (url == null) {
                                                    logger
                                                        .error('<plugin 404>', plugin)
                                                        .warn('Did you forget to run `npm install %plugin-name%`?');
                                                    return [2 /*return*/];
                                                }
                                                return [4 /*yield*/, load(url)];
                                            case 1:
                                                Plugin = _a.sent();
                                                if ((Plugin === null || Plugin === void 0 ? void 0 : Plugin.register) == null) {
                                                    logger.error('<plugin> 404 - ', url);
                                                    return [2 /*return*/];
                                                }
                                                Plugin.register(rootConfig);
                                                return [2 /*return*/];
                                        }
                                    });
                                }); }).toArrayAsync()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        return class_2;
    }()),
    Projects: /** @class */ (function () {
        function class_3() {
            this.data = {
                sync: true
            };
        }
        class_3.prototype.read = function (rootConfig) {
            var _a;
            return __awaiter(this, void 0, void 0, function () {
                var routes, projects, key, path, projectName;
                return __generator(this, function (_b) {
                    routes = rootConfig.defaultRoutes;
                    projects = rootConfig.projects;
                    for (key in routes) {
                        path = routes[key];
                        projectName = (_a = /^\{([\w]+)\}/.exec(path)) === null || _a === void 0 ? void 0 : _a[1];
                        if (!projectName) {
                            continue;
                        }
                        routes[key] = path.replace('{' + projectName + '}', '/.reference/' + projectName);
                        if (projects[projectName] == null) {
                            logger.error('<config> projects - unknown project in default routes - ', projectName);
                        }
                    }
                    projects['atma_toolkit'] = {
                        path: atma_io_1.env.applicationDir.toString()
                    };
                    return [2 /*return*/, this];
                });
            });
        };
        return class_3;
    }()),
    Settings: /** @class */ (function () {
        function class_4() {
            this.data = {
                sync: true
            };
        }
        class_4.prototype.read = function (rootConfig) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (rootConfig.settings) {
                        if (rootConfig.settings.io) {
                            (0, atma_io_1.settings)(rootConfig.settings.io);
                        }
                        if (rootConfig.settings.include) {
                            include.cfg(rootConfig.settings.include);
                        }
                    }
                    return [2 /*return*/, this];
                });
            });
        };
        return class_4;
    }())
};
// Private
function cfg_resolvePathFromProject(path) {
    if (!path || path[0] !== '{')
        return path;
    var config = this;
    var match = /\{([\w]+)\}\//.exec(path), projectName = match && match[1], project = config.projects[projectName], projectPath = project && project.path;
    if (!projectPath) {
        logger.error('<config> Project could be not resolved - ', path);
        return path;
    }
    path = path.substring(match[0].length);
    return atma_utils_1.class_Uri.combine(projectPath, path);
}
function load(path) {
    return __awaiter(this, void 0, Promise, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) {
                    include
                        .instance(path)
                        .js(path + '::Plugin')
                        .done(function (resp) {
                        resolve(resp.Plugin);
                    });
                })];
        });
    });
}
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_config_Config === module.exports) {
        // do nothing if
    } else if (__isObj(_src_config_Config) && __isObj(module.exports)) {
        Object.assign(_src_config_Config, module.exports);
    } else {
        _src_config_Config = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_shell_ShellStrategy;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_shell_ShellStrategy != null ? _src_shell_ShellStrategy : {};
    var module = { exports: exports };

    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShellStrategy = void 0;
var ruta_1 = require("ruta");
exports.ShellStrategy = /** @class */ (function () {
    function class_1(strategy) {
        this.routes = new ruta_1.Collection();
        this.strategy = strategy;
        for (var key in strategy) {
            this.routes.add(key, strategy[key]);
        }
    }
    class_1.prototype.process = function (path, config, done) {
        var route = this.routes.get(path);
        if (route == null) {
            logger
                .warn('[available strategy]:'.bold)
                .log(Object.keys(this.strategy));
            done('Invalid arguments `' + path + '`');
        }
        route.value(route.current.params, config, done);
    };
    return class_1;
}());
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_shell_ShellStrategy === module.exports) {
        // do nothing if
    } else if (__isObj(_src_shell_ShellStrategy) && __isObj(module.exports)) {
        Object.assign(_src_shell_ShellStrategy, module.exports);
    } else {
        _src_shell_ShellStrategy = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_shell_Prompt;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_shell_Prompt != null ? _src_shell_Prompt : {};
    var module = { exports: exports };

    "use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Prompt = void 0;
var atma_utils_1 = require("atma-utils");
var Prompt = /** @class */ (function () {
    function Prompt() {
    }
    Prompt.prototype.prompt = function (str, callback) {
        Factory.create(new PromptAction(str, callback));
    };
    Prompt.prototype.confirm = function (str, callback) {
        Factory.create(new ConfirmAction(str + ' (y): ', callback));
    };
    return Prompt;
}());
exports.Prompt = Prompt;
;
var rl, factory_;
function initialize() {
    var readline = require('readline');
    rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
}
var Factory = /** @class */ (function () {
    function Factory() {
        this.collection = [];
        this.busy = false;
    }
    Factory.create = function (prompt) {
        if (rl == null) {
            initialize();
            factory_ = new Factory;
        }
        factory_.collection.push(prompt);
        factory_.process();
    };
    Factory.prototype.process = function () {
        if (this.busy)
            return;
        if (this.collection.length === 0)
            return;
        this.busy = true;
        this
            .collection
            .shift()
            .process()
            .always(this.next);
    };
    Factory.prototype.next = function () {
        this.busy = false;
        this.process();
    };
    return Factory;
}());
;
var PromptAction = /** @class */ (function (_super) {
    __extends(PromptAction, _super);
    function PromptAction(text, callback) {
        var _this = _super.call(this) || this;
        _this.text_ = '>';
        _this.callback_ = null;
        _this.text_ = text;
        _this.callback_ = callback;
        return _this;
    }
    PromptAction.prototype.process = function () {
        rl.resume();
        process.stdout.write('\n');
        rl.question(this.text_, this.onInput.bind(this));
        return this;
    };
    PromptAction.prototype.onInput = function (answer) {
        var _a;
        rl.pause();
        (_a = this.callback_) === null || _a === void 0 ? void 0 : _a.call(this, answer);
        this.resolve(answer);
    };
    return PromptAction;
}(atma_utils_1.class_Dfr));
;
var ConfirmAction = /** @class */ (function (_super) {
    __extends(ConfirmAction, _super);
    function ConfirmAction(text, callback) {
        var _this = _super.call(this, text, callback) || this;
        var original = _this.callback_;
        _this.callback_ = function (answer) {
            original(/^y|yes$/ig.test(answer));
        };
        return _this;
    }
    ConfirmAction.prototype.onInput = function (answer) {
        if (!answer) {
            this.process();
            return;
        }
        _super.prototype.onInput.call(this, answer);
    };
    return ConfirmAction;
}(PromptAction));
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_shell_Prompt === module.exports) {
        // do nothing if
    } else if (__isObj(_src_shell_Prompt) && __isObj(module.exports)) {
        Object.assign(_src_shell_Prompt, module.exports);
    } else {
        _src_shell_Prompt = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_action_bump;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_action_bump != null ? _src_action_bump : {};
    var module = { exports: exports };

    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BumpAction = void 0;
var atma_io_1 = require("atma-io");
exports.BumpAction = {
    help: {
        description: 'Increase the semver in `package.json | bower.json | component.json` from the CWD. \n `00` pattern, e.g. `0.11.54`',
        args: {},
    },
    process: function (config, done) {
        var version, file, pckg;
        if (config.fromPackage) {
            version = readVersion(config.fromPackage);
            if (version == null) {
                done(Error('Invalid package: ' + file.uri.toLocalFile()));
                return;
            }
        }
        files.forEach(function (filename) {
            file = new atma_io_1.File(filename, { cached: false });
            if (file.exists() === false)
                return;
            var source = file.read({ skipHooks: true });
            pckg = JSON.parse(source);
            if (version == null)
                version = increaseVersion(pckg.version);
            if (version == null) {
                logger.error('Invalid package version', filename, pckg.version);
                return;
            }
            logger.log('Update', filename.yellow.bold);
            source = source.replace(pckg.version, version);
            file.write(source);
        });
        if (version == null)
            return done('Invalid version');
        logger.log('New version:', version.bold);
        done(null, version);
    }
};
var files = [
    'package.json',
    'bower.json',
    'component.json'
];
function readVersion(mix) {
    var file = typeof mix === 'string'
        ? new atma_io_1.File(mix)
        : mix;
    var source = file.read({ skipHooks: true });
    try {
        return JSON.parse(source).version;
    }
    catch (error) {
        logger.error(file.uri.toLocalFile(), error);
    }
}
function increaseVersion(version) {
    if (typeof version !== 'string')
        return null;
    var parts = version
        .split('.')
        .map(function (x) { return Number(x) << 0; });
    if (parts.length !== 3) {
        logger.log('Invalid ver. pattern', version);
        return null;
    }
    if (++parts[2] >= 100) {
        if (++parts[1] >= 100) {
            ++parts[0];
            parts[1] = 0;
        }
        parts[2] = 0;
    }
    if (parts[1] >= 100) {
        parts[0]++;
        parts[1] = 0;
    }
    return parts.join('.');
}
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_action_bump === module.exports) {
        // do nothing if
    } else if (__isObj(_src_action_bump) && __isObj(module.exports)) {
        Object.assign(_src_action_bump, module.exports);
    } else {
        _src_action_bump = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_action_concat;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_action_concat != null ? _src_action_concat : {};
    var module = { exports: exports };

    "use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConcatAction = void 0;
var alot_1 = require("alot");
var atma_io_1 = require("atma-io");
/**
 *  Config {

        files: Array.String
        dist: String

    }
    */
exports.ConcatAction = {
    help: {
        description: 'Does simple file concatenation from a list of files',
        args: {
            files: '<array> file list',
            dist: '<string> output file destination'
        }
    },
    process: function (config, done) {
        return __awaiter(this, void 0, void 0, function () {
            var files, dist, output;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        files = config.files;
                        dist = config.dist;
                        if (files instanceof Array === false) {
                            done('Specify array of files to concatenate in {config}.files');
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, (0, alot_1.default)(files)
                                .map(function (str) { return new atma_io_1.File(str); })
                                .filterAsync(function (f) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, f.existsAsync()];
                                        case 1:
                                            if ((_a.sent()) === false) {
                                                console.error('<file-concat: 404>', f.uri.toLocalFile());
                                                return [2 /*return*/, false];
                                            }
                                            return [2 /*return*/, true];
                                    }
                                });
                            }); })
                                .mapAsync(function (f) { return f.readAsync(); })
                                .toArrayAsync()];
                    case 1:
                        output = _a.sent();
                        return [4 /*yield*/, atma_io_1.File.writeAsync(dist, output.join(''))];
                    case 2:
                        _a.sent();
                        done();
                        return [2 /*return*/];
                }
            });
        });
    }
};
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_action_concat === module.exports) {
        // do nothing if
    } else if (__isObj(_src_action_concat) && __isObj(module.exports)) {
        Object.assign(_src_action_concat, module.exports);
    } else {
        _src_action_concat = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _node_modules_openurl_openurl;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _node_modules_openurl_openurl != null ? _node_modules_openurl_openurl : {};
    var module = { exports: exports };

    var spawn = require('child_process').spawn;

var command;

switch(process.platform) {
    case 'darwin':
        command = 'open';
        break;
    case 'win32':
        command = 'explorer.exe';
        break;
    case 'linux':
        command = 'xdg-open';
        break;
    default:
        throw new Error('Unsupported platform: ' + process.platform);
}

/**
 * Error handling is deliberately minimal, as this function is to be easy to use for shell scripting
 *
 * @param url The URL to open
 * @param callback A function with a single error argument. Optional.
 */

function open(url, callback) {
    var child = spawn(command, [url]);
    var errorText = "";
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', function (data) {
        errorText += data;
    });
    child.stderr.on('end', function () {
        if (errorText.length > 0) {
            var error = new Error(errorText);
            if (callback) {
                callback(error);
            } else {
                throw error;
            }
        } else if (callback) {
            callback(error);
        }
    });
}

/**
 * @param fields Common fields are: "subject", "body".
 *     Some email apps let you specify arbitrary headers here.
 * @param recipientsSeparator Default is ",". Use ";" for Outlook.
 */
function mailto(recipients, fields, recipientsSeparator, callback) {
    recipientsSeparator = recipientsSeparator || ",";

    var url = "mailto:"+recipients.join(recipientsSeparator);
    Object.keys(fields).forEach(function (key, index) {
        if (index === 0) {
            url += "?";
        } else {
            url += "&";
        }
        url += key + "=" + encodeURIComponent(fields[key]);
    });
    open(url, callback);
}

exports.open = open;
exports.mailto = mailto;;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_node_modules_openurl_openurl === module.exports) {
        // do nothing if
    } else if (__isObj(_node_modules_openurl_openurl) && __isObj(module.exports)) {
        Object.assign(_node_modules_openurl_openurl, module.exports);
    } else {
        _node_modules_openurl_openurl = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_action_config;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_action_config != null ? _src_action_config : {};
    var module = { exports: exports };

    "use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigAction = void 0;
var atma_io_1 = require("atma-io");
exports.ConfigAction = {
    help: {
        description: 'Opens Atma.Toolkit global configuration file'
    },
    process: function (config, done) {
        return __awaiter(this, void 0, void 0, function () {
            var path, file;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        path = atma_io_1.env.appdataDir.combine('config.yml');
                        file = new atma_io_1.File(path);
                        return [4 /*yield*/, file.existsAsync()];
                    case 1:
                        if (!((_a.sent()) === false)) return [3 /*break*/, 3];
                        return [4 /*yield*/, file.writeAsync({ projects: {} })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _node_modules_openurl_openurl.open(file.uri.toString());
                        done();
                        return [2 /*return*/];
                }
            });
        });
    }
};
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_action_config === module.exports) {
        // do nothing if
    } else if (__isObj(_src_action_config) && __isObj(module.exports)) {
        Object.assign(_src_action_config, module.exports);
    } else {
        _src_action_config = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_action_copy;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_action_copy != null ? _src_action_copy : {};
    var module = { exports: exports };

    "use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopyAction = void 0;
var alot_1 = require("alot");
var atma_io_1 = require("atma-io");
var atma_utils_1 = require("atma-utils");
exports.CopyAction = {
    help: {
        description: 'Copy files with glob pattern support',
        args: {
            'files': '<object> fileName: fileDestination'
        },
        example: [
            {
                files: {
                    '/dev/index.html': '/release/index.html',
                    '/src/**': '/release/src/**'
                }
            }
        ]
    },
    process: function (config, done) {
        return __awaiter(this, void 0, void 0, function () {
            var files, source, target, output;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        files = config.files;
                        if (files == null || typeof files !== 'object') {
                            done('Copy Action: Define files in "files" property as object {source: target}');
                            return [2 /*return*/];
                        }
                        for (source in files) {
                            if (source.indexOf('*') === -1)
                                continue;
                            target = files[source].replace(/\*+$/, '');
                            target = path_ensureTrailingSlash(target);
                            delete files[source];
                            atma_io_1.Directory
                                .readFiles(source)
                                .forEach(function (file) {
                                var _relative = file.uri.toRelativeString(atma_io_1.env.currentDir), _source = file.uri.toString(), _path = glob_getCalculatedPath(_relative, source);
                                files[_source] = atma_utils_1.class_Uri.combine(target, _path);
                            });
                        }
                        return [4 /*yield*/, (0, alot_1.default)(files)
                                .map(function (str) { return new atma_io_1.File(str); })
                                .filterAsync(function (f) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, f.existsAsync()];
                                        case 1:
                                            if ((_a.sent()) === false) {
                                                console.error('<file-copy: 404>', f.uri.toLocalFile());
                                                return [2 /*return*/, false];
                                            }
                                            return [2 /*return*/, true];
                                    }
                                });
                            }); })
                                .forEachAsync(function (f) { return f.copyToAsync(target); })
                                .toArrayAsync()];
                    case 1:
                        output = _a.sent();
                        done();
                        return [2 /*return*/];
                }
            });
        });
    }
};
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_action_copy === module.exports) {
        // do nothing if
    } else if (__isObj(_src_action_copy) && __isObj(module.exports)) {
        Object.assign(_src_action_copy, module.exports);
    } else {
        _src_action_copy = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_action_custom;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_action_custom != null ? _src_action_custom : {};
    var module = { exports: exports };

    "use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomAction = void 0;
var atma_io_1 = require("atma-io");
var atma_utils_1 = require("atma-utils");
exports.CustomAction = {
    help: {
        description: 'Run custom script',
        args: {
            'script': '<string> script path'
        },
        example: [
            '$ atma custom myscript.js',
            {
                action: 'custom',
                script: 'foo/myscript.js'
            }
        ]
    },
    process: function (config, done) {
        return __awaiter(this, void 0, void 0, function () {
            var script, ext, extension, base, url;
            return __generator(this, function (_a) {
                script = config.script;
                if (script && typeof script.process === 'function') {
                    include
                        .instance(atma_io_1.env.currentDir.toString());
                    script
                        .process(config, done);
                    return [2 /*return*/];
                }
                if (config.args && !script)
                    script = config.args[0];
                if (!script) {
                    done('Custom script not defined - via cli: $ atma custom name.js, via config: define script property');
                    return [2 /*return*/];
                }
                ext = /\.[\w]{1,5}$/;
                if (ext.test(script) === false) {
                    extension = ['.js', '.ts'].find(function (x) {
                        return atma_io_1.File.exists(script + x);
                    });
                    if (extension) {
                        script += extension;
                    }
                }
                if (atma_io_1.File.exists(script) === false) {
                    done("Custom script '".concat(script, "' not resolved in ").concat(process.cwd(), "."));
                    return [2 /*return*/];
                }
                script = script.replace(/\\/g, '/');
                base = process.cwd().replace(/\\/g, '/');
                url = atma_utils_1.class_Uri.combine('file:///', base, script);
                include
                    .instance(url)
                    .js(url + '::Script')
                    .done(function (resp) {
                    if (resp.Script && resp.Script.process) {
                        resp.Script.process(config, done);
                        return;
                    }
                });
                return [2 /*return*/];
            });
        });
    }
};
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_action_custom === module.exports) {
        // do nothing if
    } else if (__isObj(_src_action_custom) && __isObj(module.exports)) {
        Object.assign(_src_action_custom, module.exports);
    } else {
        _src_action_custom = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_action_help;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_action_help != null ? _src_action_help : {};
    var module = { exports: exports };

    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelpAction = void 0;
var tab = 1;
function write(message, indent) {
    if (indent === void 0) { indent = 0; }
    indent += tab;
    var pref = '';
    while (--indent > -1)
        pref += '   ';
    logger.log(pref + message.color.white);
}
function newLine() {
    write('');
}
exports.HelpAction = {
    process: function () {
        console.log('HELP');
        logger.cfg('logCaller', false);
        var actions = app.config.actions, args = app.config.$cli.args, action = args[0];
        newLine();
        newLine();
        if (action) {
            help_action(action);
        }
        else {
            help_generic();
        }
        newLine();
    }
};
/*
 *      Utils
 */
function help_generic() {
    write('bg_green<bold<Atma Toolkit>> usage:');
    newLine();
    write('$ atma [action] [arguments ...]'.cyan, 1);
    write('$ atma [config path] [arguments ...]'.cyan, 1);
    newLine();
    write('Some actions can be run direct from cli,');
    write('but some only via configuration file,');
    write('as they require complex arguments');
    newLine();
    write('Actions:'.bold, 1);
    Object.keys(app.config.actions).forEach(function (action) {
        write(action, 2);
    });
    newLine();
    write('To get more help for each action enter:', 1);
    write('$ atma [action] --help'.cyan, 2);
    newLine();
    write('In case of any issue, please contact green<bold<team@atma.dev>>');
    write('You can also attach a log output:');
    write('$ atma [arguments] --level 99 --no-color > output.log'.cyan, 1);
    newLine();
    write('Happy Coding.');
}
function help_action(action) {
    if (action in app.config.actions === false) {
        logger.error('Action not found: ', action);
        logger.log('$ atma --help'.bold);
        return;
    }
    logger.log(' Action: bold<%s>'.color.white, action);
    app
        .findAction(action)
        .done(function (handler) {
        var help = handler.help;
        if (handler.strategy) {
            if (help == null)
                help = {};
            help.routes = Object.keys(handler.strategy);
        }
        if (help == null) {
            logger.log('< no help information yet >');
            return;
        }
        logger.log(help);
    });
}
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_action_help === module.exports) {
        // do nothing if
    } else if (__isObj(_src_action_help) && __isObj(module.exports)) {
        Object.assign(_src_action_help, module.exports);
    } else {
        _src_action_help = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_action_import;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_action_import != null ? _src_action_import : {};
    var module = { exports: exports };

    "use strict";
/**
 *  Config {

        files: Array | String
        output: Array | String // Directory Path, if this is a string same directory is used for all processed files
 }
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportAction = void 0;
var atma_io_1 = require("atma-io");
var atma_utils_1 = require("atma-utils");
exports.ImportAction = {
    help: {
        description: 'Perfom import operations on specified files',
        args: {
            files: '<array|string> source file(s) (supports glob)',
            output: '<string> output directory or file pattern'
        },
        example: [
            '$ atma import -files build/ -output release/',
            '$ atma import -files build/lib.js -output release/lib.js',
            '$ atma import -files foo.js;bar.js -output release/',
            '$ atma import -files foo.js;bar.js -output release/{filename}_build.js',
            {
                files: 'build/',
                output: 'release/'
            }
        ]
    },
    process: function (config, done) {
        var files = config.files, output = config.output;
        if (typeof files === 'string') {
            if (~files.indexOf('*')) {
                files = atma_io_1.Directory
                    .readFiles(files)
                    .map(function (x) {
                    return x.uri.toString();
                });
            }
            else {
                files = files.split(';');
            }
        }
        if (typeof output === 'string' && ~output.indexOf(';')) {
            output = output.split(';');
        }
        if (Array.isArray(files) === false) {
            done('Specify single/array of file(s) to process in {config}.files');
            return;
        }
        atma_io_1.File
            .getHookHandler()
            .register({
            regexp: /./,
            method: 'read',
            handler: 'atma-io-middleware-importer',
            zIndex: 100
        }, null, null);
        atma_io_1.File
            .clearCache();
        files.forEach(function (x, index) {
            var file = new atma_io_1.File(x);
            if (file.exists() == false) {
                logger.error('<action:importer> | File not exists - ', file.uri.toLocalFile());
                return;
            }
            var dist = output instanceof Array ? output[index] : output;
            if (!dist) {
                logger.error('output not defined at %s for %s', index, file.uri.file);
                return;
            }
            if (dist.indexOf('{') !== -1) {
                dist = output_fromPattern(dist, file.uri);
            }
            if (/\.[\w]{1,6}/g.test(dist)) {
                // is file
            }
            else {
                dist = output_fromDirectory(dist, file.uri);
            }
            var content = file.read(config);
            new atma_io_1.File(dist)
                .write(content);
            logger.log('Done - ', file.uri.file);
        });
        atma_io_1.File
            .getHookHandler()
            .unregister('read', 'atma-io-middleware-importer');
        done();
    }
};
function output_fromDirectory(ouput, fileUri) {
    return atma_utils_1.class_Uri.combine(ouput, fileUri.file);
}
function output_fromPattern(output, fileUri) {
    return output.replace(/\{(\w+)\}/g, function (full, pattern) {
        switch (pattern) {
            case 'filename':
                return fileUri.getName();
            case 'extension':
                return fileUri.extension;
            default:
                logger.error('Invalid filepattern', pattern, 'Expect: {filename}, {extension}');
                throw Error('Invalid filepattern, expect');
        }
    });
}
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_action_import === module.exports) {
        // do nothing if
    } else if (__isObj(_src_action_import) && __isObj(module.exports)) {
        Object.assign(_src_action_import, module.exports);
    } else {
        _src_action_import = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_action_plugin;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_action_plugin != null ? _src_action_plugin : {};
    var module = { exports: exports };

    "use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginAction = void 0;
var atma_io_1 = require("atma-io");
var shellbee_1 = require("shellbee");
exports.PluginAction = {
    help: {
        description: 'Install Atma Plugins to the CWD or to the global Atma path',
    },
    strategy: (_a = {},
        _a['^install/:pluginName??:global(g|global):save-dev'] = function (params, config, done) {
            var pluginName = params.pluginName;
            if (params.global != null) {
                install_npmGlobal(pluginName, function (code) {
                    if (code === 0)
                        install_writeMetaGlobal(pluginName);
                    done(code);
                });
                return;
            }
            install_npmLocal(pluginName, params['save-dev'] != null, function (error) {
                if (error == null)
                    install_writeMetaLocal(pluginName);
                done(error);
            });
        },
        _a)
};
function install_writeMetaLocal(pluginName) {
    var file = new atma_io_1.File('package.json'), package_ = {};
    if (file.exists())
        package_ = file.read();
    if (package_.atma == null)
        package_.atma = {};
    if (package_.atma.plugins == null)
        package_.atma.plugins = [];
    var shouldWrite = false;
    if (package_.atma.plugins.indexOf(pluginName) === -1) {
        shouldWrite = true;
        package_.atma.plugins.push(pluginName);
    }
    if (package_.atma.settings == null) {
        package_.atma.settings = {};
    }
    if (package_.atma.settings[pluginName] == null) {
        shouldWrite = true;
        package_.atma.settings[pluginName] = {};
        var pluginPackage = 'node_modules/' + pluginName + '/package.json';
        if (atma_io_1.File.exists(pluginPackage)) {
            var obj = atma_io_1.File.read(pluginPackage).defaultSettings;
            if (obj) {
                package_.atma.settings[pluginName] = obj;
            }
        }
    }
    shouldWrite && file.write(package_);
}
function install_writeMetaGlobal(pluginName) {
    var plugins = app.config.$get('plugins');
    if (plugins && plugins.indexOf(pluginName) !== -1)
        return;
    app.config.$write({
        plugins: [pluginName]
    });
}
function install_npmLocal(pluginName, saveDev, done) {
    return __awaiter(this, void 0, void 0, function () {
        var save, process;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    save = saveDev ? '--save-dev' : '--save';
                    return [4 /*yield*/, shellbee_1.Shell.run({
                            command: 'npm install ' + save + ' ' + pluginName
                        })];
                case 1:
                    process = _a.sent();
                    process.onCompleteAsync().then(done, done);
                    return [2 /*return*/];
            }
        });
    });
}
function install_npmGlobal(pluginName, done) {
    return __awaiter(this, void 0, void 0, function () {
        var path, process;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    path = atma_io_1.env.applicationDir.toLocalDir();
                    return [4 /*yield*/, shellbee_1.Shell.run({
                            command: 'npm install ' + pluginName,
                            cwd: path
                        })];
                case 1:
                    process = _a.sent();
                    process.onCompleteAsync().then(done, done);
                    return [2 /*return*/];
            }
        });
    });
}
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_action_plugin === module.exports) {
        // do nothing if
    } else if (__isObj(_src_action_plugin) && __isObj(module.exports)) {
        Object.assign(_src_action_plugin, module.exports);
    } else {
        _src_action_plugin = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_action_publish;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_action_publish != null ? _src_action_publish : {};
    var module = { exports: exports };

    "use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublishAction = void 0;
var shellbee_1 = require("shellbee");
exports.PublishAction = {
    help: {
        description: [
            'Commit all changes with message and push to git and npm'
        ],
        args: {
            m: 'commit message'
        },
    },
    process: function (config, done) {
        var message = config.m;
        this.bump(function (error, version) {
            if (error) {
                done(error);
                return;
            }
            if (message == null) {
                message = "v".concat(version);
            }
            var branch = 'master';
            var publish = [
                'npm run build',
                'git add -A',
                "git commit -a -m \"publish: ".concat(message, "\""),
                'git push origin ' + branch,
                'npm publish',
            ];
            runCommands(publish, done);
        });
    },
    runCommands: function (commands, done) {
        runCommands(commands, done);
    },
    bump: function (done) {
        app
            .findAction('bump')
            .done(function (action) {
            action.process({}, done);
        });
    }
};
function runCommands(commands, done) {
    return __awaiter(this, void 0, void 0, function () {
        var shell;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, shellbee_1.Shell.run({
                        commands: commands
                    })];
                case 1:
                    shell = _a.sent();
                    return [4 /*yield*/, shell.onCompleteAsync()];
                case 2:
                    _a.sent();
                    done();
                    return [2 /*return*/];
            }
        });
    });
}
;
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_action_publish === module.exports) {
        // do nothing if
    } else if (__isObj(_src_action_publish) && __isObj(module.exports)) {
        Object.assign(_src_action_publish, module.exports);
    } else {
        _src_action_publish = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_helper_referenceHelper;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_helper_referenceHelper != null ? _src_helper_referenceHelper : {};
    var module = { exports: exports };

    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.referenceHelper = void 0;
var atma_io_1 = require("atma-io");
var referenceHelper;
(function (referenceHelper) {
    function create(solutionDir, name, referenceSource) {
        var dir = new atma_io_1.Directory(referenceSource);
        if (dir.exists() == false) {
            logger.error('Directory do not exist.');
            return;
        }
        if (name == null) {
            name = dir.getName();
        }
        var targetDir = new atma_io_1.Directory(solutionDir.combine('.reference/' + name + '/'));
        if (targetDir.exists()) {
            logger.error('Reference with the name "%s" already exists', name);
            return;
        }
        new atma_io_1.Directory(solutionDir.combine('.reference/')).ensure();
        atma_io_1.Directory.symlink(dir.uri.toLocalDir(), targetDir.uri.toLocalDir());
    }
    referenceHelper.create = create;
})(referenceHelper = exports.referenceHelper || (exports.referenceHelper = {}));
;
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_helper_referenceHelper === module.exports) {
        // do nothing if
    } else if (__isObj(_src_helper_referenceHelper) && __isObj(module.exports)) {
        Object.assign(_src_helper_referenceHelper, module.exports);
    } else {
        _src_helper_referenceHelper = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_action_reference;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_action_reference != null ? _src_action_reference : {};
    var module = { exports: exports };

    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferenceAction = void 0;
var atma_io_1 = require("atma-io");
var referenceHelper_1 = _src_helper_referenceHelper;
exports.ReferenceAction = {
    help: {
        description: 'Reference a library: Create symlink to its folder',
        args: {
            path: '<string> Path to a library OR project name to get from globals',
            name: '<?string> folder name in .reference/, @default is a referenced folder name'
        },
        examples: [
            '$ atma reference atmajs'
        ]
    },
    process: function (config, done) {
        var args = process.argv, path = config.path || args[3], name = config.name || args[4], projects = app.config.projects;
        if (!projects) {
            return done('config/projects.txt contains no projects');
        }
        if (projects.hasOwnProperty(path)) {
            name = path;
            path = projects[name].path;
        }
        if (!path || atma_io_1.Directory.exists(path) === false) {
            return done('Symbolic link points to undefined path: ' + path);
        }
        referenceHelper_1.referenceHelper.create(atma_io_1.env.currentDir, name, path);
        return done && done();
    }
};
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_action_reference === module.exports) {
        // do nothing if
    } else if (__isObj(_src_action_reference) && __isObj(module.exports)) {
        Object.assign(_src_action_reference, module.exports);
    } else {
        _src_action_reference = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_action_release;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_action_release != null ? _src_action_release : {};
    var module = { exports: exports };

    "use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReleaseAction = void 0;
var atma_io_1 = require("atma-io");
var shellbee_1 = require("shellbee");
exports.ReleaseAction = {
    help: {
        description: [
            'Increase the version in `package.json | bower.json | component.json`',
            '`npm run build` the project',
            'Commit and push version',
            '`npm publish` the project',
            'Checkout `release` branch',
            'Remove files not for `release`',
            'Commit and push changes',
            'Create and push the git tag using current version',
            'Checkout back to master'
        ],
        args: {
            release: 'Array, default: lib/**, vendor/**, readme.md, package.json, bower.json',
            branch: 'String, Current active branch, default: master',
            afterBump: 'Array, additional commands after bump',
            afterPublish: 'Array, additional commands after publishing',
        },
    },
    process: function (config, done) {
        var branch = config.branch || 'master';
        var includes = config.release || (app.config.settings && app.config.settings.release) || [
            'lib/**',
            'vendor/**',
            'readme.md',
            'package.json',
            'bower.json'
        ];
        var afterBump = config.afterBump || [], afterPublish = config.afterPublish || [];
        this.bump(function (error, version) {
            if (error) {
                done(error);
                return;
            }
            var publish = [
                npm_run('beforeRelease'),
                npm_run('build'),
                'git add -A',
                'git commit -a -m "v' + version + '"',
                'git push origin ' + branch,
                (function () {
                    if (atma_io_1.File.exists('package.json') === false)
                        return null;
                    var pckg = atma_io_1.File.read('package.json');
                    if (typeof pckg === 'string')
                        pckg = JSON.parse(pckg);
                    var name = pckg.name;
                    if (name && name !== '-')
                        return 'npm publish';
                    return null;
                }()),
                'git checkout -B release',
                function () {
                    ignoreFile_create(includes);
                },
                'git rm -r --cached .',
                'git add -A',
                'git commit -a -m "v' + version + '"',
                'git push origin release -ff',
                'git tag v' + version,
                'git push --tags',
                function () {
                    ignoreFile_reset();
                },
                'git checkout ' + branch + ' -ff'
            ];
            var commands = afterBump
                .concat(publish)
                .concat(afterPublish);
            runCommands(commands, done);
        });
    },
    includeFiles: {
        create: function (includes) {
            ignoreFile_create(includes);
        },
        reset: function () {
            ignoreFile_reset();
        }
    },
    runCommands: function (commands, done) {
        runCommands(commands, done);
    },
    bump: function (done) {
        app
            .findAction('bump')
            .done(function (action) {
            action.process({}, done);
        });
    }
};
var npm_run;
(function () {
    var pckg = null;
    npm_run = function (action) {
        if (pckg == null)
            _load();
        if (action in pckg) {
            return 'npm run ' + action;
        }
        return null;
    };
    function _load() {
        if (atma_io_1.File.exists('package.json') === false) {
            pckg = {};
            return;
        }
        pckg = atma_io_1.File.read('package.json');
        if (typeof pckg === 'string') {
            pckg = JSON.parse(pckg);
        }
    }
}());
var ignoreFile_create, ignoreFile_reset;
(function () {
    var GIT_IGNORE = '.gitignore';
    var _gitignore;
    ignoreFile_create = function (includes) {
        _gitignore = atma_io_1.File.read(GIT_IGNORE);
        var cwd = atma_io_1.env.currentDir;
        var files = includes.reduce(function (aggr, path) {
            if (path.indexOf('*') !== -1) {
                var files = atma_io_1.glob
                    .readFiles(path)
                    .map(function (file) {
                    path = file.uri.toRelativeString(cwd);
                    addFolder(aggr, path);
                    return path;
                });
                aggr = aggr.concat(files);
                return aggr;
            }
            aggr.push(path);
            return aggr;
        }, []);
        var lines = ['*'];
        lines = lines.concat(includes
            .filter(function (path) {
            return path.indexOf('/') !== -1;
        })
            .map(function (path) {
            return '!' + path.substring(0, path.lastIndexOf('/') + 1);
        }));
        lines = lines.concat(files.map(function (filename) {
            return '!' + filename;
        }));
        atma_io_1.File.write(GIT_IGNORE, lines.join('\n'));
        logger.log('gitignore:'.cyan, atma_io_1.File.read(GIT_IGNORE));
    };
    ignoreFile_reset = function () {
        if (!_gitignore) {
            atma_io_1.File.remove(GIT_IGNORE);
            return;
        }
        atma_io_1.File.write(GIT_IGNORE, _gitignore);
    };
    function addFolder(arr, path) {
        var dir = path.substring(0, path.lastIndexOf('/') + 1);
        if (dir && arr.indexOf(dir) === -1) {
            arr.push(dir);
        }
        if (dir.length > 1) {
            addFolder(arr, dir.substring(0, dir.length - 1));
        }
    }
}());
function runCommands(commands, done) {
    return __awaiter(this, void 0, void 0, function () {
        var shell;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, shellbee_1.Shell.run({
                        commands: commands
                    })];
                case 1:
                    shell = _a.sent();
                    return [4 /*yield*/, shell.onCompleteAsync()];
                case 2:
                    _a.sent();
                    done();
                    return [2 /*return*/];
            }
        });
    });
}
;
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_action_release === module.exports) {
        // do nothing if
    } else if (__isObj(_src_action_release) && __isObj(module.exports)) {
        Object.assign(_src_action_release, module.exports);
    } else {
        _src_action_release = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_server_server_middleware_proxy;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_server_server_middleware_proxy != null ? _src_server_server_middleware_proxy : {};
    var module = { exports: exports };

    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.proxify = void 0;
var http_ = require("http");
var https_ = require("https");
var url_ = require("url");
var path_ = require("path");
var proxyPath = null, matcher = null, proxyOptions = { followRedirects: false, proxyCache: false }, CACHE = [];
var Proxy = /** @class */ (function () {
    function Proxy() {
    }
    Proxy.set = function (path) {
        proxyPath = path;
    };
    Proxy.setMatcher = function (mix) {
        matcher = mix;
    };
    Proxy.pipe = function (req, res) {
        if (!proxyPath) {
            return false;
        }
        if (typeof matcher === 'function') {
            if (!matcher(req.url)) {
                return false;
            }
        }
        if (matcher === null || matcher === void 0 ? void 0 : matcher.test) {
            if (!matcher.test(req.url)) {
                return false;
            }
        }
        var headers = req.headers, method = req.method, url = url_.resolve(proxyPath, req.url);
        var options = {
            method: method,
            headers: extend({}, headers),
            agent: false,
        };
        logger(60)
            .log('<server:proxy>', url, method);
        pipe(req, res, options, url);
        return true;
    };
    return Proxy;
}());
;
var proxify = function (proxyPath, opts) {
    if (proxyPath) {
        Proxy.set(proxyPath);
    }
    if (opts) {
        if (opts.followRedirects != null) {
            proxyOptions.followRedirects = opts.followRedirects;
        }
        if (opts.proxyCache != null) {
            proxyOptions.proxyCache = opts.proxyCache;
        }
    }
    return function (req, res, next) {
        if (!proxyPath)
            return next();
        Proxy.pipe(req, res);
    };
};
exports.proxify = proxify;
function pipe(req, res, options_, remoteUrl, redirects) {
    if (redirects == null)
        redirects = 0;
    if (redirects > 10) {
        res.writeHead(500, {
            'content-type': 'text/plain'
        });
        res.end('Too much redirects, last url: ' + remoteUrl);
        return;
    }
    var remote = url_.parse(remoteUrl), options = {}, isCachable = CacheHelper.isCachable(req);
    if (isCachable && CacheHelper.fromCache(req, res)) {
        return;
    }
    extend(options, options_);
    extend(options, remote);
    options.headers.host = remote.host;
    delete options.headers.connection;
    var client = remote.protocol === 'https:'
        ? https_
        : http_;
    var request = client.request(options, function (response) {
        var code = response.statusCode;
        if (code === 301 || code === 302) {
            var location = response.headers.location;
            if (location) {
                location = locationNormalize(location, req);
                if (proxyOptions.followRedirects) {
                    pipe(req, res, options_, location, ++redirects);
                    return;
                }
                if (location.indexOf(proxyPath) > -1) {
                    var path = location.replace(proxyPath, '');
                    var host = resolveHostForRedirect(req);
                    response.headers.location = host + path;
                }
            }
        }
        res.writeHead(code, response.headers);
        if (isCachable) {
            var chunks_1 = [];
            response
                .on('data', function (chunk) {
                chunks_1.push(chunk);
                res.write(chunk);
            })
                .on('end', function () {
                res.end();
                var buffer = Buffer.concat(chunks_1);
                CacheHelper.saveCache(req, code, response.headers, buffer);
            });
        }
        else {
            response.pipe(res);
        }
    });
    req.pipe(request);
}
function extend(target, source) {
    for (var key in source) {
        if (source[key] != null) {
            target[key] = source[key];
        }
    }
    return target;
}
function resolveHostForRedirect(req) {
    if (req.headers.origin != null) {
        return req.headers.origin;
    }
    if (req.headers.host) {
        return (req.connection.encrypted ? 'https' : 'http') + '://' + req.headers.host;
    }
    return '/';
}
function locationNormalize(location, req) {
    if (location[0] === '/') {
        location = path_.join(proxyPath, location);
    }
    location = location.replace(/\\/g, '/');
    if (/^\w+:\/[^\/]/.test(location)) {
        location = location.replace('/', '//');
    }
    return location;
}
var CacheHelper = {
    isCachable: function (req) {
        if (proxyOptions.proxyCache === false) {
            return false;
        }
        var method = req.method.toLowerCase();
        if (method !== 'get' && method !== 'options') {
            return false;
        }
        return true;
    },
    fromCache: function (req, res) {
        var cache = this.getCache(req);
        if (cache == null) {
            return false;
        }
        res.writeHead(cache.code, cache.headers);
        res.end(cache.body);
        return true;
    },
    saveCache: function (req, code, headers, body) {
        var cache = {
            url: req.url,
            method: req.method,
            code: code,
            headers: headers,
            body: body
        };
        CACHE.push(cache);
    },
    getCache: function (req) {
        return CACHE.find(function (x) { return x.url === req.url && x.method === req.method; });
    }
};
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_server_server_middleware_proxy === module.exports) {
        // do nothing if
    } else if (__isObj(_src_server_server_middleware_proxy) && __isObj(module.exports)) {
        Object.assign(_src_server_server_middleware_proxy, module.exports);
    } else {
        _src_server_server_middleware_proxy = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_server_server;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_server_server != null ? _src_server_server : {};
    var module = { exports: exports };

    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
var atma_server_1 = require("atma-server");
var atma_io_1 = require("atma-io");
var atma_utils_1 = require("atma-utils");
var proxy_1 = _src_server_server_middleware_proxy;
var location = include.location;
exports.Server = {
    start: function (config) {
        var appConfig = app.config;
        var port = config.port || process.env.PORT || 5777, proxyPath = config.proxy, proxyOnly = config.proxyOnly, proxyFollowRedirects = config.followRedirects, singlePage = config.singlePage;
        var atmaConfigsPath = new atma_utils_1.class_Uri(location)
            .combine('src/server/server/config/')
            .toString();
        var base = atma_io_1.env
            .applicationDir
            .combine('src/server/')
            .toString();
        include.cfg({
            path: base
        });
        var configs = [atmaConfigsPath];
        if (config.config) {
            configs.push(config.config);
        }
        var serverApp = atma_server_1.Application.create({
            configs: configs,
            config: {
                debug: true,
                rewriteRules: singlePage ? [
                    {
                        rule: '^/([\\w_\\-]+)(/[\\w_\\-]+){0,3}(\\?.*)?$ index.html'
                    }
                ] : (void 0)
            },
            args: {
                debug: true
            }
        });
        serverApp.then(function (app) {
            mask.cfg('allowCache', false);
            var bodyParser = require('body-parser'), Url = require('url');
            var responders = [];
            if (proxyOnly !== true) {
                responders.push(app.responder({
                    middleware: [
                        function (req, res, next) {
                            var url = Url.parse(req.url, true);
                            req.query = url.query;
                            next();
                        },
                        bodyParser.json()
                    ]
                }));
            }
            responders.push(atma_server_1.StaticContent.create({
                headers: {
                    'Access-Control-Allow-Origin': '*'
                }
            }));
            responders.push((0, proxy_1.proxify)(proxyPath, { followRedirects: proxyFollowRedirects }));
            app.responders(responders);
            var server = require('http')
                .createServer(app.process.bind(app))
                .listen(port);
            if (config.sslPort) {
                var sslPort = config.sslPort, keyFile = config.key, certFile = config.cert;
                if (!keyFile || !atma_io_1.File.exists(keyFile)) {
                    throw new Error("SSL public Key File not exists. --key \"".concat(keyFile, "\""));
                }
                if (!certFile || !atma_io_1.File.exists(certFile)) {
                    throw new Error("CERT File not exists. --cert \"".concat(certFile, "\""));
                }
                var options = {
                    key: atma_io_1.File.read(keyFile, { encoding: 'binary' }),
                    cert: atma_io_1.File.read(certFile, { encoding: 'binary' }),
                };
                require('https')
                    .createServer(options, app.process.bind(app))
                    .listen(sslPort);
            }
            var serverCfg = appConfig.server, handlers, pages, websockets, subapps;
            if (serverCfg) {
                handlers = serverCfg.handlers,
                    websockets = serverCfg.websockets,
                    subapps = serverCfg.subapps;
                pages = serverCfg.pages;
            }
            handlers && app
                .handlers
                .registerHandlers(handlers, app.config.handler);
            websockets && app
                .handlers
                .registerWebsockets(websockets, app.config);
            subapps && app
                .handlers
                .registerSubApps(subapps);
            pages && app
                .handlers
                .registerPages(pages, app.config.page);
            app
                .autoreload(server);
            include.cfg('path', null);
            logger.log('Listen %s'.green.bold, port);
        });
        (atma.server || (atma.server = {})).app = serverApp;
    }
};
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_server_server === module.exports) {
        // do nothing if
    } else if (__isObj(_src_server_server) && __isObj(module.exports)) {
        Object.assign(_src_server_server, module.exports);
    } else {
        _src_server_server = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_action_server;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_action_server != null ? _src_action_server : {};
    var module = { exports: exports };

    "use strict";
/**
 *  CONFIG
 *
 *      action: 'server',
 *      open: 'url path to open in browser after server has started', is DEFAULT for next raw argument
 *      port: PORT to start at localhost
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerAction = void 0;
var server_1 = _src_server_server;
exports.ServerAction = {
    help: {
        description: 'Start local dev server in current working directory',
        args: {
            port: '<?number> port number, @default: 5777',
            open: '<?string> open path in browser after server start',
            proxy: '<?string> url to a proxy. Pipe request to proxy server if request cannot be handled',
            proxyOnly: '<?flag> no local files or routes are invoked',
            proxyCache: '<?flag> cache requests from remote server',
            config: '<?string> path to additional yml or json configuration file for appcfg and server module',
            sslPort: '<?number> creates also https for the port',
            key: '<?string> keyFile path',
            cert: '<?string> certFile path',
        }
    },
    process: function (config, done) {
        var _a;
        if (config.args) {
            config.open = config.args[0];
        }
        server_1.Server.start(config);
        if (config.open) {
            _node_modules_openurl_openurl.open("http://localhost:".concat(config.port || 5777, "/").concat((_a = config.open) !== null && _a !== void 0 ? _a : ''));
        }
        done();
    }
};
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_action_server === module.exports) {
        // do nothing if
    } else if (__isObj(_src_action_server) && __isObj(module.exports)) {
        Object.assign(_src_action_server, module.exports);
    } else {
        _src_action_server = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_action_shell;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_action_shell != null ? _src_action_shell : {};
    var module = { exports: exports };

    "use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShellAction = void 0;
var shellbee_1 = require("shellbee");
exports.ShellAction = {
    help: {
        description: 'Run shell commands',
        args: {
            command: '(string | Array<string>) Shell command(s)',
            cwd: '(string) working directory'
        },
        examples: [
            '$ atma shell --command "foo bar -qux"',
            {
                action: 'shell',
                command: 'foo bar -qux'
            }
        ]
    },
    process: function (config, done) {
        return __awaiter(this, void 0, void 0, function () {
            var process, shell;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        process = new shellbee_1.Shell(config);
                        return [4 /*yield*/, process
                                .on('process_start', function (data) {
                                logger.log('[exec]'.cyan, data.command.bold);
                            })
                                .on('process_exit', function (data) {
                                logger.log('[done]'.cyan, data.command, ' with ', String(data.code).bold);
                            })
                                .run()];
                    case 1:
                        shell = _a.sent();
                        return [4 /*yield*/, shell.onCompleteAsync()];
                    case 2:
                        _a.sent();
                        done === null || done === void 0 ? void 0 : done();
                        return [2 /*return*/];
                }
            });
        });
    }
};
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_action_shell === module.exports) {
        // do nothing if
    } else if (__isObj(_src_action_shell) && __isObj(module.exports)) {
        Object.assign(_src_action_shell, module.exports);
    } else {
        _src_action_shell = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_action_template;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_action_template != null ? _src_action_template : {};
    var module = { exports: exports };

    "use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateAction = void 0;
var atma_io_1 = require("atma-io");
var atma_utils_1 = require("atma-utils");
var CopyHandler = /** @class */ (function () {
    function CopyHandler() {
    }
    CopyHandler.prototype.process = function (config, done) {
        config.sourceDir.copyTo(config.targetDir.uri);
        done === null || done === void 0 ? void 0 : done();
    };
    return CopyHandler;
}());
;
exports.TemplateAction = {
    help: {
        description: 'Project, Component Scaffolding',
        examples: [
            '$ atma template starter',
            '$ atma template compo foo',
            '$ atma template todoapp',
            {
                action: 'template',
                name: 'starter'
            }
        ]
    },
    process: function (config, done) {
        atma_io_1.File
            .getFactory()
            .registerHandler(/\/\.handler\/.+$/g, /** @class */ (function (_super) {
            __extends(class_1, _super);
            function class_1() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_1.prototype.copyTo = function (uri) {
                return this;
            };
            class_1.prototype.write = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return this;
            };
            class_1.prototype.read = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return '';
            };
            return class_1;
        }(atma_io_1.File)));
        var folder = config.name || process.argv[3];
        if (!folder) {
            done('Template Name is not defined');
            return;
        }
        config = __assign(__assign({}, config), { targetDir: new atma_io_1.Directory(new atma_utils_1.class_Uri(process.cwd() + '/')), sourceDir: new atma_io_1.Directory(atma_io_1.env.applicationDir.combine('template/').combine(folder + '/')) });
        if (config.sourceDir.exists() == false) {
            done('Scaffolding Not Found - ' + config.sourceDir.uri.toString());
            return;
        }
        var handler = new atma_io_1.File(config.sourceDir.uri.combine('.handler/handler.js'));
        if (handler.exists()) {
            include.js(handler.uri.toString() + '::Handler').done(function (resp) {
                execute(resp.Handler, config, done);
            });
            return;
        }
        execute(CopyHandler, config, done);
    }
};
function execute(Handler, config, done) {
    (Handler instanceof Function ? new Handler : Handler).process(config, done);
}
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_action_template === module.exports) {
        // do nothing if
    } else if (__isObj(_src_action_template) && __isObj(module.exports)) {
        Object.assign(_src_action_template, module.exports);
    } else {
        _src_action_template = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_action_transpile;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_action_transpile != null ? _src_action_transpile : {};
    var module = { exports: exports };

    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranspileAction = void 0;
var atma_io_1 = require("atma-io");
exports.TranspileAction = {
    help: {
        description: 'Use Atma.IO middlewares read/write the files and in between preprocess them',
        args: {
            'many': [{ source: 'see @source', output: 'see @output', extension: 'see @extension' }],
            'source': 'Glob pattern to search',
            'output': 'Output directory. Default is the original file directory',
            'extension': 'Output file extension',
            'watch': 'Boolean. Watch found files for changes'
        },
    },
    process: function (config, done) {
        logger.cfg('logCaller', false);
        var watch = Boolean(config.watch || app.config.$cli.params.watch);
        var arr = config.many;
        if (arr == null) {
            arr = [
                {
                    source: config.source,
                    output: config.output,
                    extension: config.extension
                }
            ];
        }
        if (!watch) {
            processFile(arr, { checkHooks: true }, done);
            return;
        }
        atma_io_1.File.enableCache();
        Watcher(arr);
    }
};
function Watcher(arr) {
    var busy = false;
    var shouldRecompile = false;
    function complete() {
        busy = false;
        if (shouldRecompile) {
            shouldRecompile = false;
            start();
            return;
        }
        logger.log('green<Watching files...>'.color);
        shouldRecompile = false;
    }
    function start(opts) {
        busy = true;
        processFile(arr, opts, complete);
    }
    function onFileChange(path) {
        atma_io_1.File.clearCache(path);
        if (busy === true) {
            shouldRecompile = true;
            logger.warn('Filechanged {0} but Transpiler is BUSY. Job is deferred', path);
            return;
        }
        start();
    }
    start({
        onFileChange: onFileChange,
        checkHooks: true
    });
}
function processFile(many, opts, done) {
    arrayAsync(many, done, function (x, next) {
        transpileByPattern(x.source, x, opts, next);
    });
}
function transpileByPattern(pattern, config, opts, done) {
    // check
    if (opts && opts.checkHooks) {
        var path = pattern.replace(/\*/g, 'x');
        var hook = atma_io_1.File.getHookHandler();
        if (hook.getHooksForPath(path, 'read').length === 0) {
            logger
                .error('Atma IO has no transpiler for', pattern)
                .warn('\t 1) Make sure PLUGIN is in node_modules/PLUGIN_NAME')
                .warn('\t 2) Make sure `package.json contains atma: { plugins : [] } Array and the plugin name is inside');
            return;
        }
        if (config.extension == null) {
            logger.error('Atma IO: output extension is not set. run `atma transpile --help for more info');
        }
    }
    pattern = pattern
        .replace(/\\/g, '/')
        .replace(/^\/+/, '');
    var files = atma_io_1.glob.readFiles(pattern);
    arrayAsync(files, done, function (file, next) {
        transpileFile(file, config, next);
        if (opts && opts.onFileChange) {
            file.watch(opts.onFileChange);
        }
    });
}
function transpileFile(file, config, next) {
    var uri = file.uri.combine();
    uri.file = uri.file.replace(uri.extension, config.extension);
    if (uri.toLocalFile() === file.uri.toLocalFile()) {
        throw Error('Configuration failed. Transpiler will overwrite the original path ' + file.uri.toLocalFile() + '.');
    }
    read(write);
    function read(fn) {
        logger.log('File:', file.uri.toRelativeString(atma_io_1.env.currentDir).green);
        file
            .readAsync()
            .done(function (content) {
            logger.getTransport().put(' bold<OK> '.color);
            fn(content);
        })
            .fail(function (error) {
            logger.error(file.uri.toLocalFile(), error);
            next();
        });
    }
    function write(content) {
        atma_io_1.File
            .writeAsync(uri, content)
            .then(next, function (error) {
            logger.error(uri.toLocalFile(), error);
        });
    }
}
function arrayAsync(arr, done, next) {
    arr = arr.slice();
    function handle() {
        if (arr.length === 0) {
            return done();
        }
        next(arr.shift(), handle);
    }
    handle();
}
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_action_transpile === module.exports) {
        // do nothing if
    } else if (__isObj(_src_action_transpile) && __isObj(module.exports)) {
        Object.assign(_src_action_transpile, module.exports);
    } else {
        _src_action_transpile = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_action_Actions;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_action_Actions != null ? _src_action_Actions : {};
    var module = { exports: exports };

    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Actions = void 0;
var bump_1 = _src_action_bump;
var concat_1 = _src_action_concat;
var config_1 = _src_action_config;
var copy_1 = _src_action_copy;
var custom_1 = _src_action_custom;
var help_1 = _src_action_help;
var import_1 = _src_action_import;
var plugin_1 = _src_action_plugin;
var publish_1 = _src_action_publish;
var reference_1 = _src_action_reference;
var release_1 = _src_action_release;
var server_1 = _src_action_server;
var shell_1 = _src_action_shell;
var template_1 = _src_action_template;
var transpile_1 = _src_action_transpile;
var Actions;
(function (Actions) {
    var actions = {
        'bump': bump_1.BumpAction,
        'concat': concat_1.ConcatAction,
        'config': config_1.ConfigAction,
        'copy': copy_1.CopyAction,
        'run': custom_1.CustomAction,
        'custom': custom_1.CustomAction,
        'help': help_1.HelpAction,
        'import': import_1.ImportAction,
        'plugin': plugin_1.PluginAction,
        'publish': publish_1.PublishAction,
        'pub': publish_1.PublishAction,
        'reference': reference_1.ReferenceAction,
        'release': release_1.ReleaseAction,
        'server': server_1.ServerAction,
        'shell': shell_1.ShellAction,
        'template': template_1.TemplateAction,
        'gen': template_1.TemplateAction,
        'transpile': transpile_1.TranspileAction,
    };
    function get(name) {
        return actions[name];
    }
    Actions.get = get;
    function register(name, act) {
        actions[name] = act;
    }
    Actions.register = register;
})(Actions = exports.Actions || (exports.Actions = {}));
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_action_Actions === module.exports) {
        // do nothing if
    } else if (__isObj(_src_action_Actions) && __isObj(module.exports)) {
        Object.assign(_src_action_Actions, module.exports);
    } else {
        _src_action_Actions = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_Application;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_Application != null ? _src_Application : {};
    var module = { exports: exports };

    "use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Application = void 0;
var appcfg_1 = require("appcfg");
var ruta_1 = require("ruta");
var atma_io_1 = require("atma-io");
var atma_utils_1 = require("atma-utils");
var Config_1 = _src_config_Config;
var ShellStrategy_1 = _src_shell_ShellStrategy;
var Prompt_1 = _src_shell_Prompt;
var Actions_1 = _src_action_Actions;
var Application = /** @class */ (function (_super) {
    __extends(Application, _super);
    function Application() {
        //Extends: [Class.EventEmitter, ShellPrompt],
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.config = null;
        _this.errors = [];
        _this.current = null;
        return _this;
    }
    Application.prototype.initialize = function () {
        return __awaiter(this, void 0, Promise, function () {
            var config, _a, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        (0, atma_io_1.settings)({
                            extensions: {
                                'yml': [
                                    'atma-io-middleware-yml:read'
                                ]
                            }
                        });
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        global.app = this;
                        _a = this;
                        return [4 /*yield*/, appcfg_1.default.fetch([
                                Config_1.Config.Utils,
                                {
                                    path: '%APP%/globals/actions.js'
                                },
                                {
                                    path: '%APP%/globals/config.yml'
                                },
                                {
                                    path: '%APPDATA%/.atma/config.yml',
                                    writable: true,
                                    optional: true
                                },
                                {
                                    path: 'package.json',
                                    getterProperty: 'atma',
                                    optional: true,
                                    lookupAncestors: true
                                },
                                Config_1.Config.Projects,
                                Config_1.Config.Plugins,
                                Config_1.Config.Tasks,
                                Config_1.Config.Settings,
                                Config_1.Config.Configs,
                            ])];
                    case 2:
                        config = _a.config = _b.sent();
                        if (config.$cli.params.help) {
                            //this.run({ action: 'help' });
                            //return this;
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _b.sent();
                        console.log('err', err_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, this];
                }
            });
        });
    };
    Application.prototype.help = function () {
        return this.run({ action: 'help' });
    };
    Application.prototype.run = function (taskConfigs) {
        this.worker = new atma_utils_1.class_Dfr();
        this.errors = [];
        if (taskConfigs != null) {
            if (Array.isArray(taskConfigs) === false) {
                taskConfigs = [taskConfigs];
            }
            this.config.tasks = taskConfigs;
        }
        else {
            taskConfigs = this.config.tasks;
        }
        if (Array.isArray(taskConfigs) === false || taskConfigs.length === 0) {
            return this
                .worker
                .reject('<app:run> tasks are invalid');
        }
        this.process(taskConfigs.shift());
        return this.worker;
    };
    Application.prototype.process = function (taskConfig) {
        return __awaiter(this, void 0, void 0, function () {
            function run() {
                if (handler.strategy) {
                    var strategy = new ShellStrategy_1.ShellStrategy(handler.strategy), path = process.argv.slice(3).join(' '), cmd = ruta_1.$utils.pathFromCLI(path);
                    strategy.process(cmd, taskConfig, callback);
                    return;
                }
                if (handler.process) {
                    handler.process(taskConfig, callback);
                    return;
                }
                app.errors.push('<fail> ' +
                    taskConfig.action +
                    ':' +
                    ' No `strategy` object, no `process` function');
            }
            function callback(error) {
                if (error)
                    app.errors.push('<fail> ' + taskConfig.action + ':' + error);
                next();
            }
            function next() {
                var taskConfig = app.config.tasks.shift();
                if (taskConfig == null) {
                    app
                        .worker
                        .resolve();
                    return;
                }
                app.process(taskConfig);
            }
            var app, handler;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        app = this;
                        this.current = taskConfig;
                        return [4 /*yield*/, this.findAction(taskConfig.action)];
                    case 1:
                        handler = _a.sent();
                        // defer `run` to wait before for all `done`-stack is called when resolving action
                        setTimeout(run, 0);
                        return [2 /*return*/, this];
                }
            });
        });
    };
    Application.prototype.findAction = function (action) {
        var dfr = new atma_utils_1.class_Dfr(), mix = this.config.actions[action];
        if (mix != null && typeof mix === 'object') {
            return dfr.resolve(mix);
        }
        var act = Actions_1.Actions.get(action);
        if (act) {
            return dfr.resolve(act);
        }
        var path = mix;
        if (path == null) {
            path = '/src/action/' + action + '.js';
        }
        var base = atma_io_1.env.applicationDir.toString();
        if (path[0] === '/') {
            path = atma_utils_1.class_Uri.combine(base, path);
        }
        include
            .instance(base)
            .setBase(base)
            .js(path + '::Action')
            .done(function (resp) {
            if (resp == null || resp.Action == null) {
                dfr.reject('Action not found: ' + action);
                return;
            }
            dfr.resolve(resp.Action);
        });
        return dfr;
    };
    Application.prototype.findActions = function () {
        var actions = Array.prototype.slice.call(arguments), fns = [], dfr = new atma_utils_1.class_Dfr(), app = this;
        function next() {
            if (actions.length === 0) {
                dfr.resolve.apply(dfr, fns);
                return;
            }
            app
                .findAction(actions.shift())
                .done(function (fn) {
                fns.push(fn);
                next();
            })
                .fail(function (error) {
                dfr.reject(error);
            });
        }
        next();
        return dfr;
    };
    Application.prototype.runAction = function (action, config, done) {
        return __awaiter(this, void 0, void 0, function () {
            var handler;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.findAction(action)];
                    case 1:
                        handler = _a.sent();
                        handler.process(config, done);
                        return [2 /*return*/];
                }
            });
        });
    };
    return Application;
}(Prompt_1.Prompt));
exports.Application = Application;
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_Application === module.exports) {
        // do nothing if
    } else if (__isObj(_src_Application) && __isObj(module.exports)) {
        Object.assign(_src_Application, module.exports);
    } else {
        _src_Application = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var Application_1 = _src_Application;
var NodeJSNativeStart;
(function (NodeJSNativeStart) {
    function runNewNode(args) {
        var spawn = require('child_process').spawn;
        var path = require('path');
        var proc = spawn(process.execPath, args, { stdio: 'inherit' });
        proc.on('exit', function (code, signal) {
            process.on('exit', function () {
                if (signal) {
                    process.kill(process.pid, signal);
                }
                else {
                    process.exit(code);
                }
            });
        });
        // terminate children.
        process.on('SIGINT', function () {
            proc.kill('SIGINT'); // calls runner.abort()
            proc.kill('SIGTERM'); // if that didn't work, we're probably in an infinite loop, so make it die.
        });
    }
    NodeJSNativeStart.runNewNode = runNewNode;
    function resolveNativeNodeArgumentsIfAny() {
        var path = require('path');
        var args = [path.join(__dirname.replace(/lib[\/\\]?$/, ''), 'index.js')];
        var isDebug = false;
        var count = 0;
        process.argv.slice(2).forEach(function (arg) {
            var flag = arg.split('=')[0];
            switch (flag) {
                case '-d':
                    args.unshift('--debug');
                    break;
                case 'debug':
                    args.unshift('--inspect');
                    isDebug = true;
                    break;
                case '--debug':
                case '--debug-brk':
                case '--inspect':
                case '--inspect-brk':
                    args.unshift(arg);
                    break;
                case '-gc':
                case '--expose-gc':
                    args.unshift('--expose-gc');
                    break;
                case '--gc-global':
                case '--es_staging':
                case '--no-deprecation':
                case '--no-warnings':
                case '--prof':
                case '--log-timer-events':
                case '--throw-deprecation':
                case '--trace-deprecation':
                case '--trace-warnings':
                case '--use_strict':
                case '--allow-natives-syntax':
                case '--perf-basic-prof':
                case '--napi-modules':
                    args.unshift(arg);
                    break;
                default:
                    if (arg.indexOf('--harmony') === 0) {
                        args.unshift(arg);
                    }
                    else if (arg.indexOf('--trace') === 0) {
                        args.unshift(arg);
                    }
                    else if (arg.indexOf('--icu-data-dir') === 0) {
                        args.unshift(arg);
                    }
                    else if (arg.indexOf('--max-old-space-size') === 0) {
                        args.unshift(arg);
                    }
                    else if (arg.indexOf('--preserve-symlinks') === 0) {
                        args.unshift(arg);
                    }
                    else {
                        count++;
                        args.push(arg);
                    }
                    break;
            }
        });
        if (args.length === count + 1) {
            return null;
        }
        if (isDebug) {
            args.push('--debugger');
        }
        return args;
    }
    NodeJSNativeStart.resolveNativeNodeArgumentsIfAny = resolveNativeNodeArgumentsIfAny;
})(NodeJSNativeStart || (NodeJSNativeStart = {}));
var ApplicationStart;
(function (ApplicationStart) {
    function preload() {
        return __awaiter(this, void 0, void 0, function () {
            var isTest, _, base, app;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        isTest = process.argv.includes('test');
                        if (isTest) {
                            process.env.TEST = 'true';
                        }
                        require('includejs');
                        require('atma-libs/globals-dev');
                        _ = require('atma-utils');
                        global.atma = {};
                        global.ruta = require('ruta');
                        global.Class = require('atma-class');
                        global.mask = require('maskjs');
                        process
                            .mainModule
                            .paths
                            .push(process.cwd() + '/node_modules');
                        require('atma-logger/lib/global-dev');
                        require('atma-io');
                        base = io.env.applicationDir.toString();
                        include
                            .cfg({
                            //        path: base,
                            extentionDefault: {
                                "js": "ts"
                            }
                        })
                            .routes({
                            handler: base + 'src/handler/{0}.ts',
                            parser: base + 'src/parser/{0}.ts',
                            action: base + 'src/action/{0}.ts',
                            script: base + 'src/{0}.ts',
                            helper: base + 'src/helper/{0}.ts',
                            server: base + 'src/server/{0}.ts',
                            atma: base + '{0}.ts'
                        });
                        app = new Application_1.Application();
                        return [4 /*yield*/, app.initialize()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    }
    ApplicationStart.preload = preload;
    function initialize(app) {
        logger(99)
            .log('> process:'.cyan, process)
            .log('> config:'.cyan, app.config);
        if (app.config.$cli.params.help) {
            app.help();
            return 1;
        }
        if (app.config.tasks == null) {
            logger.error('<config:invalid> Tasks are not defined', app.config.toJSON());
            return 0;
        }
        app
            .run()
            .fail(function (error) {
            logger.error(error);
            process.exit(1);
        })
            .always(function () {
            if (app.errors.length) {
                logger.error(app.errors);
                process.exit(1);
            }
            logger.log('<done>'.green);
        });
        return 1;
    }
    ApplicationStart.initialize = initialize;
})(ApplicationStart || (ApplicationStart = {}));
(function () {
    return __awaiter(this, void 0, void 0, function () {
        var args, app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    args = NodeJSNativeStart.resolveNativeNodeArgumentsIfAny();
                    if (args) {
                        NodeJSNativeStart.runNewNode(args);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, ApplicationStart.preload()];
                case 1:
                    app = _a.sent();
                    ApplicationStart.initialize(app);
                    return [2 /*return*/];
            }
        });
    });
}());


}());
// end:source ./RootModule.js
