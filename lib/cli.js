
// source ./RootModule.js
(function(){
	
	var _src_Application = {};
var _src_config_Config = {};
var _src_config_TaskSource = {};
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
exports.TaskSource = void 0;
var appcfg_1 = require("appcfg");
var atma_utils_1 = require("atma-utils");
var atma_io_1 = require("atma-io");
var arr_1 = _src_utils_arr;
var TaskSource = /** @class */ (function (_super) {
    __extends(TaskSource, _super);
    function TaskSource() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.config = null;
        _this.data = {
            sync: true
        };
        return _this;
    }
    TaskSource.prototype.read = function (rootConfig) {
        return __awaiter(this, void 0, void 0, function () {
            var file, action, that, tasks, config;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        file = getFile(rootConfig.$cli), action = getAction(rootConfig), that = this;
                        if (action != null) {
                            delete rootConfig.tasks;
                            this.config = {
                                tasks: [action]
                            };
                            return [2 /*return*/, this.resolve()];
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
                            return [2 /*return*/, this.resolve()];
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
                        this.resolve();
                        return [2 /*return*/];
                }
            });
        });
    };
    return TaskSource;
}(atma_utils_1.class_Dfr));
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
    Configs: /** @class */ (function (_super) {
        __extends(class_1, _super);
        function class_1() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.data = {
                sync: false,
            };
            _this.config = {};
            return _this;
        }
        class_1.prototype.read = function (rootConfig) {
            return __awaiter(this, void 0, void 0, function () {
                var configs, config;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            configs = rootConfig.configs;
                            if (typeof configs !== 'string') {
                                this.resolve();
                                return [2 /*return*/, this];
                            }
                            return [4 /*yield*/, appcfg_1.default.fetch([{
                                        path: configs
                                    }])];
                        case 1:
                            config = _a.sent();
                            this.config = config.toJSON();
                            this.resolve();
                            return [2 /*return*/, this];
                    }
                });
            });
        };
        return class_1;
    }(atma_utils_1.class_Dfr)),
    Plugins: /** @class */ (function (_super) {
        __extends(class_2, _super);
        function class_2() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.data = {
                sync: true
            };
            return _this;
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
                            if (plugins == null || plugins.length === 0)
                                return [2 /*return*/, this.resolve()];
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
                                                return [4 /*yield*/, include
                                                        .instance(url)
                                                        .js(url + '::Plugin')];
                                            case 1:
                                                Plugin = (_a.sent()).Plugin;
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
                            return [2 /*return*/, this];
                    }
                });
            });
        };
        return class_2;
    }(atma_utils_1.class_Dfr)),
    Projects: /** @class */ (function (_super) {
        __extends(class_3, _super);
        function class_3() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.data = {
                sync: true
            };
            return _this;
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
                    this.resolve();
                    return [2 /*return*/, this];
                });
            });
        };
        return class_3;
    }(atma_utils_1.class_Dfr)),
    Settings: /** @class */ (function (_super) {
        __extends(class_4, _super);
        function class_4() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.data = {
                sync: true
            };
            return _this;
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
                    this.resolve();
                    return [2 /*return*/, this];
                });
            });
        };
        return class_4;
    }(atma_utils_1.class_Dfr))
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
        this.routes = new ruta_1.default.Collection();
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
(0, atma_io_1.settings)({
    extensions: {
        'yml': [
            'atma-io-middleware-yml:read'
        ]
    }
});
/* Increase Await Timeout, so that configurations and plugins can be loaded.
 * @TODO: appcfg: when Class.Await is used: make sure to disable or increase timeouts
 */
Class.Await.TIMEOUT = 20000;
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
            var config;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        global.app = this;
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
                    case 1:
                        config = _a.sent();
                        if (config.$cli.params.help) {
                            this.run({ action: 'help' });
                            return [2 /*return*/, this];
                        }
                        this.config = config;
                        return [2 /*return*/, this];
                }
            });
        });
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
        var app = this;
        this.current = taskConfig;
        this
            .findAction(taskConfig.action)
            .fail(function (error) {
            logger.error('<app.action>', error);
            next();
        })
            .done(function (handler) {
            // defer `run` to wait before for all `done`-stack is called when resolving action
            setTimeout(run, 0);
            function run() {
                if (handler.strategy) {
                    var strategy = new ShellStrategy_1.ShellStrategy(handler.strategy), path = process.argv.slice(3).join(' '), cmd = ruta_1.default.$utils.pathFromCLI(path);
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
        });
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
        return this;
    };
    Application.prototype.findAction = function (action) {
        var dfr = new Class.Deferred(), mix = this.config.actions[action];
        if (mix != null && typeof mix === 'object') {
            return dfr.resolve(mix);
        }
        var path = mix;
        if (path == null)
            path = '/src/action/' + action + '.js';
        var base = atma_io_1.env.applicationDir.toString();
        if (path[0] === '/')
            path = atma_utils_1.class_Uri.combine(base, path);
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
        var actions = Array.prototype.slice.call(arguments), fns = [], dfr = new Class.Deferred(), app = this;
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
        this
            .findAction(action)
            .done(function (action) {
            action.process(config, done);
        })
            .fail(function () {
            done('<Atma.Toolkit::Action - 404> ' + action);
        });
    };
    return Application;
}(ShellPrompt));
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
        var args = [path.join(__dirname, 'atma')];
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
