
/**
 * Module dependencies.
 */
var url = "http://toddler-7138.onmodulus.net";
//var url = "http://127.0.0.1:3000";
var httpProxy = require('http-proxy');
    
var express = require('express')
  , http = require('http') 
  , path = require('path') 
  , Log = require('log')  
  , util = require('util')
  , log = new Log()
  , fs = require('fs')
  , hbs = require('hbs')        
  , passport = require('passport') 
  , LocalStrategy = require('passport-local').Strategy
  , FacebookStrategy = require('passport-facebook').Strategy
  , GoogleStrategy = require('passport-google').Strategy
  , FlickrStrategy = require('passport-flickr').Strategy
  , flash = require('connect-flash')
  , i18next = require('i18next'),
  io = require('socket.io'); 
var app = express();





app.configure(function(){ 
  app.set('port', process.env.PORT || 3000);
  app.set('view engine', 'html');
  app.engine('html', require('hbs').__express);
  app.set('views', __dirname + '/views');
  app.set("view options", { layout: false });
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('keyboardcat'));
  app.use(express.session({ cookie: { maxAge: 60000 }}));
  app.use(flash());
  //PASSPORT
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

  
 
var partialsDir = __dirname + '/views/partials';
var filenames = fs.readdirSync(partialsDir);
filenames.forEach(function (filename) {
  var matches = /^([^.]+).html$/.exec(filename);
  if (!matches) {
    return;
  }
  var name = matches[1];
  var template = fs.readFileSync(partialsDir + '/' + filename, 'utf8');
  hbs.registerPartial(name, template);
});
 

app.configure('development', function(){
  app.use(express.errorHandler());
});
/*CONFIGURE LOG*/
log.level = Log.DEBUG;
log.stream = fs.createWriteStream('logs/dev.log', { flags: 'w' });

/*CONFIGURE i18n*/
i18next.init({
    ns: { namespaces: ['translation'], defaultNs: 'translation'},
    resSetPath: 'locales/__lng__/new.__ns__.json',
    saveMissing: true
});
app.use(i18next.handle);
i18next.registerAppHelper(app)
    .serveClientScript(app)
    .serveDynamicResources(app)
    .serveMissingKeyRoute(app);

require('./routes/index')(app, log, passport);
 

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});



io = io.listen(server);


io.sockets.on('connection', function (socket) {
  socket.on('client2server', function (data) {
	if (data.type=="requestUpdateWorld"){
		socket.emit('server2client',{type:'updateWorld', uid:'server', center: data.center});
	}else{
		io.sockets.emit('server2client', data); //BROADCAST
	}
  });
});






/*AUTHENTICATION*/
 
var users = [
    { id: 1, username: 'bob', password: 'secret', email: 'bob@example.com' }
  , { id: 2, username: 'joe', password: 'birthday', email: 'joe@example.com' }
  , { id: 3, username: 'a', password: 'a', email: 'joe@example.com' }
];  

function findById(id, fn) {
  var idx = id - 1;
  if (users[idx]) {
    fn(null, users[idx]);
  } else {
    fn(new Error('User ' + id + ' does not exist'));
  }
}

function findByUsername(username, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.username === username) { 
      return fn(null, user); 
    }    
  }         
  return fn(null, null);    
} 

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
 
passport.deserializeUser(function(id, done) {
  findById(id, function (err, user) {
    done(err, user);
  });
});
 

// Use the LocalStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.  In the real world, this would query a database;
//   however, in this example we are using a baked-in set of users.
passport.use(new LocalStrategy(
  function(username, password, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {      
      // Find the user by username.  If there is no user with the given
      // username, or the password is not correct, set the user to `false` to
      // indicate failure and set a flash message.  Otherwise, return the
      // authenticated `user`.
      findByUsername(username, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
        return done(null, user);
      })
    });
  }
));  
  

passport.use(new FacebookStrategy({
     clientID: "252881624841664",
    clientSecret: "af7643317e05f3939f65468d7d14c329",
    callbackURL: url+"/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {   
      return done(null, profile);
    });
  }
));

passport.use(new GoogleStrategy({
    returnURL: url + '/auth/google/return',
    realm: url
  },
  function(identifier, profile, done) {
     process.nextTick(function () {   
      return done(null, profile);
    });
  }
));

passport.use(new FlickrStrategy({
    consumerKey: "6cd4ca65a261655c0bf97e002bc1de52",
    consumerSecret: "5786ffafc33acb10",
    callbackURL: url + "/auth/flickr/callback"
  },
  function(token, tokenSecret, profile, done) {
     process.nextTick(function () {   
      return done(null, profile);
    });
  }
));
