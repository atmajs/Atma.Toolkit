include.js({
	ruqq: 'dom/zepto',
	lib: 'compo'
}).ready(function(){
	
	new Compo('#layout').render().insert(document.body);
	
});