import { class_Dfr } from 'atma-utils';

export class Prompt {
    prompt (str, callback){
        Factory.create(new PromptAction(str, callback));
    }
    confirm (str, callback){
        Factory.create(new ConfirmAction(str + ' (y): ', callback));
    }
};



var rl,
    factory_;

function initialize() {

    var readline = require('readline');

    rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
}


class Factory {
    collection = []
    busy = false
    static create (prompt){
        if (rl == null) {
            initialize();
            factory_ = new Factory;
        }

        factory_.collection.push(prompt);
        factory_.process();
    }

    process () {
        if (this.busy)
            return;

        if (this.collection.length === 0)
            return;

        this.busy = true;
        this
            .collection
            .shift()
            .process()
            .always(this.next);
    }
    next (){
        this.busy = false;
        this.process();
    }

};

class PromptAction extends class_Dfr {
    text_ = '>'
    callback_ = null

    constructor(text, callback){
        super();
        this.text_ = text;
        this.callback_ = callback;
    }
    process (){
        rl.resume();

        process.stdout.write('\n');
        rl.question(this.text_, this.onInput.bind(this));
        return this;
    }

    onInput (answer){
        rl.pause();
        this.callback_?.(answer);
        this.resolve(answer);
    }
};

class ConfirmAction extends PromptAction {
    constructor (text, callback){
        super(text, callback);

        var original = this.callback_;

        this.callback_ = function(answer){
            original(/^y|yes$/ig.test(answer));
        };
    }


    onInput (answer){
        if (!answer) {
            this.process();
            return;
        }
        super.onInput(answer);
    }
}
