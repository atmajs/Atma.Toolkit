import { File, env } from 'atma-io';

export const ConfigAction = {
    help: {
        description: 'Opens Atma.Toolkit global configuration file'
    },
    async process (config, done) {

        let path = env.appdataDir.combine('config.yml');
        let file = new File(path);

        if (await file.existsAsync() === false) {
            await file.writeAsync({ projects: {} });
        }
        require('openurl').open(file.uri.toString());
        done();
    }
};

