include.js({
	ruqq: 'dom/zepto',
	lib: 'compo'
}).ready(function(){
	
	new Compo(document.getElementById('layout').innerHTML).render().insert(document.body);
	
});