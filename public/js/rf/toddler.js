OATHJS.TODDLER.TODDLER = function(){
	var toddler = this;
	this.speed = 0;
	this.mesh = new THREE.Object3D();
	this.last_position_update_sent = 0;
	this.update = function(engine,callback){
		/*MOVEMENT UPDATE*/
		if(engine.mouseDown==true){
			if(toddler.speed<=engine.configuration.maxspeed){toddler.speed += engine.configuration.accelleration;}
		}else{
			/*DECREASE SPEED (friction)*/
			if (toddler.speed>engine.configuration.friction){
				toddler.speed = toddler.speed - engine.configuration.friction;
			}else{
				toddler.speed = 0;
			}				
		}
		/*SPEED + ROTATION -> new Position*/
		//group.position.y +=  Math.sin(group.rotation.z) * _speed*0.1;
		var movx = -1*Math.sin(toddler.mesh.rotation.z)*toddler.speed ;
		var movy = 1*Math.cos(toddler.mesh.rotation.z)*toddler.speed ;
		toddler.mesh.position.x += movx;
		toddler.mesh.position.y += movy;
		var now = new Date().getTime();
		if (now - toddler.last_position_update_sent >engine.configuration.msBeforeUpdate){
			toddler.last_position_update_sent = now;
			engine.com.send({uid: engine.pid, type : 'updatePosition', position: toddler.mesh.position, rotation:toddler.mesh.rotation, speed: toddler.speed});	
		}
			
		toddler.checkCollision(engine);
		callback();
	};
	this.checkCollision = function(engine){
		var object = engine.world.getObjectAt(
				toddler.mesh.position, 
				function(collided){
					//engine.world.remove(collided.name);
					toddler.speed = 0;
				},
				function(uncollided){
					
				});	
	};
	var geometry;
	this.init = function(_position, callback){
		//toddler.position = new THREE.Vector3( _position.x, _position.y, _position.z );
		/*TODDLER MESH*/
		/* var toddler_mesh = new THREE.Mesh(
					new THREE.CubeGeometry( 1, 1, 1 ),
                    new THREE.MeshLambertMaterial( { color: 0xFF0000 } )
                    );	
		*/
		toddler.getMainMesh(_position, callback);	
	};
	this.rotateAroundObjectAxis = function(object, axis, radians ) {
			var rotationMatrix = new THREE.Matrix4();
			rotationMatrix.makeRotationAxis( axis.normalize(), radians );
			object.matrix.multiply( rotationMatrix );                       // post-multiply
			object.rotation.setEulerFromRotationMatrix( object.matrix );
	};
	this.rotate = function(radians){		
			toddler.rotateAroundObjectAxis( toddler.mesh, new THREE.Vector3( 0, 0, 1 ), -toddler.mesh.rotation.z );
			toddler.rotateAroundObjectAxis( toddler.mesh, new THREE.Vector3( 0, 0, 1 ), radians );			
	};
	this.getMainMesh = function(_position, finalCallback){
		var loader = new THREE.JSONLoader();
		var cb = function( geometry ) {
			var toddler_mesh = new THREE.Mesh( geometry, new THREE.MeshNormalMaterial() );
			toddler_mesh.scale.set( .05, .05, .05 );
			toddler_mesh.rotation.x =80;
			$(document).on('render',function(){
				toddler_mesh.rotation.x += toddler.speed* .5;
			});
			toddler.mesh.add(toddler_mesh);

			/*ROTATION INDICATOR*/
			var arrow = new THREE.ArrowHelper(new THREE.Vector3( 0, 0, 0 ),toddler_mesh, 3 );
			toddler.mesh.add(arrow);			
			toddler.mesh.position.set( _position.x, _position.y, _position.z );	
			toddler.mesh.rotation.set( 0, 0, 0 );	
			toddler.mesh.name='player';
			
			/*LIGHT*/
			var directionalLight = new THREE.PointLight( 0xFFFFFF );			
			directionalLight.castShadow = true;
			directionalLight.shadowCameraVisible = true;
			

			toddler.mesh.add(directionalLight);
			
			
			finalCallback();			
		};
		loader.load( "js/obj/disk.js",cb);
	};
	(function() {
		
	})();
};