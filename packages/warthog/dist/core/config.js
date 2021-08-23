"use strict";
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
var cosmiconfig_1 = require("cosmiconfig");
var Debug = require("debug");
var dotenv = require("dotenv");
var fs = require("fs");
var path = require("path");
var typedi_1 = require("typedi");
var utils_1 = require("../utils");
var debug = Debug('warthog:config');
var CONFIG_VALUE_VALID_KEYS = [
    'allowOptionalIdOnCreate',
    'generatedFolder',
    'cliGeneratePath',
    'moduleImportPath',
    'resolversPath',
    'validateResolvers'
];
var Config = /** @class */ (function () {
    function Config(options) {
        if (options === void 0) { options = {}; }
        this.options = options;
        this.WARTHOG_ENV_PREFIX = 'WARTHOG_';
        this.TYPEORM_ENV_PREFIX = 'TYPEORM_';
        this.WARTHOG_DB_ENV_PREFIX = 'WARTHOG_DB_';
        this.PROJECT_ROOT = process.cwd();
        this.container = options.container || typedi_1.Container;
        this.logger = options.logger;
        this.defaults = {
            WARTHOG_DB_CONNECTION: 'postgres',
            WARTHOG_ROOT_FOLDER: this.PROJECT_ROOT,
            WARTHOG_ALLOW_OPTIONAL_ID_ON_CREATE: 'false',
            WARTHOG_APP_PROTOCOL: 'https',
            WARTHOG_AUTO_GENERATE_FILES: 'false',
            WARTHOG_AUTO_OPEN_PLAYGROUND: 'false',
            WARTHOG_INTROSPECTION: 'true',
            WARTHOG_CLI_GENERATE_PATH: './src',
            WARTHOG_DB_ENTITIES: [path.join(this.PROJECT_ROOT, 'src/**/*.model.ts')],
            WARTHOG_DB_ENTITIES_DIR: 'src/models',
            WARTHOG_DB_LOGGER: 'advanced-console',
            WARTHOG_DB_MIGRATIONS: ['db/migrations/**/*.ts'],
            WARTHOG_DB_MIGRATIONS_DIR: 'db/migrations',
            WARTHOG_DB_PORT: 5432,
            WARTHOG_DB_SUBSCRIBERS: ['src/subscribers/**/*.ts'],
            WARTHOG_DB_SUBSCRIBERS_DIR: 'src/subscribers',
            WARTHOG_DB_SYNCHRONIZE: 'false',
            WARTHOG_FILTER_BY_DEFAULT: 'true',
            WARTHOG_MODULE_IMPORT_PATH: 'warthog',
            // TODO: eventually we should do this path resolution when we ask for the variable with `get`
            WARTHOG_GENERATED_FOLDER: path.join(this.PROJECT_ROOT, 'generated'),
            WARTHOG_RESOLVERS_PATH: [path.join(this.PROJECT_ROOT, 'src/**/*.resolver.ts')],
            WARTHOG_SUBSCRIPTIONS: 'false',
            WARTHOG_VALIDATE_RESOLVERS: 'false',
            // Prevent 502s from happening in AWS and GCP (and probably other Production ENVs)
            // See https://shuheikagawa.com/blog/2019/04/25/keep-alive-timeout/
            WARTHOG_KEEP_ALIVE_TIMEOUT_MS: 30000,
            WARTHOG_HEADERS_TIMEOUT_MS: 60000
        };
        this.devDefaults = {
            WARTHOG_APP_HOST: 'localhost',
            WARTHOG_APP_PORT: '4000',
            WARTHOG_APP_PROTOCOL: 'http',
            WARTHOG_AUTO_GENERATE_FILES: 'true',
            WARTHOG_AUTO_OPEN_PLAYGROUND: 'true',
            WARTHOG_DB_HOST: 'localhost',
            WARTHOG_DB_LOGGING: 'all'
        };
        this.testDefaults = {
            WARTHOG_APP_HOST: 'localhost',
            WARTHOG_APP_PORT: '4000',
            WARTHOG_APP_PROTOCOL: 'http',
            WARTHOG_AUTO_GENERATE_FILES: 'false',
            WARTHOG_AUTO_OPEN_PLAYGROUND: 'false',
            WARTHOG_DB_DATABASE: 'warthog-test',
            WARTHOG_DB_HOST: 'localhost',
            WARTHOG_DB_USERNAME: 'postgres'
        };
        var dotenvPath = options.dotenvPath || this.PROJECT_ROOT;
        this.NODE_ENV = this.determineNodeEnv(dotenvPath);
        this.loadDotenvFiles(dotenvPath);
        return this.loadSync();
    }
    // Allow NODE_ENV to be set in the .env file.  Check for this first here and then fall back on
    // the environment variable.  The reason we do this is because using dotenvi will allow us to switch
    // between environments.  If we require an actual environment variable to be set then we'll have to set
    // and unset the value in the current terminal buffer.
    Config.prototype.determineNodeEnv = function (dotenvPath) {
        var nodeEnv = process.env.NODE_ENV;
        var filepath = path.join(dotenvPath, '.env');
        if (fs.existsSync(filepath)) {
            var config = dotenv.parse(fs.readFileSync(filepath));
            if (config.NODE_ENV) {
                nodeEnv = config.NODE_ENV;
            }
        }
        return (this.NODE_ENV = process.env.NODE_ENV = nodeEnv);
    };
    Config.prototype.loadDotenvFiles = function (dotenvPath) {
        // .local files are for secrets, load those first
        var files = [".env.local." + this.NODE_ENV, '.env.local', '.env'];
        files.forEach(function (filename) {
            var filepath = path.join(dotenvPath, filename);
            if (fs.existsSync(filepath)) {
                dotenv.config({
                    path: filepath
                });
            }
        });
    };
    Config.prototype.loadSync = function () {
        var devOptions = this.NODE_ENV === 'development' ? this.devDefaults : {};
        var testOptions = this.NODE_ENV === 'test' ? this.testDefaults : {};
        var configFile = this.loadStaticConfigSync();
        // Config is loaded as a waterfall.  Items at the top of the object are overwritten by those below, so the order is:
        // - Add application-wide defaults
        // - Add development defaults (if we're runnign in DEV mode)
        // - Load config from config file
        // - Load environment variables
        // - Override with locked options
        var combined = __assign(__assign(__assign(__assign(__assign(__assign({}, this.defaults), devOptions), testOptions), configFile), this.typeORMToWarthogEnvVariables()), this.warthogEnvVariables());
        // If Jest is running, be smart and don't open playground
        if (typeof process.env.JEST_WORKER_ID !== 'undefined') {
            combined.WARTHOG_AUTO_OPEN_PLAYGROUND = 'false';
        }
        this.config = combined;
        debug('Config', this.config);
        // Must be after config is set above
        this.validateEntryExists('WARTHOG_APP_HOST');
        this.validateEntryExists('WARTHOG_APP_PORT');
        this.validateEntryExists('WARTHOG_GENERATED_FOLDER');
        this.validateEntryExists('WARTHOG_DB_CONNECTION');
        this.validateEntryExists('WARTHOG_DB_HOST');
        // Now that we've pulled all config in from the waterfall, write `WARTHOG_DB_` keys to `TYPEORM_`
        // So that TypeORM will pick them up
        // this.writeWarthogConfigToTypeORMEnvVars();
        // Once we've combined all of the Warthog ENV vars, write them to process.env so that they can be used elsewhere
        // NOTE: this is likely a bad idea and we should use Containers
        this.writeWarthogEnvVars();
        this.container.set('warthog.logger', this.logger); // Save for later so we can pull globally
        return this;
    };
    Config.prototype.get = function (key) {
        if (typeof key === 'undefined') {
            return this.config;
        }
        else if (!key) {
            console.error('Config.get: key cannot be blank');
        }
        var lookup = key.startsWith(this.WARTHOG_ENV_PREFIX)
            ? key
            : "" + this.WARTHOG_ENV_PREFIX + key;
        return this.config[lookup];
    };
    Config.prototype.warthogEnvVariables = function () {
        return this.envVarsByPrefix(this.WARTHOG_ENV_PREFIX);
    };
    Config.prototype.warthogDBEnvVariables = function () {
        return this.envVarsByPrefix(this.WARTHOG_DB_ENV_PREFIX);
    };
    Config.prototype.typeORMEnvVariables = function () {
        return this.envVarsByPrefix(this.TYPEORM_ENV_PREFIX);
    };
    Config.prototype.translateEnvVar = function (key, value) {
        var _this = this;
        var arrayTypes = [
            'WARTHOG_DB_ENTITIES',
            'WARTHOG_DB_MIGRATIONS',
            'WARTHOG_DB_SUBSCRIBERS',
            'WARTHOG_RESOLVERS_PATH'
        ];
        var pathTypes = ['WARTHOG_GENERATED_FOLDER'];
        // Should be able to do this, but TypeGraphQL has an issue with relative requires
        // https://github.com/19majkel94/type-graphql/blob/a212fd19f28d3095244c44381617f03e97ec4db3/src/helpers/loadResolversFromGlob.ts#L4
        // const paths = value.split(',');
        if (arrayTypes.indexOf(key) > -1) {
            return value.split(',').map(function (item) {
                if (path.isAbsolute(item)) {
                    return item;
                }
                return path.join(_this.PROJECT_ROOT, item);
            });
        }
        if (pathTypes.indexOf(key) > -1) {
            if (path.isAbsolute(value)) {
                return value;
            }
            return path.join(this.PROJECT_ROOT, value);
        }
        return value;
    };
    Config.prototype.envVarsByPrefix = function (prefix) {
        var _this = this;
        var config = {};
        Object.keys(process.env).forEach(function (key) {
            if (key.startsWith(prefix)) {
                config[key] = _this.translateEnvVar(key, process.env[key] || '');
            }
        });
        return config;
    };
    Config.prototype.typeORMToWarthogEnvVariables = function () {
        var _this = this;
        var typeORMvars = this.typeORMEnvVariables();
        var config = {};
        Object.keys(typeORMvars).forEach(function (key) {
            var keySuffix = key.substring(_this.TYPEORM_ENV_PREFIX.length);
            config["" + _this.WARTHOG_DB_ENV_PREFIX + keySuffix] = typeORMvars[key];
        });
        return config;
    };
    // public writeWarthogConfigToTypeORMEnvVars() {
    //   Object.keys(this.config).forEach((key: string) => {
    //     if (key.startsWith(this.WARTHOG_DB_ENV_PREFIX)) {
    //       const keySuffix = key.substring(this.WARTHOG_DB_ENV_PREFIX.length);
    //       process.env[`TYPEORM_${keySuffix}`] = this.get(key);
    //     }
    //   });
    // }
    Config.prototype.writeWarthogEnvVars = function () {
        var _this = this;
        Object.keys(this.config).forEach(function (key) {
            if (key.startsWith(_this.WARTHOG_ENV_PREFIX)) {
                process.env[key] = _this.get(key);
            }
        });
    };
    Config.prototype.validateEntryExists = function (key) {
        if (!this.config) {
            throw new Error("Can't validate the base config until after it is generated");
        }
        var value = this.get(key);
        if (!value) {
            throw new Error("Config: " + key + " is required: " + value + "\n\n" + JSON.stringify(this.config) + "\n\n" + JSON.stringify(process.env));
        }
    };
    Config.prototype.loadStaticConfigSync = function () {
        var response = this.loadStaticConfigFileSync();
        if (typeof response === 'undefined') {
            return {};
        }
        var constantized = utils_1.ObjectUtil.constantizeKeys(response.config);
        return utils_1.ObjectUtil.prefixKeys(constantized, this.WARTHOG_ENV_PREFIX);
    };
    // Use cosmiconfig to load static config that has to be the same for all environments
    // paths to folders for the most part
    Config.prototype.loadStaticConfigFileSync = function () {
        var explorer = cosmiconfig_1.cosmiconfigSync('warthog');
        // Pull config values from cosmiconfig
        var results = explorer.search(this.options.configSearchPath);
        if (!results || results.isEmpty) {
            return;
        }
        var userConfigKeys = Object.keys(results.config);
        var badKeys = userConfigKeys.filter(function (x) { return !CONFIG_VALUE_VALID_KEYS.includes(x); });
        if (badKeys.length) {
            throw new Error("Config: invalid keys specified in " + results.filepath + ": [" + badKeys.join(', ') + "]");
        }
        // Make sure the generated folder is an absolute path
        if (results.config.generatedFolder && !path.isAbsolute(results.config.generatedFolder)) {
            results.config.generatedFolder = path.join(path.dirname(results.filepath), results.config.generatedFolder);
        }
        return results;
    };
    Config = __decorate([
        typedi_1.Service('Config'),
        __metadata("design:paramtypes", [Object])
    ], Config);
    return Config;
}());
exports.Config = Config;
//# sourceMappingURL=config.js.map