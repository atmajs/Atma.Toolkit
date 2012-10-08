void

function() {

    var w = global,
        r = ruqq,
        helper = {
            process: {
                js: function(solution, stack, output) {
                    var includeIndex = r.arr.indexOf(stack, function(x) {
                        return x.url.indexOf('include.js') > -1;
                    });

                    for (var i = 0, x, length = stack.length; x = stack[i], i < length; i++) {

                        if (i > includeIndex) {
                            var s = String.format( //
                            "var include = new IncludeResource('%1','%2','%3',null,null,'%4')", //
                            x.type, x.namespace ? '' : x.url, x.namespace || '', x.id //
                            );
                            output.js.push(s);
                        }

                        output.js.push(x.source);
                    }

                    var info = String.format("include.cfg(%1); include.register(%2)", //
                    JSON.stringify(window.include.cfg()), //
                    JSON.stringify(solution.bin));

                    output.js.splice(includeIndex + 1, 0, info);

                    if (solution.type == 'js') output.push(resource.source);
                    output.js = output.js.join(w.sys.newLine + ';');
                },
                css: function(solution, stack, output) {

                    for (var i = 0, x, length = stack.length; x = stack[i], i < length; i++) {
                        var images = new w.handler.CssHandler(solution.uri, solution.uris.outputDirectory.toDir(), x);
                        if (images && images.length) {
                            (new handler.io.FileCopier()).copySync(images);
                        }
                    }
                    output.css = r.arr.select(stack, 'source').join(w.sys.newLine);
                },
                lazy: function(solution, stack, output) {
                    this.ofType('lazy', solution, stack, output);
                },
                load: function(solution, stack, output) {
                    this.ofType('load', solution, stack, output);
                },
                ofType: function(type, solution, stack, output) {
                    var stream = [];
                    for (var i = 0, x, length = stack.length; x = stack[i], i < length; i++) {
                        stream.push(String.format("<script type='include/#{type}' data-appuri='#{appuri}' data-id='#{id}'> #{source} </script>", {
                            type: type,
                            appuri: x.namespace || x.appuri,
                            source: x.source,
                            id: x.id
                        }));
                    }
                    output[type] = stream.join(w.sys.newLine);
                },


            }
        };

        
    include.promise('action').builder = {    
        ofType: function(type, solution) {
            var stack = includesStack.resolve(type, solution.resource.includes);
            if (!stack.length) return;

            solution.bin[type] = r.arr.select(stack, ['id', 'url', 'namespace']);
            solution.output[type] = [];
            helper.process[type](solution, stack, solution.output);
        },

        combine: function(solution) {
            solution.output = {};
            solution.bin = {};


            this.ofType('css', solution);
            this.ofType('lazy', solution);
            this.ofType('load', solution);

            this.ofType('js', solution);
        }
    }




    var includesStack = (function() {
        
        function build(type, includes) {
            if (!includes && !includes.length) return null;
            var arr = [];
            for (var i = 0; i < includes.length; i++) {

                var resource = includes[i];
                var stack = build(type, resource.includes);
                if (stack && stack.length) arr = arr.concat(stack);

                if (resource.type == type) arr.push(resource);
            }
            return arr;
        }

        function distinct(stack) {
            for (var i = 0; i < stack.length; i++) {
                for (var j = 0; j < i; j++) {
                    if (stack[i].url == stack[j].url) {
                        stack.splice(i, 1);
                        i--;
                        break;
                    }
                }
            }
            return stack;
        }

        function resolve(type, includes) {
            var stack = distinct(build(type, includes));
            return type == 'css' ? stack.reverse() : stack;
        }

        return {
            resolve: resolve,
            distinct: distinct
        }
    })();


}();