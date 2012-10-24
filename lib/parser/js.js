void
function() {

    var w = window,
        regexp = {
            '\n\r': /[\n\r]/g
        },
        helper = {
            isInComment: function(S) {
                var islinecomment, isblockcomment;
                for (var i = S.index - 1; i > 1; i--) {
                    var c = S.text[i];
                    if (islinecomment == null) {
                        if (c == '/' && S.text[i - 1] == '/') return true;
                        if (c == '\r' || c == '\n') islinecomment = false;
                    }

                    if (isblockcomment == null) {
                        if (c == '/' && S.text[i - 1] == '*') isblockcomment = false;
                        if (c == '*' && S.text[i - 1] == '/') return true;
                    }

                    if (islinecomment == false && isblockcomment == false) return false;
                }
                return false;
            }
        };


    var TextParser = Class({
        Construct: function(text) {
            this.text = text;
            this.index = 0;
            this.length = text.length;
            return this;
        },
        next: function() {
            this.index++;
            return this;
        },
        skipWhitespace: function() {
            for (; this.index < this.length; this.index++) {
                var code = this.text.charCodeAt(this.index);
                if (code !== 32 /*' '*/ && code !== 10 && code !== 13 && code !== 9) return this;
            }

            return this;
        },
        skipToChar: function(c) {
            var index = this.text.indexOf(c, this.index);
            if (index > -1) {
                this.index = index;
                if (this.text.charCodeAt(index - 1) !== 92 /*'\\'*/ ) {
                    return this;
                }
                this.next().skipToChar(c);
            }
            return this;

        },
        skipToAny: function(chars) {
            var r = regexp[chars];
            if (r == null) {
                console.error('Unknown regexp %s: Create', chars);
                r = (regexp[chars] = new RegExp('[' + chars + ']', 'g'));
            }

            r.lastIndex = this.index;
            var result = r.exec(this.text);
            if (result != null) {
                this.index = result.index;
            }
            return this;
        },
        skipTo: function(regexp) {
            regexp.lastIndex = this.index;
            var result = regexp.exec(this.text);
            if (result != null) {
                this.index = result.index;
            } else {
                this.index = this.length;
            }
            return this;
        },
        sliceToChar: function(c) {
            var start = this.index,
                isEscaped, index;

            while ((index = this.text.indexOf(c, this.index)) > -1) {
                this.index = index;
                if (this.text.charCodeAt(index - 1) !== 92 /*'\\'*/ ) {
                    break;
                }
                isEscaped = true;
                this.index++;
            }

            var value = this.text.substring(start, this.index);
            return isEscaped ? value.replace(regexp.escapedChar[c], c) : value;

            //-return this.skipToChar(c).template.substring(start, this.index);
        },
        sliceToAny: function(chars) {
            var start = this.index;
            return this.skipToAny(chars).text.substring(start, this.index);
        },
        sliceTo: function(regexp) {
            var start = this.index;
            return this.skipTo(regexp).text.substring(start, this.index);
        },
        eof: function() {
            return this.index > this.length - 1;
        },
        Char: function() {
            return this.text[this.index];
        }

    });


    var fns = {
        cfg: 1,
        js: 1,
        load: 1,
        css: 1,
        lazy: 1
    }

    var go = {
        nameEnd: function(S) {
            S.skipTo(/[^\w]/g);
            return S.index;
        },
        commentEnd: function(S) {
            switch (S.next().Char()) {
            case '*':
                S.skipTo(/(\*\/)/g);
                S.index += 1;
                break;
            case '/':
                S.skipToAny('\n\r');
                break;
            default:
                return;
            }
        },
        blockEnd: function(S) {
            var start = S.Char(),
                counter = 1;

            var end = {
                '(': ')',
                '{': '}'
            }[start];

            if (end == null) throw new Error('Unknown Block Char %s at %d', start, S.index);

            S.next();
            for (; S.index < S.length; S.index++) {
                var c = S.Char();
                switch (c) {
                case '/':
                    go.commentEnd(S);
                    continue;
                case "'":
                case '"':
                    S.next().skipToChar(c);
                    continue;
                case end:
                    if (--counter == 0) return;
                    continue;
                case start:
                    ++counter;
                    continue;
                }
            }
        }
    }

    var Parser = {
        include: function(S, stream) {
            if (stream == null) stream = [];


            var buffer = [];
            buffer.push('include');
            out: for (; S.index < S.length; S.index++) {
                S.skipWhitespace();

                var _goout = false;
                switch (S.Char()) {
                case '/':
                    go.commentEnd(S);
                    break;
                case '.':
                    S.next().skipWhitespace();

                    var fnName = S.sliceTo(/[^\w]/g);

                    S.skipWhitespace();

                    if (S.Char() != '(') {
                        //throw new Error('ParseError at ' + S.index+  '. "(" expected, but ' + S.Char() + ' seen');
                        //-_goout = true;
                        break out;
                    }

                    var start = S.index,
                        args;
                    go.blockEnd(S);

                    if (start + 1 == S.index) args = '';
                    else args = S.text.substring(start + 1, S.index);


                    //-console.log('args',fnName, args, S.text[S.index + 1]);                    
                    if (fns[fnName] != null) {

                        buffer.push('.');
                        buffer.push(fnName);
                        buffer.push('(');
                        buffer.push(args);
                        buffer.push(')');

                    }
                    
                    break;
                case ';':
                    //-_goout = true;
                    break out;
                default:
                    if (/[\w]/.test(S.Char())) {
                        --S.index;
                        //-_goout = true;
                        break out;
                    }
                    break;
                }

                if (_goout) break;
            }

            if (buffer.length > 1) {
                var args = [stream.length - 1, 0]
                Array.prototype.splice.apply(stream, args.concat(buffer));
            }

            return stream;
        }
    };



    var Include = Class({
        Construct: function() {
            this.includes = [];
            ruqq.arr.each(['js', 'css', 'load', 'lazy'], function(x) {
                this[x] = function(pckg) {
                    w.include.helper.eachIncludeItem(x, pckg, function(namespace, url) {
                        this.includes.push({
                            type: x,
                            url: url,
                            namespace: namespace
                        });
                    }.bind(this));
                    return this;
                }
            }.bind(this));
        },
        cfg: w.include.cfg
    });


    w.include.promise('parser').js = {
        extractIncludes: function(code, directory, variables) {
            var regexp = new RegExp(/(^include)|(([\s;\}]{1})include)/g),
                S = new TextParser(code),
                js = '';

            var includes = [];
            while (S.index < S.length) {
                if (S.skipTo(regexp).eof()) break;
                if (helper.isInComment(S)) {
                    S.next();
                    continue;
                }

                var start = S.index;
                S.next();
                go.nameEnd(S);

                includes.push(';');
                Parser.include(S, includes);
            }

            var javascriptCode = includes.join('');
            if (!javascriptCode) return [];

            
            /**
             *  In Some Cases variables can be used in arguments,
             *  for now that variables must be before speciefied in build.config file.
             *
             *  But using http://esprima.org/ variables can be handled inline
             */
            
            var include = new Include();
            try {
                
                if (variables){
                    javascriptCode = variables +';' + javascriptCode;                    
                }
                
                eval(javascriptCode);
            } catch (e) {
                console.log('Javascript Include Eval Error:', javascriptCode, e);
                return [];
            }

            return include.includes;
        }
    };

}();