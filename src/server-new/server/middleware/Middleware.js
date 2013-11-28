

include.exports = Class.Collection(Function, {
	
	add: function(middlware){
		if (typeof middlware !== 'function') {
			logger.error('<middleware> registering not a function');
			return this;
		}
		
		this.push(middlware);
		return this;
	},
	
	Self: {
		listener: function(req, res){
			
			this.next(req, res, -1);
		},
		
		
		next: function(req, res, index){
			if (++index >= this.length) {
				res.writeHeader(404, {
					'Content-Type': 'text/plain'
				});
				
				res.end('404 ' + (req.filePath || ''));
				return;
			}
			
			this[index](req, res, this.next.bind(this, req, res, index));
		}
	}
});