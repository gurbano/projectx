var $time = Date.now || function() {
  return +new Date;
};
var OATHJS = {};


OATHJS.TODDLER = function(){
	var app = this;
	var model,
		workers, 
		configuration,
		helper,	 
		engine,
		settings,
		terminal;
	
	app.start = function(){
		settings = new OATHJS.TODDLER.SETTINGS();
		configuration = new OATHJS.TODDLER.CONFIGURATION();
		helper = new OATHJS.TODDLER.HELPER(configuration);
		terminal = new OATHJS.TODDLER.TERMINAL($('#terminal'),$('#hud'));
		engine = new OATHJS.TODDLER.ENGINE(helper,configuration);
		
		engine.init(
			new THREE.Vector3(10,10,0), //STARTING POSITION : LOAD FROM DB
			function(){
				engine.start(function(){
					helper.toast('Visualization process started');
				});
				document.body.appendChild( engine.renderer.domElement );			
				document.body.appendChild( engine.stats.domElement );		
				document.addEventListener( 'mousemove', engine.onMouseMove, false );	
				document.addEventListener( 'mouseup', engine.onMouseUp, false );
				document.addEventListener( 'mousedown', engine.onMouseDown, false );	
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