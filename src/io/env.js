(function(G) {

	var uri = new net.URI(process.argv[1].replace(/\\/g, '/'));

	if (uri.file == null) {
		uri.path = G.urlhelper.getDir(uri.path);
	}

	
	global.io == null && (global.io = {});
	io.env = {
		applicationDir: uri,
		currentDir: new net.URI(process.cwd())
	};


}(global));