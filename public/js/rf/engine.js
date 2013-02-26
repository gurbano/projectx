OATHJS.TODDLER.ENGINE = function(aHelper, aConfiguration) {
	var engine =this;
	this.pid =  Math.random() * 1000; //TODO : BE REPLACED WITH PLAYER ID
	this.mouseUp = true;
	this.mouseDown = false;
	this.mouseScreenX = 0;
	this.mouseScreenY = 0;
	this.cameraZ =0;
	this.settings = new OATHJS.TODDLER.SETTINGS();
	this.projector = new THREE.Projector();
	this.picker = new OATHJS.TODDLER.ENGINE.defaultPicker(engine);	
	this.init = function(startingPosition, callback){
		engine.com = new OATHJS.TODDLER.COM(engine.settings.socketServer);
		engine.helper.info('--- MAIN ENGINE INITIALIZATION ---')
		engine.toddler = new OATHJS.TODDLER.TODDLER();
		engine.com.init( engine);
		engine.toddler.init(startingPosition, function(){
			engine.world = new OATHJS.TODDLER.WORLD();
			engine.world.init(engine,startingPosition,function(){				
			//	for (var i=0; i<100; i++){
			//		engine.world.addSphere(Math.random()*200-100,Math.random()*200-100);
			//	}				
				//engine.toddler3d = engine.toddler.mesh;
				/*DO ENGINE INITIALIZATION*/
				engine.scene = new THREE.Scene();
				//engine.scene.fog = new THREE.FogExp2( 0x000000, 0.007 );
				engine.camera = new THREE.PerspectiveCamera(engine.configuration.fov, engine.configuration.canvasW/engine.configuration.canvasH, 1, 4000);
				engine.cameraZ = engine.configuration.cameraZ;
				engine.camera.position.set( startingPosition.x, startingPosition.y,  engine.cameraZ);
				engine.camera.lookAt(  startingPosition);	
				engine.scene.add( engine.camera);		
				engine.scene.add( engine.toddler.mesh );
				engine.stats = new Stats();
				//engine.renderer = Detector.webgl? new THREE.WebGLRenderer({ antialias: false }): new THREE.CanvasRenderer();		
				engine.renderer =new THREE.WebGLRenderer();
				engine.renderer.setClearColorHex(engine.configuration.bgColor);
				engine.renderer.setSize( engine.configuration.canvasW,engine.configuration.canvasH);	
				engine.renderer.shadowMapSoft = true;
				//ADD WORLD
				engine.scene.add(engine.world.scene);
				
				callback();	
			});					
		});
		
	};
	this.updateCamera = function(){
		engine.camera.position.set( engine.toddler.mesh.position.x, engine.toddler.mesh.position.y, engine.cameraZ - (engine.toddler.speed*5) );
	};
	this.render = function(){
		$(document).trigger('render');				
		engine.renderer.render(engine.scene,engine.camera);
	};
	this.onMouseMove = function(event){
		x = event.pageX - engine.configuration.canvasW/2;
		y = event.pageY - engine.configuration.canvasH/2;
		var angle = -90 + Math.atan2(-y,x) * (180 / Math.PI);			
		engine.toddler.rotate(-1 * engine.helper.deg2rad(angle));
		engine.mouseScreenX = x;
		engine.mouseScreenY = y;	
		$(document).trigger('mouseMoved',[new THREE.Vector2(x,y),engine.screen2world(x,y)]);
		engine.showInfo(event,x,y);
	};
	this.showInfo = function(event,x,y){
		var origin = engine.screen2world(x,y);
		var object = engine.world.getObjectAt(origin, 
				function(collided){					
					//engine.helper.info("Object " + collided.name + " collided");
					if(!collided.collided){
						$('#hudTooltip').css('left', event.pageX + 'px');
						$('#hudTooltip').css('top', event.pageY + 'px');
						$('#hudTooltip').css('display','');
						$('#hudTooltip').html("<div id='hudTooltipText'>"+collided.name+"</div>");
						$('body').css('cursor','crosshair');
					}
					collided.collided=true;
				},
				function(uncollided){
					if(uncollided.collided){
						$('#hudTooltip').css('display','none');
						$('body').css('cursor','default');						
						uncollided.collided=false;
					}
				});	
		
	};
	this.onMouseUp = function(event){
		if (event.which==1){
			engine.mouseUp = true;
			engine.mouseDown = false;		
		}
	};
	this.onMouseDown = function(event){
		event.preventDefault();
		if (event.which==1){
			if (!engine.pickObject(x,y )){
				engine.mouseUp = false;
				engine.mouseDown = true;
			}
		}
		if (event.which==2){
			engine.addObject(event.pageX,event.pageY );
		}
		if (event.which==3){
			
			
		}			
	};
	this.zoom = function(delta){
		engine.cameraZ += (engine.configuration.wheelspeed*delta);
	};
	this.update = function(){
			//if (engine.world.dirty){
			//	engine.scene.remove(engine.world.scene);
			//	engine.scene.add(engine.world.scene);
			//}
			engine.stats.update();				
			engine.updateHUD();
			engine.toddler.update(engine, function(){
				engine.world.update(engine.toddler);
			});
			engine.updateCamera();
	};	
	this.animate = function(){
		//if (scene.__webglObjects && scene.__webglObjects.length>500)
		//	WORLD.reset(function(){});
		engine.update();
		requestAnimationFrame(engine.animate);			
		engine.render();
	}
	this.start = function(callback){
		engine.animate();
		callback();
	};
	this.updateHUD = function(){		
			var obj = engine.toddler.mesh;
			$('#position').html("pos [" + Math.round(obj.position.x) + "," +Math.round(obj.position.y)+","+Math.round(obj.position.z)+"]");
			obj = engine.camera;
			$('#camera').html("camera [" + Math.round(obj.position.x) + "," +Math.round(obj.position.y)+","+Math.round(obj.position.z)+"]");
			$('#mouse').html("mouse ("+ (engine.mouseDown ? "+" : "-") +")[" + Math.round(engine.mouseScreenX) + "," +Math.round(engine.mouseScreenY)+"]");
			$('#world').html("world " + engine.helper.v2s(engine.screen2world(engine.mouseScreenX,engine.mouseScreenY)));
			$('#rotation').html("rotation [" + Math.round(engine.helper.rad2deg(obj = engine.toddler.mesh.rotation.z)) +"]");
			$('#speed').html("speed["+ engine.helper.round(engine.toddler.speed,3)+"]");
			if(engine.scene.__webglObjects){
				$('#info').html("obj count ["+engine.scene.__webglObjects.length+"] | myobj count ["+engine.world.elementSize+"]");		
			}				
		};
	this.screen2world = function(x,y){
		var vector = new THREE.Vector3(( x / engine.configuration.canvasW ) * 2 ,- ( (y -15) / engine.configuration.canvasH ) * 2  ,0 );
		var cam = engine.camera;
		var projector = new THREE.Projector();
		projector.unprojectVector( vector,  cam);
		var dir = vector.sub( cam.position ).normalize();
		var ray = new THREE.Ray( cam.position, dir );
		var distance = -  cam.position.z / dir.z;
		var mouseWorld =  cam.position.clone().add( dir.multiplyScalar( distance ) );
		return mouseWorld;
	};
	this.pickObject = function(x,y){
		var picked = false;
		var origin = engine.screen2world(x,y);
		engine.world.getObjectAt(origin, 
				function(collided){					
					engine.picker.pickObject(collided);
					picked = true;
				},
				function(uncollided){
					engine.picker.unpickObject(uncollided);
				});	
		return picked;
	};
	this.addObject = function(x,y){
		var pos = engine.screen2world(engine.mouseScreenX,engine.mouseScreenY);
		engine.helper.info('adding sphere in ' + engine.helper.v2s(pos));
		engine.world.addSphere(pos.x,pos.y);
	};
	(function() {
	$('#hudTooltip').css('display','none');
		engine.helper = aHelper;
		engine.configuration = aConfiguration;
		
	})();
};

OATHJS.TODDLER.ENGINE.defaultPicker = function(engine){
	var picker = this;
	this.engine = null;
	this.pickObject = function(object){		
		picker.engine.helper.info('picked ' + object.name);
	};
	this.unpickObject = function(object){
		
	};
	(function() {
		picker.engine = engine;
	})();
};



