import { Shell } from 'shellbee';

declare let logger;

export const ShellAction = {
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
    async process (config, done) {

        let process = new Shell(config);

        let shell = await process
            .on('process_start', (data) => {
                logger.log('[exec]'.cyan, data.command.bold);
            })
            .on('process_exit', (data) => {
                logger.log('[done]'.cyan, data.command, ' with ', String(data.code).bold);
            })
            .run();

        await shell.onCompleteAsync();
        done?.();
    }
};
