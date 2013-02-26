
/*
 * GET home page.
 */
 
module.exports = function(app, log, passport){
	
	app.post('/', function(req, res){		
		res.redirect('/index');
	});
	app.get('/', function(req, res){		
		res.redirect('/index');
	});
	app.get('/index',
	//ensureAuthenticated,
	function(req, res){	  
	  res.render("index", {
			usr: req.user,
			info: req.flash('info'),
			error: req.flash('error'),
			title: "Toddler. Makes no sense at all, it's just an experiment.",
			active:"menu_home"
		});
	});
//	app.get('/login',function(req, res){
//	  res.render("login", {
//			info: req.flash('info'),
//			error: req.flash('error'),
//			title: "Please login",
//			active:"menu_home"
//		});
//	});
	app.post('/login', 
		passport.authenticate('local', 
			{ failureRedirect: '/login', failureFlash: true }),
			function(req, res) {
				req.flash('info', 'Welcome man');
				res.redirect('/');
	});
	app.get('/logout', function(req, res){
		req.logout();
		res.redirect('/');
	});
	
	/*FB*/
	app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['read_stream', 'publish_actions'] }));
	app.get('/auth/facebook/callback', 
		passport.authenticate('facebook', { successRedirect: '/',failureRedirect: '/login' }));
	
	/*GOOGLE*/
	app.get('/auth/google', passport.authenticate('google'));
	app.get('/auth/google/return', 
		passport.authenticate('google', { successRedirect: '/',
                                    failureRedirect: '/login' }));
									
	/*FLICKR*/
	app.get('/auth/flickr',
	  passport.authenticate('flickr'),
	  function(req, res){
		// The request will be redirected to Flickr for authentication, so this
		// function will not be called.
	  });

	app.get('/auth/flickr/callback', 
	  passport.authenticate('flickr', { failureRedirect: '/login' }),
	  function(req, res) {
		// Successful authentication, redirect home.
		res.redirect('/');
	  });

};

