include.js({
    handler: ['files/includeRoutes']
}).done(function() {

    var w = window,
        p = w.program,
        path = p.args[1],
        targetUri = new net.URI(process.cwd() + '/'),
        sourceDir = new io.Directory(io.env.applicationDir.combine('/template/').combine(path));

    if (sourceDir.exists() == false) {
        return console.error('Source Directory Not Found - ', sourceDir.uri.toString());
    }

    sourceDir.readFiles().copyTo(targetUri);

    return 0;
});