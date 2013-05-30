var $time = Date.now || function() {
  return +new Date;
};
var OATHJS = {};


OATHJS.TODDLER = function(){
	var app = this;
	app.model,
		app.workers, 
		app.configuration,
		app.helper,	 
		app.engine,
		app.settings,
		app.terminal;
	
	app.start = function(){
		settings = new OATHJS.TODDLER.SETTINGS();
		configuration = new OATHJS.TODDLER.CONFIGURATION();
		helper = new OATHJS.TODDLER.HELPER(configuration);
		terminal = new OATHJS.TODDLER.TERMINAL($('#terminal'),$('#hud'));
		engine = new OATHJS.TODDLER.ENGINE(helper,configuration);
		
		engine.init(
			new THREE.Vector3(0,25,0), //STARTING POSITION : LOAD FROM DB
			function(){
				engine.start(function(){
					helper.toast('Visualization process started');
				});
				document.body.appendChild( engine.renderer.domElement );			
				document.body.appendChild( engine.stats.domElement );		
				document.addEventListener( 'mousemove', engine.onMouseMove, false );	
				document.addEventListener( 'mouseup', engine.onMouseUp, false );
				document.addEventListener( 'mousedown', engine.onMouseDown, false );
				document.addEventListener( 'keydown', engine.onKeyDown, false );
				document.addEventListener( 'keyup', engine.onKeyUp, false );
				
				$(document).mousewheel( function(e, delta){
					engine.zoom(delta);
				});					
			}
		);
		
		helper.info("Socket server " + settings.socketServer);
		helper.info("debug mode " + configuration.debug);
		helper.debug("debug message ");
	};
	(function() {
		app.start();
		return app;
	})();
};