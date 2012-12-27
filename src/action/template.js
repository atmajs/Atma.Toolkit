(function() {


	include.exports = {
		process: function(config, idfr) {

			include.js({
				io: ['files/includeRoutes']
			}).done(function() {

				var folder = config.folder || global.program.args[1],
					targetUri = new net.URI(process.cwd() + '/'),
					sourceDir = new io.Directory(io.env.applicationDir.combine('/template/').combine(folder));

				if (sourceDir.exists() == false) {
					console.error('Source Directory Not Found - ', sourceDir.uri.toString());
					idfr.resolve(1);

					return;
				}
				sourceDir.readFiles().copyTo(targetUri);

				idfr.resolve && idfr.resolve();
			});
		}
	}

}());