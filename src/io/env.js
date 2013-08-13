

var mainFile = process.mainModule.filename,
	uri = new net.Uri(mainFile);

global.io == null && (global.io = {});

io.env = {
	applicationDir: uri,
	currentDir: new net.Uri(net.Uri.combine(process.cwd(), '/')),
	newLine: process ? (process.platform == 'win32' && '\r\n' || '\n') : '\r\n'
};



