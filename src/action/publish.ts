import { Shell } from 'shellbee';

declare let app;

export const PublishAction = {
    help: {
        description: [
            'Commit all changes with message and push to git and npm'
        ],
        args: {
            m: 'commit message'
        },
    },
    process (config, done) {

        let message = config.m;

        this.bump((error, version) => {
            if (error) {
                done(error);
                return;
            }
            if (message == null) {
                message = `v${version}`;
            }
            let branch = 'master';

            let publish = [
                'npm run build',
                'git add -A',
                `git commit -a -m "publish: ${message}"`,
                'git push origin ' + branch,
                'npm publish',
            ];
            runCommands(publish, done);
        });
    },

    runCommands (commands, done) {
        runCommands(commands, done);
    },
    bump (done) {
        app
            .findAction('bump')
            .done(function (action) {
                action.process({}, done);
            });
    }
};


async function runCommands (commands, done){
    let shell = await Shell.run({
        commands
    });

    await shell.onCompleteAsync()
    done();
};
