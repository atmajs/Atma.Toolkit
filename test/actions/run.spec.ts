import { Shell } from 'shellbee'

UTest({
    async 'run' () {
        let shell = await Shell.run({
            command: 'node ./lib/cli.js run ./test/fixtures/log.js'
        });
        await shell.onCompleteAsync();

        console.log('>>>', shell.stdout);
    }
})
