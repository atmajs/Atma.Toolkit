void function(){
    
    global.sys = {
        newLine: process ? (process.platform == 'win32' && '\r\n' || '\n') : '\r\n'
    }
}();