OATHJS.TODDLER.TODDLER = function(helper){
	var toddler = this;
	this.helper = null;
	this.speed = 0;
	this.speedStrafe = 0;
	this.mesh = new THREE.Object3D();
	this.last_position_update_sent = 0;
	this.cameraHandler = null;
	this.invertedRotZ = false;
	this.update = function(engine){
		/*MOVEMENT UPDATE*/
		if(engine.controls.w){
			if(toddler.speed<=engine.configuration.maxspeed){toddler.speed += engine.configuration.accelleration;}
		}else if(engine.controls.s){
			if((-1*toddler.speed)<=engine.configuration.maxspeed){toddler.speed -= engine.configuration.accelleration;}		
		}else{
			toddler.speed = 0;
		}
		if(engine.controls.a){
			if(toddler.speedStrafe<=engine.configuration.maxspeed){toddler.speedStrafe += engine.configuration.accelleration;}
		}else if(engine.controls.d){
			if((-1*toddler.speedStrafe)<=engine.configuration.maxspeed){toddler.speedStrafe -= engine.configuration.accelleration;}		
		}else{
			toddler.speedStrafe = 0;
		}
		
		var movx = -1*Math.sin(toddler.mesh.rotation.y) ;
		var movy = -1*Math.cos(toddler.mesh.rotation.y);
		
		if (toddler.mesh.rotation.x<0){
			movy = movy *-1;
		}
	
		toddler.mesh.position.x += (movx*toddler.speed) + (movy*toddler.speedStrafe) ;
		toddler.mesh.position.z += (movy*toddler.speed) + (movx*-1*toddler.speedStrafe);		
		
		
		toddler.position= toddler.mesh.position;
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
		toddler.position = new THREE.Vector3( _position.x, _position.y, _position.z );
		toddler.getMainMesh(_position, callback);	
	};
	this.rotateAroundObjectAxis = function(object, axis, radians ) {
			var rotationMatrix = new THREE.Matrix4();
			rotationMatrix.makeRotationAxis( axis.normalize(), radians );
			object.matrix.multiply( rotationMatrix );                       // post-multiply
			object.rotation.setEulerFromRotationMatrix( object.matrix );
	};
	this.rotate = function(radians){	
			
			toddler.rotateAroundObjectAxis( toddler.mesh, new THREE.Vector3( 0, 1, 0 ), -toddler.mesh.rotation.y );
			toddler.rotateAroundObjectAxis( toddler.mesh, new THREE.Vector3( 0, 1, 0 ), radians );	
			toddler.mesh.rotation.set(0,toddler.mesh.rotation.y,0);
				
	};
	this.getSphereMesh = function(radius){
		var sphere = new THREE.Mesh(new THREE.SphereGeometry(radius,10, 10),
		new THREE.MeshLambertMaterial({wireframe:true, color: 0xCC00ee}));
		return sphere;
	};
	this.lookAt = function ( obj, vector ) {
		obj.matrix.lookAt( obj.position, vector, obj.up );
		if (obj.rotationAutoUpdate === true ) {
			if (obj.useQuaternion === false )  {
				obj.rotation.setEulerFromRotationMatrix( obj.matrix, obj.eulerOrder );
			} else {
				obj.quaternion.copy( obj.matrix.decompose()[ 1 ] );
			}
		}
	};
	this.getMainMesh = function(_position, finalCallback){
		var geo = new THREE.CubeGeometry( 50, 50, 50 );
		var material = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 1.5, transparent: false } );
		var mesh = new THREE.Mesh(geo, material );
		toddler.mesh.add( mesh );
		toddler.mesh.up = new THREE.Vector3(0,1,0);
		/*ROTATION INDICATOR*/
		toddler.arrow = new THREE.ArrowHelper(new THREE.Vector3(-500, 0,-500),toddler.mesh.position, 300 );
		//toddler.mesh.add(toddler.arrow);					
		toddler.mesh.position.set(_position.x,_position.y,_position.z);
		toddler.mesh.name='player';	
		
		/*LIGHT*/
		toddler.directionalLight = new THREE.SpotLight( 0xffffff );
		toddler.directionalLight.intensity = 12;
		toddler.directionalLight.castShadow = true;  
		toddler.directionalLight.shadowCameraVisible = false;

		toddler.directionalLight.shadowMapWidth = 1024; 
		toddler.directionalLight.shadowMapHeight = 1024;  
		toddler.directionalLight.shadowCameraNear = 20;
		toddler.directionalLight.shadowCameraFar = 4000; 
		toddler.directionalLight.shadowCameraFov = 30; 
		toddler.directionalLight.target.position.set(_position.x-100,_position.y,_position.z-100);
		toddler.mesh.add(toddler.directionalLight);	
		
		finalCallback();
	};
	(function() {
		toddler.helper = helper;
		$(document).on('render',function(event,time,screenCoord,worldCoord){			
			toddler.directionalLight.target.position.set(worldCoord.x,0,worldCoord.z);
			toddler.lookAt(toddler.mesh, new THREE.Vector3(worldCoord.x,25,worldCoord.z));			
			toddler.arrow.setDirection(worldCoord);			
			toddler.invertedRotZ = screenCoord.y>0;
		});
	})();
};