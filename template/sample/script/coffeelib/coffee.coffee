include
   .load('mask.mask')
   .css('less.less')
   .done (resp) ->
		dom = mask.render(resp.load.mask);
		document.body.appendChild(dom);