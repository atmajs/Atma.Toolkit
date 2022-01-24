import { Shell } from 'shellbee';


UTest({
    async 'should output help' () {
        let shell = await Shell.run({
            command: `node ./index --help --no-color`,
            silent: true
        });

        let str = shell.stdout.join('')
        has_(str, 'Happy');
    }
})
