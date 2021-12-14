import { File } from 'atma-io'

declare let global, logger, atma;

export default {
	help: {
		description: 'Increase the semver in `package.json | bower.json | component.json` from the CWD. \n `00` pattern, e.g. `0.11.54`',
		args: {},
	},
	process (config, done){
		var version, file, pckg;

		if (config.fromPackage) {
			version = readVersion(config.fromPackage);
			if (version == null) {
				done(Error('Invalid package: ' + file.uri.toLocalFile()));
				return;
			}
		}

		files.forEach(function(filename){
			file = new File(filename, { cached: false });
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

function readVersion (mix) {
	var file = typeof mix === 'string'
		? new File(mix)
		: mix;
	var source = file.read({ skipHooks: true });
	try {
		return JSON.parse(source).version;
	} catch (error) {
		logger.error(file.uri.toLocalFile(), error);
	}
}

function increaseVersion(version) {
    if (typeof version !== 'string')
        return null;


    var parts = version
        .split('.')
        .map(x => Number(x) << 0 );

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
