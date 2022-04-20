import { File, env, Directory } from 'atma-io'
import { run } from 'shellbee';

export const InitAction = {
    help: {
        description: 'Bootstrap atma ts runner',
        args: {},
    },
    async process (config, done) {

        let packageChanged = await ensureJson('./package.json', packageJson);
        if (packageChanged) {
            await run('npm i')
        }
        await ensureJson('./tsconfig.json', tsconfigJson);
        await ensureJson('./typings.json', typingsJson);

        let dirSource = env.applicationDir.combine('./template/init/');

        await Directory.copyToAsync(dirSource.toString(), env.currentDir.toString());
        done(null);
    }
};

async function ensureJson(path: string, json) {
    let file = new File(path);
    let pckg = {} as any;
    let exists = await file.existsAsync();
    if (exists) {
        pckg = await file.readAsync();
    }

    let modified = extendWithDefaultValues(pckg, json);

    if (exists === false || modified === true) {
        await file.writeAsync(pckg);
    }

    function extendWithDefaultValues (target, source) {
        let modified = false;
        for (let key in source) {
            let val = source[key];
            if (target[key] == null) {
                target[key] = val;
                modified = true;
                continue;
            }
            if (Array.isArray(val) && val.length > 0) {
                let targetArr = target[key];
                if (Array.isArray(targetArr) === false) {
                    throw new Error(`Target value in ${key} is not an array`);
                }
                for (let item of val) {
                    if (typeof item === 'object') {
                        throw new Error(`Not implemented. Only strings in array are supported`)
                    }
                    if (targetArr.includes(item) === false) {
                        modified = true;
                        targetArr.push(item);
                    }
                }
                continue;
            }
            if (typeof val === 'object') {
                if (typeof target[key] !== 'object') {
                    throw new Error(`Target value in ${key} is not an object`);
                }
                let $modified = extendWithDefaultValues(target[key], val);
                modified = $modified || modified;
            }
        }
        return modified;
    }
    return modified;
}


const packageJson = {
    "dependencies": {
        "a-di": "^1.0.25",
        "alot": "^0.2.96",
        "app-bundler": "^0.0.97",
        "atma": "^0.15.2",
        "atma-class": "^1.1.84",
        "atma-io": "^1.2.51",
        "atma-io-middleware-yml": "^1.1.25",
        "atma-loader-ts": "^1.1.16",
        "includejs": "^0.15.52",
        "memd": "^0.3.10"
      },
    "atma": {
        "plugins": [
          "atma-loader-ts",
          "atma-io-middleware-yml"
        ],
        "settings": {
          "include": {
            "amd": true,
            "extentionDefault": {
              "js": "ts"
            },
            "routes": "#import ./tsconfig.json compilerOptions.paths",
            "map": {
              "node:events": "events"
            }
          },
          "atma-loader-ts": {
            "sourceMap": true,
            "typescript": "#import ./tsconfig.json"
          }
        }
      },

}
const tsconfigJson = {
    "compilerOptions": {
        "baseUrl": "./",
        "paths": {
            "@core/*": [ "src/*" ]
        },
        "module": "AMD",
        "moduleResolution": "node",
        "experimentalDecorators": true,
        "target": "es2020",
        "lib": ["dom", "es2020"],
        "esModuleInterop": true,
        "allowSyntheticDefaultImports": true
    },
    "exclude": [
        "node_modules",
        "db"
    ]
}

const typingsJson = {
    "globalDependencies": {
      "assertion": "github:atmajs/assertion/typings.json",
      "atma-utest": "github:atmajs/utest/typings.json"
    }
  }
