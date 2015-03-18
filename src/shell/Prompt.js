if (atma.shell == null) {
	atma.shell = {};
}

module.exports = atma.shell.Prompt = {
	prompt: function(str, callback){
		Factory.create(new PromptAction(str, callback));
	},
	confirm: function(str, callback){
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


var Factory = Class({
	collection: [],
	busy: false,
	Static: {
		create: function(prompt){
			if (rl == null) {
				initialize();
				factory_ = new Factory;
			}
			
			factory_.collection.push(prompt);
			factory_.process();
		}
	},
	
	Self: {
		process: function(){
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
		},
		next: function(){
			this.busy = false;
			this.process();
		}
	}
});

var PromptAction = Class({
	Base: Class.Deferred,
	text_: '>',
	callback_: null,
	
	Construct: function(text, callback){
		this.text_ = text;
		this.callback_ = callback;
	},
	process: function(){
		rl.resume();
		
		process.stdout.write('\n');
		rl.question(this.text_, this.onInput.bind(this));
		return this;
	},
	
	onInput: function(answer){
		rl.pause();
		this.callback_ && this.callback_(answer);
		this.resolve(answer);
	}
});

var ConfirmAction = Class({
	Base: PromptAction,
	Construct: function(){
		var original = this.callback_;
		
		this.callback_ = function(answer){
			original(/^y|yes$/ig.test(answer));
		};
	},
	
	Override: {
		onInput: function(answer){
			
			if (!answer) {
				this.process();
				return;
			}
			this.super(answer);
		}
	}
})