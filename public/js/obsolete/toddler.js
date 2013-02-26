



OATHJS.TODDLER ={};

OATHJS.TODDLER.WORKERS =(function(){
	var workers = {
		'COM_WORKER' : new Worker('js/toddler.com.js')
	};
	return{
		getWorker : function(name){
			return workers[name];
		}
	};
})();


OATHJS.TODDLER.STATIC =(function(){
	return{
		world_width: 30,
		world_height: 30,
		zone_width: 1000,
		zone_height: 1000,
		wheelspeed: 2.5,
		maxspeed: 2	,
		accelleration: 0.08,
		debug : false,
		friction:0.1,
		cameraZ:-30,
		canvasW : window.innerWidth ,
		canvasH : window.innerHeight -80,
		msBeforeUpdate : 100,
		/*WORKERS*/
		w_com : 'COM_WORKER'
	};
})();

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}
OATHJS.TODDLER.TERMINAL = (function(){
	var terminal;
	var commands = ['help','reset','teleport'];
	function _processCommand(command){
		if (commands.contains(command)){
			switch(command){
				case "reset":
					terminal.echo('executing ' +command);
					getOJS().getWorld().reset(function(){
						 getOJS().getHelper().toast("World reset completed");
					});
				break;
				case "teleport":
					terminal.echo('executing ' +command);
					
				break;
				default:
					terminal.echo( command +" not implemented yet");
			}
		}else{
			terminal.echo('Command not valid. Use help to list all commands');
		}
	};
	function _init(){
		$('#terminal').terminal(
			function(command, term) {
				_processCommand(command);
			}, 
			{
				greetings: 'Welcome mate.',
				name: 'toddler console',
				height: 400,
				tabcompletion:true,
				prompt: '@> ',
				onInit : function(term){
				terminal = term;
				terminal.disable();
			}
		});
		$('#hud').click(function(event){					
			if ($('#terminal').is(':visible')){
				terminal.disable();
			}else{
				terminal.enable();
			}
			$('#terminal').toggle();
			event.preventDefault();
		});
	};
	return{
		start : function(){_init();}
	}
})();

OATHJS.TODDLER.HELPER = (function(){
		var STATIC = OATHJS.TODDLER.STATIC;		
		var toaster = $.toaster({showTime:1000, centerX:true, centerY:false}); 
		return { 
			toast: function(message){
				toaster.toast(message);
				console.info(message);
			},
			info : function(message){
				console.info(message);				
			},
			debug : function(message){
				if (STATIC.debug){console.info(message);}
			},
			deg2rad : function(angle){return angle * .017453292519943295;},
			rad2deg : function(angle){return angle * 57.29577951308232;},
			round: function(num, dec) {
				return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
			},
			
			_rotateAroundWorldAxis : function( object, axis, radians ) {
				var rotationMatrix = new THREE.Matrix4();
				rotationMatrix.makeRotationAxis( axis.normalize(), radians );
				rotationMatrix.multiply( object.matrix );                       // pre-multiply
				object.matrix = rotationMatrix;
				object.rotation.setEulerFromRotationMatrix( object.matrix );
			},	
			_rotateAroundObjectAxis : function( object, axis, radians ) {
				var rotationMatrix = new THREE.Matrix4();
				rotationMatrix.makeRotationAxis( axis.normalize(), radians );
				object.matrix.multiply( rotationMatrix );                       // post-multiply
				object.rotation.setEulerFromRotationMatrix( object.matrix );
			}
		};
})();




OATHJS.TODDLER.TODDLER = (function(){
	var element = [];
	var _speed = 0;
	var _position = new THREE.Vector3( 0, 0, 0 )  ;
	var _rotation = new THREE.Vector3( 0, 0, 0 );
	var group = new THREE.Object3D();
	var STATIC = OATHJS.TODDLER.STATIC;	
	var HELPER = OATHJS.TODDLER.HELPER;	
	var WORKERS = OATHJS.TODDLER.WORKERS;
	
	var _mouseUp, _mouseDown =false;
	var	_mouseX , _mouseY=0;
	
	
	var last_position_update_sent = 0;
	function _getStartingPosition(){
		var p= new THREE.Vector3( 0, 0, 0 );
		return p;
	};
	
	function _init(callback){
		//LOAD STARTING POSITION
		var p = _getStartingPosition();
		_position.set(p.x,p.y,p.z);
		/*TODDLER MESH*/
		 var toddler_mesh = new THREE.Mesh(
					new THREE.CubeGeometry( 1, 1, 1 ),
                    new THREE.MeshLambertMaterial( { color: 0xFF0000 } )
                    );	
		group.add(toddler_mesh);
		
		/*ROTATION INDICATOR*/
		var arrow = new THREE.ArrowHelper( _rotation,toddler_mesh.position, 3 );
		group.add(arrow);	
		
		group.position.set( _position.x, _position.y, _position.z );
		
		
		_mouseUp = false;
		_mouseDown = false;
		_mouseX =0;
		_mouseY=0;
		
		$('body').on('render',function(){
				_update();
			});
		
		//Callback
		callback();
	};
	
	
	function _update(){
			if(_mouseDown==true){
				if(_speed<=STATIC.maxspeed){_speed += STATIC.accelleration;}
			}else{
				/*DECREASE SPEED (friction)*/
				if (_speed>STATIC.friction){
					_speed = _speed - STATIC.friction;
				}else{
					_speed = 0;
				}				
			}
			/*SPEED + ROTATION -> new Position*/
			//group.position.y +=  Math.sin(group.rotation.z) * _speed*0.1;
			var movx = -1*Math.sin(group.rotation.z)*_speed ;
			var movy = 1*Math.cos(group.rotation.z)*_speed ;
			group.position.x += movx;
			group.position.y += movy;
			//group.translateY( Math.cos(group.rotation.z) * _speed*0.1);			
			/*SAVE POS && ROT*/		
			_rotation.x = group.rotation.x;
			_rotation.y = group.rotation.y;
			_rotation.z = group.rotation.z;
			_position.x = group.position.x;
			_position.y = group.position.y;
			_position.z = group.position.z;		
			
			var now = new Date().getTime();
			if (now - last_position_update_sent >STATIC.msBeforeUpdate){
				last_position_update_sent = now;
				Chat.send({uid: _uid, type : 'updatePosition', position: group.position, rotation:group.rotation, speed: _speed});
			}
	}
	return{
		getGroup: function(){
			return group;
		},
		init : function(callback){
			_init(callback);
		},
		position: _position,
		rotation: _rotation,
		moveBy: function(x,y,z){
				group.position.x += x;
				group.position.y += y;
				group.position.z += z;
			},
		getSpeed: function(){
			return _speed;},
		update : function(){
			_update();			
		},
		setMouseDown : function(bool){
			_mouseDown = bool;
		},
		setMouseUp : function(bool){
			_mouseUp = bool;
		},
		rotate: function(radians){		
			HELPER._rotateAroundObjectAxis( group, new THREE.Vector3( 0, 0, 1 ), -group.rotation.z );
			HELPER._rotateAroundObjectAxis( group, new THREE.Vector3( 0, 0, 1 ), radians );			
		}
	}
})();

 
OATHJS.TODDLER.WORLD = (function(){	
	var STATIC = OATHJS.TODDLER.STATIC;
	var HELPER = OATHJS.TODDLER.HELPER;	
	var TODDLER = OATHJS.TODDLER.TODDLER;	
	var _world = new THREE.Object3D();
	var particlesGroup = new THREE.Object3D();
	var zones = [];
	var  particles, geometry, materials = [], parameters, i, h, color;
	var mouseWorld =new THREE.Vector3(0,0,0) ;
	var thrash = new Array();
	
	
	function zone(center, width, height){
		this.dirty = false;
		this.width = width;
		this.height = height;
		this.entities =  new THREE.Object3D();
		this.name = "";
		this.center = center;
		function _createParticles(centerZone){		
			console.info("create particles centered on ["+centerZone.x+","+centerZone.y+"]");
			var particlesGroup = new THREE.Object3D();
			var geometry = new THREE.Geometry();
			var materials = [];
			for ( i = 0; i < 100; i ++ ) {
				var vertex = new THREE.Vector3();
				vertex.x = (Math.random() * 2000 - 1000);
				vertex.y = (Math.random() * 2000 - 1000);
				vertex.z = Math.random() * 2000 - 1000;
				geometry.vertices.push( vertex );
			}
			var parameters = [ [ [1.0, 1.0, 1.0], 5 ], [ [0.95, 1, 1], 4 ], [ [0.90, 1, 1], 3 ], [ [0.85, 1, 1], 2 ], [ [0.80, 1, 1], 1 ] ];
			for ( i = 0; i < parameters.length; i ++ ) {
				var size  = parameters[i][1];
				var color = parameters[i][0];
				//materials[i] = new THREE.ParticleBasicMaterial( { color: 0x000000,size: size } );
				materials[i] = new THREE.ParticleBasicMaterial({
					size: size,
					color: 0xFFFFFF,
					map: THREE.ImageUtils.loadTexture('/images/particle.png'),
					transparent: true
				  });
				//materials[i].color.setHSV( color[0], color[1], color[2] );
				particles = new THREE.ParticleSystem( geometry, materials[i] );
				
				particles.rotation.x = Math.random() * 6;
				particles.rotation.y = Math.random() * 6;
				particles.rotation.z = Math.random() * 6;
				
				particles.position.set(centerZone.x, centerZone.y, 0);
				particlesGroup.add( particles );
			}
			return particlesGroup;
		};	
		this.init= function(){
			console.info("Creating zone world at ["+ this.getCenter().x +","+this.getCenter().y+"]");
			this.name = "zone["+ this.getCenter().x +","+this.getCenter().y+"]";
			/*ADDING CENTER*/
			 var toddler_mesh = new THREE.Mesh(
						new THREE.CubeGeometry( 2, 2, 2 ),
						new THREE.MeshLambertMaterial( { color: 0xFFFFFF } )
						);	
			toddler_mesh.position.set(this.getCenter().x,this.getCenter().y,0);
			this.entities.add(toddler_mesh);
			$('body').on('render',function(){
					toddler_mesh.rotation.x +=0.1;
					toddler_mesh.rotation.y -=0.1;
			});
			
			var bb = this.getBoundingBox();
			/*ADD PLANE LINE*/
			var geometry = new THREE.Geometry();
			var material = new THREE.LineBasicMaterial({color: 0x111111});
			for (a=0; a<1000; a=a+10){
				geometry.vertices.push(new THREE.Vector3(bb.lx, bb.ly-a, 0));
				geometry.vertices.push(new THREE.Vector3(bb.ux, bb.ly-a, 0));
				geometry.vertices.push(new THREE.Vector3(bb.ux, bb.ly-a-10, 0));
				geometry.vertices.push(new THREE.Vector3(bb.lx, bb.ly-a-10, 0));
			}
			//this.entities.add(new THREE.Line(geometry, material));	
			
			
			/*ADDING BOUNDING LINES*/
			geometry = new THREE.Geometry();
			material = new THREE.LineBasicMaterial({color: 0x0000ff});
			geometry.vertices.push(new THREE.Vector3(bb.lx, bb.ly, 0));
			geometry.vertices.push(new THREE.Vector3(bb.ux, bb.ly, 0));
			geometry.vertices.push(new THREE.Vector3(bb.ux, bb.uy, 0));
			geometry.vertices.push(new THREE.Vector3(bb.lx, bb.uy, 0));
			this.entities.add(new THREE.Line(geometry, material));
			
			this.entities.add(_createParticles(this.getCenter()));
		};
		this.setDirty = function(){
			this.dirty = true;
		};
		this.unsetDirty = function(){
			this.dirty = false;
		};
		this.isDirty = function(){
			return this.dirty;
		};
		this.getCenter = function(){
			return this.center;
		};
		this.getBoundingBox = function(){
			var ret = [];
			ret.lx = this.center.x + this.width/2;
			ret.ux = this.center.x - this.width/2;
			ret.ly = this.center.y + this.height/2;
			ret.uy = this.center.y - this.height/2;
			return ret;
		};
		this.getName = function(){
			return this.name;
		};
		this.getEntities = function(){
			return this.entities;
		};
		this.init();
	};
	
	function _emptyZone(index){
		_world.remove(zones[index].getEntities());
	}
	
	function _reloadZone(newZone, index){		
		
		var newCenter = new THREE.Vector3(0,0,0) ;
		switch (index){
			case 1:
				newCenter = new THREE.Vector3( newZone.getCenter().x + STATIC.zone_width, newZone.getCenter().y + STATIC.zone_height, 0 );
			break;		
			case 2:
				newCenter = new THREE.Vector3( newZone.getCenter().x , newZone.getCenter().y + STATIC.zone_height, 0 );
			break;	
			case 3:
				newCenter = new THREE.Vector3( newZone.getCenter().x - STATIC.zone_width, newZone.getCenter().y + STATIC.zone_height, 0 );
			break;	
			case 4:
				newCenter = new THREE.Vector3( newZone.getCenter().x + STATIC.zone_width, newZone.getCenter().y , 0 );
			break;	
			case 5:
				newCenter = new THREE.Vector3( newZone.getCenter().x - STATIC.zone_width, newZone.getCenter().y , 0 );
			break;	
			case 6:
				newCenter = new THREE.Vector3( newZone.getCenter().x + STATIC.zone_width, newZone.getCenter().y - STATIC.zone_height, 0 );
			break;		
			case 7:
				newCenter = new THREE.Vector3( newZone.getCenter().x , newZone.getCenter().y - STATIC.zone_height, 0 );
			break;	
			case 8:
				newCenter = new THREE.Vector3( newZone.getCenter().x - STATIC.zone_width, newZone.getCenter().y - STATIC.zone_height, 0 );
			break;		
		}
		var tmp = new zone(newCenter,STATIC.zone_width, STATIC.zone_height);
		tmp.setDirty();
		return tmp;
	}
	
	function _changeZone(newZoneIndex){		
		switch(newZoneIndex){
			case 2:
				_emptyZone(6);
				_emptyZone(7);
				_emptyZone(8);
				var newZone = zones[2];
				zones[6]=zones[4];
				zones[4]=zones[1];
				zones[1] =_reloadZone(newZone,1);
				zones[7]=zones[0];
				zones[0]=zones[2];
				zones[2]=_reloadZone(newZone,2);
				zones[8]=zones[5];
				zones[5]=zones[3];
				zones[3]=_reloadZone(newZone,3);
				break;
			case 7:
				_emptyZone(1);
				_emptyZone(2);
				_emptyZone(3);
				var newZone = zones[7];
				zones[1]=zones[4];
				zones[4]=zones[6];
				zones[6] =_reloadZone(newZone,6);
				zones[2]=zones[0];
				zones[0]=zones[7];
				zones[7]=_reloadZone(newZone,7);
				zones[3]=zones[5];
				zones[5]=zones[8];
				zones[8]=_reloadZone(newZone,8);
				break;
			case 4:
				_emptyZone(3);
				_emptyZone(5);
				_emptyZone(8);
				var newZone = zones[4];				
				zones[3]=zones[2];
				zones[2]=zones[1];
				zones[1] =_reloadZone(newZone,1);
				zones[5]=zones[0];
				zones[0]=zones[4];
				zones[4]=_reloadZone(newZone,4);
				zones[8]=zones[7];
				zones[7]=zones[6];
				zones[6]=_reloadZone(newZone,6);
				break;
			case 5:
				_emptyZone(1);
				_emptyZone(4);
				_emptyZone(5);
				var newZone = zones[5];
				zones[1]=zones[2];
				zones[2]=zones[3];
				zones[3] =_reloadZone(newZone,3);
				zones[4]=zones[0];
				zones[0]=zones[5];
				zones[5]=_reloadZone(newZone,5);
				zones[6]=zones[7];
				zones[7]=zones[8];
				zones[8]=_reloadZone(newZone,8);
				break;
			
		}
		HELPER.info("Moved to " + zones[0].getName());
		
	}
	
	function _update(obj){
		var toddler_position = obj.position;
		var bb = zones[0].getBoundingBox();
		var exited = false;
		/**/
		if (toddler_position.x>bb.lx) _changeZone(4);
		if (toddler_position.x<bb.ux) _changeZone(5);
		if (toddler_position.y>bb.ly) {
			_changeZone(2)
		};
		if (toddler_position.y<bb.uy) {
			_changeZone(7)};
		for(var i=0; i<zones.length; i++){
			if (zones[i].isDirty()){
				HELPER.info(zones[i].getName() + " isDirty" );
				_world.remove(zones[i].getEntities());
				_world.add(zones[i].getEntities());
				zones[i].unsetDirty();
			}
		}
		
	}
	
	function _loadZones(center, callback){
		var centerX = Math.floor(center.x/(STATIC.zone_width/2))*STATIC.zone_width;
		var tmp = (Math.floor(center.y/(STATIC.zone_height/2)));		
		var centerY = 0;
		if (tmp>=0){centerY = tmp *STATIC.zone_height;}else{centerY = (tmp +1)*STATIC.zone_height;}
		
		zones[0] = new zone(new THREE.Vector3( centerX, centerY, 0 ),STATIC.zone_width, STATIC.zone_height);
		zones[1] = new zone(new THREE.Vector3( centerX +STATIC.zone_width, centerY +STATIC.zone_height, 0 ),STATIC.zone_width, STATIC.zone_height);
		zones[2] = new zone(new THREE.Vector3( centerX, centerY +1000, 0 ),STATIC.zone_width, STATIC.zone_height);
		zones[3] = new zone(new THREE.Vector3( centerX -STATIC.zone_width, centerY+STATIC.zone_height, 0 ),STATIC.zone_width, STATIC.zone_height);
		zones[4] = new zone(new THREE.Vector3( centerX +STATIC.zone_width, centerY, 0 ),STATIC.zone_width, STATIC.zone_height);
		zones[5] = new zone(new THREE.Vector3( centerX -STATIC.zone_width, centerY, 0 ),STATIC.zone_width, STATIC.zone_height);
		zones[6] = new zone(new THREE.Vector3( centerX +STATIC.zone_width, centerY-STATIC.zone_height, 0 ),STATIC.zone_width, STATIC.zone_height);
		zones[7] = new zone(new THREE.Vector3( centerX, centerY-STATIC.zone_height, 0 ),STATIC.zone_width, STATIC.zone_height);
		zones[8] = new zone(new THREE.Vector3( centerX -STATIC.zone_width, centerY-STATIC.zone_height, 0 ),STATIC.zone_width, STATIC.zone_height);
				
		callback();
	};
	function _init(callback){		
		
		_world = new THREE.Object3D();
		HELPER.info("Initing world at ["+ TODDLER.position.x+","+TODDLER.position.y+"]");
		_loadZones(TODDLER.position,
		function(){			
			for(var i=0; i<zones.length; i++){
				HELPER.info("adding " + zones[i].getName());
				_world.add(zones[i].getEntities());
			}
		});		
		callback();
	};	
	function _reset(callback){
		_init(callback);
	};
	function _worldMouse(event){
		var vector = new THREE.Vector3(
			( event.clientX / STATIC.canvasW ) * 2 - 1,
			- ( event.clientY / STATIC.canvasY ) * 2 + 1,
			0.5 );
		var camera = getOJS().getEngine().getCamera();
		var projector = new THREE.Projector();
		projector.unprojectVector( vector,  camera);

		var dir = vector.sub( camera.position ).normalize();

		var ray = new THREE.Ray( camera.position, dir );

		var distance = -  camera.position.z / dir.z;
		mouseWorld =  camera.position.clone().add( dir.multiplyScalar( distance ) );

		
	};
	var _enem = [];
	return{
		
		updateMouse : function(obj,event){
			_worldMouse(event);
		},
		getMouseWorldPosition : function(){return mouseWorld;},
		getWorld : function(){return _world;},
		init : function(callback){_init(callback);},
		reset : function(callback){_reset(callback);},
		update : function(tod){ return _update(tod)},
		currentZone : function(){
			return zones[0];
		},
		addEnemy : function(data){
			if (!_enem[data.uid]){
				//HELPER.info('add enemy at ' + data.position);
				var toddler_mesh = new THREE.Mesh(new THREE.CubeGeometry( 1, 1, 1 ),new THREE.MeshLambertMaterial( { color: 0xFF00FF } ));			
				var arrow = new THREE.ArrowHelper( toddler_mesh.rotation,toddler_mesh.position, 2 );
				var __g = new THREE.Object3D();
				__g.add(toddler_mesh);__g.add(arrow);
				__g.targetposition = new THREE.Vector3(0,0,0);
				__g.targetrotation = new THREE.Vector3(0,0,0);
				
				_enem[data.uid] = __g;
				_enem[data.uid].position.set(data.position.x, data.position.y, data.position.z);
				_enem[data.uid].targetposition.set(data.position.x, data.position.y, data.position.z);
				_enem[data.uid].rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
				_enem[data.uid].targetrotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
				_enem[data.uid]._speed = data.speed;
				_world.add(_enem[data.uid]);
				$('body').on('render',function(){
					var movx = (_enem[data.uid].targetposition.x - _enem[data.uid].position.x)/10 ;
					var movy = (_enem[data.uid].targetposition.y - _enem[data.uid].position.y)/10 ;
					_enem[data.uid].position.x += movx;
					_enem[data.uid].position.y += movy;
					var rotx = (_enem[data.uid].targetrotation.x - _enem[data.uid].rotation.x)/20 ;
					var roty = (_enem[data.uid].targetrotation.y - _enem[data.uid].rotation.y)/20 ;
					var rotz = (_enem[data.uid].targetrotation.z - _enem[data.uid].rotation.z)/20 ;
					_enem[data.uid].rotation.x += rotx;
					_enem[data.uid].rotation.y += roty;
					_enem[data.uid].rotation.x += rotx;
					
				});
			
			}else{
				//HELPER.info('update enemy at ' + data.position);
				_enem[data.uid].targetposition.set(data.position.x, data.position.y, data.position.z);
				_enem[data.uid].rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
				_enem[data.uid]._speed = data.speed;
			}
		}
	};
})();

 



OATHJS.TODDLER.ENGINE = (function(){
		var STATIC = OATHJS.TODDLER.STATIC;		
		var HELPER = OATHJS.TODDLER.HELPER;	
		var WORLD = OATHJS.TODDLER.WORLD;	
		var TODDLER = OATHJS.TODDLER.TODDLER;	
		
		
		var object;
		var stats = new Stats();

		var toddler3d =[];
		var world = WORLD;
		var _worldObject;
		var _bgColor = 0x321832;
		var camera, scene, renderer,mouseX = 0, mouseY = 0;
		var particles = WORLD.STARFIELD;		
		var _zoom = STATIC.cameraZ;
		function _init(callback){
			HELPER.info('--- MAIN ENGINE INITIALIZATION ---');
			/*TODDLER INITIALIZATION*/
			/*TODDLER INIT*/
			TODDLER.init(function(){
				HELPER.info("TODDLER INITED");
				/*WORLD INITIALIZATION*/
				WORLD.init(
					function(){
						toddler3d = TODDLER.getGroup();
						/*DO ENGINE INITIALIZATION*/
						scene = new THREE.Scene();
						scene.fog = new THREE.FogExp2( 0x000000, 0.0007 );
						
						
						
						
						camera = new THREE.PerspectiveCamera(80, STATIC.canvasW/STATIC.canvasH, 1, 4000);
						camera.position.set( 0, 0,  _zoom);
						camera.lookAt( scene.position );					
						scene.add(camera);				
						
						scene.add( toddler3d );

						var light = new THREE.PointLight( 0xFFFF00 );
						light.position.set( 10, 0, 10 );
						scene.add( light );
						
						//renderer = new THREE.CanvasRenderer();
						//renderer = new THREE.WebGLRenderer( { antialias: false } );
						renderer = Detector.webgl? new THREE.WebGLRenderer(): new THREE.CanvasRenderer();
						
						renderer.setClearColorHex(_bgColor);
						renderer.setSize( STATIC.canvasW,STATIC.canvasH);		 
						document.body.appendChild( renderer.domElement );			
						document.body.appendChild( stats.domElement );		
						document.addEventListener( 'mousemove', _onMouseMove, false );
						callback();
				});		
			});
		};
		function _onMouseMove(){};
		function _start(callback){
			HELPER.info('--- STARTING VISUALIZATION PROCESS---');
			_animate();
			callback();
			
		};
		function _update(){
			stats.update();
			var t = TODDLER;			
			//t.update();			
			_updateHUD(t);
			_updateCamera(t);
			_updateWorld(t);
		};		
		function _updateHUD(obj){
		
			$('#position').html("pos [" + Math.round(obj.position.x) + "," +Math.round(obj.position.y)+","+Math.round(camera.position.z)+"]");
			$('#mouseposition').html("mouse [" + Math.round(WORLD.getMouseWorldPosition().x) + "," +Math.round(WORLD.getMouseWorldPosition().y)+","+Math.round(WORLD.getMouseWorldPosition().z)+"]");
			$('#zone').html("zone [" + WORLD.currentZone().getCenter().x + "," +WORLD.currentZone().getCenter().y+"]");
			$('#rotation').html("rotation [" + Math.round(HELPER.rad2deg(obj.rotation.z)) +"]");
			$('#speed').html("speed["+ HELPER.round(obj.getSpeed(),3)+"]");
			if(scene.__webglObjects){
				$('#info').html("obj count ["+scene.__webglObjects.length+"]");		
			}				
		};
		function _updateCamera(obj){
			//camera.position.set( obj.position.x, obj.position.y, camera.position.z );
			camera.position.set( obj.position.x, obj.position.y, _zoom - (obj.getSpeed()*50) );
		};
		function _updateWorld(obj){
			world.update(obj);
		};
		function _animate(){
			if (scene.__webglObjects && scene.__webglObjects.length>500)
				WORLD.reset(function(){});
			/*DO ENGINE INITIALIZATION*/	
			scene.remove(_worldObject);
			_update();
			_worldObject=world.getWorld();
			scene.add(_worldObject);
			requestAnimationFrame(_animate);			
			_render();
			
			
		};
		function _render(){
			$('body').trigger('render');			
			$('body').trigger('renderEnemies');			
			renderer.render(scene,camera);
		}
		function _rotateAroundObjectAxis( object, axis, radians ) {
			var rotationMatrix = new THREE.Matrix4();
			rotationMatrix.makeRotationAxis( axis.normalize(), radians );
			object.matrix.multiply( rotationMatrix );                       // post-multiply
			object.rotation.setEulerFromRotationMatrix( object.matrix );
		}
		return{
			init : function(callback){_init(callback);},
			start : function(callback){_start(callback);},
			moveBy: function(x,y,z){
				camera.position.x += x;
				camera.position.y += y;
				_zoom += z;
			},
			getCamera: function(){return camera;},
			canvasW: STATIC.canvasW,
			canvasH: STATIC.canvasH,
			toddler: toddler3d
		};		
})();


OATHJS.TODDLER = (function(){
		var STATIC = OATHJS.TODDLER.STATIC;	
		var HELPER = OATHJS.TODDLER.HELPER;	
		var ENGINE = OATHJS.TODDLER.ENGINE;	
		var TODDLER = OATHJS.TODDLER.TODDLER;	
		var TERMINAL = OATHJS.TODDLER.TERMINAL;	
		var WORLD = OATHJS.TODDLER.WORLD;	
		function _init(callback){
			HELPER.info('TODDLER INITIALIZATION');
			ENGINE.init(callback);			
		};
		function _start(callback){
			HELPER.info('FASTEN SEAT BELT!!! TODDLER IS STARTING!!!');
			ENGINE.start(callback);				
		};
		function _registerWheeler(){
			$('body').mousewheel( function(e, delta){
				//console.info("scroll");
				ENGINE.moveBy(0,0,STATIC.wheelspeed*delta);
			});			
		};
		function _registerMouseMove(){
			$("body").mousemove(function(event) {
				x = event.pageX - ENGINE.canvasW/2;
				y = event.pageY - ENGINE.canvasH/2;
				
				var angle = -90 + Math.atan2(-y,x) * (180 / Math.PI);			
				TODDLER.rotate(-1*HELPER.deg2rad(angle));
				WORLD.updateMouse(TODDLER,event);
				//console.info(angle);			 
			});
			
		};
		function _registerClick(){
			$("body").mouseup(function(event) {
				TODDLER.setMouseDown(false);
				TODDLER.setMouseUp(true);
				TODDLER._mouseX = event.pageX - ENGINE.canvasW/2;
				TODDLER._mouseY = event.pageY - ENGINE.canvasH/2;
				
			});
			$("body").mousedown(function(event) {
				TODDLER.setMouseDown(true);
				TODDLER.setMouseUp(false);
				TODDLER._mouseX = event.pageX - ENGINE.canvasW/2;
				TODDLER._mouseY = event.pageY - ENGINE.canvasH/2;				
			});
		};
		function _registerKeyboard(){
			$("body").keypress(function(event) {
				switch(event.which){
					case 119: //W
						//console.info('W');
						event.preventDefault();
						break;
					case 100: //D
						//console.info('D');
						event.preventDefault();
						break;
					case 97: //A
						//console.info('A');
						event.preventDefault();
						break;
					case 115: //S
						//console.info('S');
						event.preventDefault();
						break;
				}
			});
		}
		return { 
			getEngine : function(){return ENGINE;},
			getWorld : function(){return WORLD;},
			getHelper : function(){return HELPER;},
			getToddler : function(){return TODDLER.getGroup();},
			startTerminal : function(){TERMINAL.start();},
			start: function(){				
				_init(function(){
					_start(function(){
						_registerWheeler();
						_registerMouseMove();
						_registerClick();
						_registerKeyboard();
						HELPER.info('TODDLER STARTED CORRECTLY');
					});
				}); 	
				
			}
		};
})();

function getOJS(){
	return OATHJS.TODDLER;
}



var _uid = Math.random() * 10000;

OATHJS.TODDLER.COM = (function () {
  window.Chat = {
    socket : null,
	send : function(data){		
		this.socket.emit('client2server',data);
	},
    initialize : function(socketURL) {
      this.socket = io.connect(socketURL);
      this.socket.on('server2client', function(data){
			//console.info('received ' + data.type + ' from ' +data.uid);
			if (data.uid!=_uid && data.type=='updatePosition'){
				getOJS().getWorld().addEnemy(data);
			}
	  });
    }
  };
}());
