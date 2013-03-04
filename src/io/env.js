(function(G) {

	var mainFile = process.mainModule.filename,
		uri = new net.URI(mainFile.replace(/\\/g, '/'));

	if (uri.file == null) {
		uri.path = G.urlhelper.getDir(uri.path);
	}


	global.io == null && (global.io = {});
	io.env = {
		applicationDir: uri,
		currentDir: new net.URI(net.URI.combine(process.cwd(), '/')),
        newLine: process ? (process.platform == 'win32' && '\r\n' || '\n') : '\r\n'
	};


}(global));
