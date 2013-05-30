


OATHJS.TODDLER.ENGINE = function(aHelper, aConfiguration) {
	var engine =this;
	this.pid =  Math.random() * 1000; //TODO : BE REPLACED WITH PLAYER ID
	this.mouseUp = true;
	this.mouseDown = false;
	this.mouseScreenX = 0;
	this.mouseScreenY = 0;
	this.cameraZ =0;
	this.camera = null;
	this.controls = {};
	this.clock = $time();
	this.mouse2D;
	this.mouse3D;
	this.raycaster;
	this.voxelPosition = new THREE.Vector3();
	this.tmpVec = new THREE.Vector3();
	this.theta = 0 * 0.5;
	this.isShiftDown = false;
	this.isCtrlDown = false;
	this.settings = new OATHJS.TODDLER.SETTINGS();
	this.projector = new THREE.Projector();
	this.picker = new OATHJS.TODDLER.ENGINE.defaultPicker(engine);	
	this.init = function(startingPosition, callback){
		engine.com = new OATHJS.TODDLER.COM(engine.settings.socketServer);
		engine.helper.info('--- MAIN ENGINE INITIALIZATION ---')
		engine.toddler = new OATHJS.TODDLER.TODDLER(helper);
		engine.com.init( engine);
		engine.toddler.init(startingPosition, function(){
			engine.world = new OATHJS.TODDLER.WORLD();
			engine.world.init(engine,startingPosition,function(){				
				engine.scene = new THREE.Scene();
				
				//engine.scene.fog = new THREE.FogExp2(engine.configuration.bgColor, 0.0065);
				//engine.camera = new THREE.PerspectiveCamera(engine.configuration.fov, engine.configuration.canvasW/engine.configuration.canvasH, 1, 400);
				//engine.camera.position.set(0,0,0);
				
				engine.camera = new THREE.CombinedCamera( engine.configuration.canvasW, engine.configuration.canvasH, engine.configuration.fov, 1, 10000, -2000, 10000 );
				//engine.camera.up = new THREE.Vector3(0,0,-1);
				
				
				
				
				engine.camera.toOrthographic();
				engine.camera.position.x = 100;
               	engine.camera.position.y = 150;
                engine.camera.position.z = 100;
				engine.camera.setLens(engine.configuration.fov);
				engine.camera.theta = 90;
				engine.camera.lookAt(engine.scene.position);
				engine.scene.add( engine.camera);
				
				engine.mouse2D = new THREE.Vector3( 0, 10000, 0.5 );
				
			
				engine.world.scene.add(engine.toddler.mesh);		

				engine.scene.add(new THREE.AmbientLight(0x555555));
				
				if(false)engine.world.scene.add(engine.toddler.arrow);
				
				
				engine.stats = new Stats();
				engine.renderer = Detector.webgl? new THREE.WebGLRenderer({ antialias: true }): new THREE.CanvasRenderer();		
				engine.renderer.setClearColorHex(engine.configuration.bgColor);
				engine.renderer.setSize( engine.configuration.canvasW,engine.configuration.canvasH);	
				engine.renderer.shadowMapSoft = true;
				engine.renderer.shadowMapEnabled = true;
				engine.renderer.shadowCameraNear = 3;
				engine.renderer.shadowCameraFar = engine.camera.far;
				engine.renderer.shadowCameraFov = 50;

				engine.renderer.shadowMapBias = 0.0039;
				engine.renderer.shadowMapDarkness = 1.5;
				engine.renderer.shadowMapWidth = 1024;
				engine.renderer.shadowMapHeight = 1024;
				
				
				//ADD WORLD
				engine.scene.add(engine.world.scene);
				callback();	
			});					
		});
		
	};
	
	this.onMouseMove = function(event){
		x = ( event.clientX / window.innerWidth ) * 2 - 1;
		y =- ( event.clientY / window.innerHeight ) * 2 + 1;
		engine.mouseScreenX = x;
		engine.mouseScreenY = y;	
		$(document).trigger('mouseMoved',[new THREE.Vector2(x,y),engine.screen2world(x,y)]);	
		
		engine.showInfo(event,x,y);
		
		engine.mouse2D.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		engine.mouse2D.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	};
	this.getRealIntersector = function( intersects ) {
		for( i = 0; i < intersects.length; i++ ) {
			intersector = intersects[ i ];			
			return intersector;
			
		}	
		return null;
	};

	this.setVoxelPosition = function( intersector ) {
		engine.tmpVec.copy( intersector.face.normal );
		engine.tmpVec.applyMatrix4( intersector.object.matrixRotationWorld );
		engine.voxelPosition.addVectors( intersector.point, engine.tmpVec );
		engine.voxelPosition.x = Math.floor( engine.voxelPosition.x / 10 ) * 10 + 5;
		engine.voxelPosition.y = Math.floor( engine.voxelPosition.y / 10 ) * 10 + 5;
		engine.voxelPosition.z = Math.floor( engine.voxelPosition.z / 10 ) * 10 + 5;
	}
	
	
	
	
	this.showInfo = function(event,x,y){
		var origin = engine.screen2world(x,y);
		var object = engine.world.getObjectAt(origin, 
				function(collided){					
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
		event.stopPropagation();
	};
	
	this.onKeyDown = function(event){
	//	event.preventDefault();
	//	event.stopPropagation();
		//console.info(event.keyCode);
		switch( event.keyCode ) {
			case 16: engine.isShiftDown = true; break;
			case 17: engine.isCtrlDown = true; break;
			case 87: engine.controls.w = true; break;
			case 83: engine.controls.s = true; break;
			case 68: engine.controls.d = true; break;
			case 65: engine.controls.a = true; break;
		}
	};
	this.onKeyUp = function(event){
	//	event.preventDefault();
	//	event.stopPropagation();
		//console.info(event.keyCode);
		switch( event.keyCode ) {
			case 16: engine.isShiftDown = false; break;
			case 17: engine.isCtrlDown = false; break;
			case 87: engine.controls.w = false; break;
			case 83: engine.controls.s = false; break;
			case 68: engine.controls.d = false; break;
			case 65: engine.controls.a = false; break;
		}
	};
	var fov=35;
	this.zoom = function(delta){
		engine.camera.position.set(engine.camera.position.x ,engine.camera.position.y+delta,engine.camera.position.z);
		fov +=(delta*0.01);
		engine.camera.setLens(fov)
		//engine.rollOverMesh.rotation.y += delta*10;
		//console.info(engine.directionalLight.target.position.set());
	};
	
	this.animate = function(){
		/*UPDATE engine*/
		engine.update(); 
		requestAnimationFrame(engine.animate);					
		
		
	}
	/* MAIN UPDATE:
		- Trigger update (all listeners can update themselves)
		- Update main character				
		- update world (download new zones, move npc ecc.ecc.)
		- Update HUD 
		- update camera		
	*/
	this.update = function(){		
			var now = $time();
			var delta = now - engine.clock;
			engine.clock = now;			
			async.series([
				function(callback){
					$(document).trigger('update',delta);
					callback(null,delta);
				},				
				function(callback){ //UPDATE MAIN CHARACTER
					engine.toddler.update(engine);
					callback(null,true);
				},				
				function(callback){ //UPDATE WORLD (ACCORDING TO MAIN CHARACTER POSITION)
					engine.world.update(engine.toddler)
					callback(null,true);
				},
				function(callback){ //UPDATE HUD
					engine.updateHUD(); //HUD && STATS
					callback(null,true);
				},
				function(callback){ //UPDATE CAMERA
					engine.updateCamera();
					callback(null,true);
				}				
			],			
			function(err, results){				
				/*RENDER*/	
				engine.render();
			});			
	};	
	this.updateHUD = function(){	
			//UPDATE STATS
			engine.stats.update();			
			
			//UPDATE HUD
			var obj = engine.toddler.mesh;
			$('#position').html("position [" + Math.round(obj.position.x) + "," +Math.round(obj.position.y)+","+Math.round(obj.position.z)+"]");
			obj = engine.camera;
			$('#camera').html("camera [" + Math.round(obj.position.x) + "," +Math.round(obj.position.y)+","+Math.round(obj.position.z)+"]");
			$('#mouse').html("mouse ("+ (engine.mouseDown ? "+" : "-") +")[" + Math.round(engine.mouseScreenX) + "," +Math.round(engine.mouseScreenY)+"]");
			$('#world').html("world " + engine.helper.v2s(engine.screen2world(engine.mouseScreenX,engine.mouseScreenY)));
			obj = engine.toddler.mesh;
			$('#rotation').html("rotation [" 
				+ Math.round(engine.helper.rad2deg(obj.rotation.x)) +","
				+ Math.round(engine.helper.rad2deg(obj.rotation.y)) +","
				+ Math.round(engine.helper.rad2deg(obj.rotation.z)) +"]");
			$('#speed').html("speed["+ engine.helper.round(engine.toddler.speed,3)+"]");
			if(engine.scene.__webglObjects){
				$('#info').html("obj count ["+engine.scene.__webglObjects.length+"] | myobj count ["+engine.world.elementSize+"]");		
			}				
		};
	this.updateCamera = function(){
				
	};
	this.lastTick=$time();
	this.render = function(){
		engine.lastTick=$time();		
		$(document).trigger('render',[engine.lastTick, new THREE.Vector2(engine.mouseScreenX,engine.mouseScreenY),engine.screen2world(engine.mouseScreenX,engine.mouseScreenY)]);	

		
		if ( engine.isShiftDown ) {
			engine.theta += engine.mouse2D.x * 1.5;		
			//engine.camera.position.x = 100 * Math.sin( THREE.Math.degToRad( engine.theta ) );
			//engine.camera.position.z = 100 * Math.cos( THREE.Math.degToRad( engine.theta ) );
		}	
		engine.raycaster = engine.projector.pickingRay( engine.mouse2D.clone(), engine.camera );
		var intersects = engine.raycaster.intersectObjects( engine.scene.children,true );
		if ( intersects.length > 0 ) {
			intersector = engine.getRealIntersector( intersects );
			if ( intersector ) {
				engine.setVoxelPosition( intersector );
				//engine.toddler.mesh.position.set(engine.voxelPosition.x,engine.voxelPosition.y,engine.voxelPosition.z);
			}
		}
		
		engine.camera.position.x = 100 * Math.sin( THREE.Math.degToRad( engine.theta ) );
		engine.camera.position.z = 100 * Math.cos( THREE.Math.degToRad( engine.theta ) );
		//engine.camera.lookAt( engine.scene.position );
		
		engine.camera.position.x +=engine.toddler.mesh.position.x;
        engine.camera.position.y = engine.camera.position.y;
        engine.camera.position.z += engine.toddler.mesh.position.z;
		engine.camera.lookAt(engine.toddler.mesh.position );
	
		engine.toddler.arrow.position = engine.toddler.mesh.position;
		
		engine.renderer.render(engine.scene,engine.camera);
	};
	this.start = function(callback){
		engine.animate();
		callback();
	};
	
	this.screen2world = function(x,y){
		
		/*
		var vector = new THREE.Vector3(( x / engine.configuration.canvasW ) * 2 ,- ( (y -15) / engine.configuration.canvasH ) * 2  ,0 );
		var cam = engine.camera;
		var projector = new THREE.Projector();
		projector.unprojectVector( vector,  cam);
		var dir = vector.sub( cam.position ).normalize();
		var ray = new THREE.Ray( cam.position, dir );
		var distance = -  cam.position.z / dir.z;
		var mouseWorld =  cam.position.clone().add( dir.multiplyScalar( distance ) );
		return mouseWorld;
		*/
		return engine.voxelPosition.clone();
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



