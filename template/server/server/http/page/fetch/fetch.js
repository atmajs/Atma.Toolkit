var _busy = false;

include.exports = atma.server.HttpPage({
    
    onRenderStart: function(req, res){
        
        if (_busy) {
            this.model = {
                message: 'Processing ...'
            };
            return;
        }
        
        _busy = true;
        
        var remoteAddress = req.connection.remoteAddress;
        
        if (remoteAddress == null) {
            // iisnode
            remoteAddress = req
                .headers['x-forwarded-for']
                .replace(/:.+/, '');
        }
        
        
        if (req.method === 'POST'
            && (
                remoteAddress === '127.0.0.1'
                || /^204\.232\.175\./.test(remoteAddress)
                || /^192\.30\.252\./.test(remoteAddress)
            )) {
            
        
            
            var stream = require('child_process')
                .spawn('cmd', ['/C', 'tools\\fetch.bat'], {
                    cwd: process.cwd(),
                    env: process.env,
                    stdio: 'inherit'
                });
                
            stream.on('close', function(code){
                _busy = false;
                logger.log('<page:fetch> done');
            });
            
            this.model = {
                title: 'Started ... '  
            };
            return;
        }
        
        this.model = {
            title: 'Access denied ...'
        };
        
        logger.error('<page:fetch> Access denied [%s] %s', req.method, remoteAddress);
            
        //- this.ctx.rewrite = '/error/401';
    }
});