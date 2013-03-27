include.routes({
	script: '/script/{0}.js',
	component: '/script/component/{0}/{1}.js',
	mycoffee: '/script/coffeelib/{0}.coffee'
}).js({
	ruqq: 'dom/zepto',
	lib: 'compo',
	script: ['first'],
	mycoffee: 'coffee',
	component: ['reloaded'],
}).done(function(resp){

	document.body.appendChild(mask.render(document.getElementById('layout').innerHTML));

    jmask('div > reloaded; h1 > "Completed"').appendTo(document.body);
    
});
