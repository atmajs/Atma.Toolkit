void function(){
    
    window.sys = {
        newLine: process ? (process.platform == 'win32' && '\r\n' || '\n') : "\r\n"
    }
}();