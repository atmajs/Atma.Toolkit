
var passport = require('passport'),
	config = app.config.passport.github;
	
var GitHubStrategy = require('passport-github').Strategy;

passport.use(new GitHubStrategy({
	
	clientID: config.id,
	clientSecret: config.secret,
	callbackURL: config.callback
	
}, function(accessToken, refreshToken, profile, done) {
	
	console.log('[passport auth] done - ', profile);
	
	done(null, { id: profile.id, username: profile.username });
	
}));

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(obj, done) {
	done(null, obj);
});


include.exports = atma.server.HttpService({
	
	'!/auth/github': function(req, res){
		
		console.log('auth/github', arguments.length);
		
		var callback = function(){
			
			console.log('!/ - callback');
		}
		passport.authenticate('github')(req, res, callback);
	},
	
	'!/auth/github/callback': function(req, res){
		
		req.query = ruta.parse('', req.url).params;
		
		
		
		function callback(err, user, info) {
			debugger;
			console.log('!/callback - next', arguments.length);
		}
		
		passport.authenticate('github',  {
			successRedirect: '/',
            failureRedirect: '/login' })(req,res, callback);
	}

});