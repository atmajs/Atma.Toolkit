include.exports = {
	help: {
		description: 'Increase the semver in `package.json | bower.json | component.json` from the CWD. \n `00` pattern, e.g. `0.11.54`',
		args: {},
	},
	process: function(config, done){
		var version, file, pckg;
		
		files.forEach(function(filename){
			file = new io.File(filename, { cached: false });
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

function increaseVersion(version) {
    if (typeof version !== 'string') 
        return null;
    
    
    var parts = version
        .split('.')
        .map(function(x){ return x << 0; });
        
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