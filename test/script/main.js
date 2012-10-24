include.js({
	lib: 'compo',
	framework: 'dom/zepto'
}).ready(function(){
	
	new Compo('#layout').render().insert(document.body);
	
});