import { Directory, env } from 'atma-io';
import { referenceHelper } from '../helper/referenceHelper';

declare let app;

export const ReferenceAction = {
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

        var args = process.argv,
            path = config.path || args[3],
            name = config.name || args[4],
            projects = app.config.projects;


        if (!projects) {
            return done('config/projects.txt contains no projects');
        }

        if (projects.hasOwnProperty(path)) {
            name = path;
            path = projects[name].path;

        }

        if (!path || Directory.exists(path) === false) {
            return done('Symbolic link points to undefined path: ' + path);
        }



        referenceHelper.create(env.currentDir, name, path);
        return done && done();

    }
}
