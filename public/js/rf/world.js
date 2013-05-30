var randomColor = function(){return '#'+Math.floor(Math.random()*16777215).toString(16);}

OATHJS.TODDLER.WORLD = function(){
	var world = this;
	this.scene = new THREE.Object3D();
	this.dirty =false;
	this.elements = {};
	this.elementSize = 0;
	this.zones = [];
	this.add = function(id, object, _collidable, groupname){
		if (!object.name)
			object.name=id;
		if (!groupname)
			groupname = 'global';
		object.group = groupname;
		if (_collidable){
			if (!object.boundingBox){
				if (!object.geometry){
					var children = object.children;
					for (var i in children){
						if (children[i].geometry){
							object.geometry = children[i].geometry;
						}
					}
				}
				if (object.geometry.boundingBox){
					object.boundingBox = object.geometry.boundingBox;
				}else if (object.geometry.boundingSphere){
					object.boundingBox = object.geometry.boundingSphere.getBoundingBox();
				}else {
					object.boundingBox = new THREE.Box3(new THREE.Vector3(-1,-1,-1),new THREE.Vector3(1,1,1));
					console.error('Can\'t calculate boundingBox of ' + id);
				}
			}
		}
		object.collidable = _collidable;
		object.collision = false;
		object.collisionObject = null;
		world.elements[object.name]=object;
		world.elementSize++;
		world.scene.add(object);
	};
	this.remove = function(id){		
		world.scene.remove(world.elements[id]);
		world.elementSize--;
		delete world.elements[id] ;
	};
	this.removeGroup = function(id){		
		for (var i in world.elements){
			if (world.elements[i].group && world.elements[i].group==id){
				world.engine.helper.info('removing ' + world.elements[i].name);
				world.remove(world.elements[i].name);
			}
		}		
	};
	this.collide = function(pos,element,name){
		//CHECK AGAINST BOUNDING BOX (FASTER && DETECT INSIDE)
		var min = element.boundingBox.min.clone().add(element.position);
		var max = element.boundingBox.max.clone().add(element.position);
		if (pos.x>=min.x&&pos.y>=min.y&&pos.z>=min.z && pos.x<=max.x && pos.y<=max.y && pos.z<=max.z){
			return true;
		}
		//CHECK AGAINST RAYTRACING
		for(var i=0; i<rayDirections.length; i++) {			
			var raycaster = new THREE.Raycaster(pos, rayDirections[i].multiplyScalar(5));
			var intersects = raycaster.intersectObjects([element]);
			if (intersects.length>0){
				return true;
			}
		}		
		return false;
	};
	this.getObjectAt = function(pos,callbackCollide, callbackUncollide){
		//world.engine.helper.info('testing collision in' + world.engine.helper.v2s(pos));
		for (var name in world.elements){
			if(world.elements[name].collidable){
				if (world.collide(pos,world.elements[name],name)){
					if (callbackCollide){
						callbackCollide(world.elements[name]);
					}else{
						return world.elements[name];
					}
				}else{
					if(callbackUncollide){
						callbackUncollide(world.elements[name]);
					}
				}
			}
		}
		return null;
	};
	this.addPicker = function(){
		if(world.engine.configuration.showPicker){
			world.collisionSpherePicker = new THREE.Mesh(new THREE.SphereGeometry(world.engine.configuration.pickerSize,10, 10),new THREE.MeshLambertMaterial({wireframe:true, color: 0xCC00ee}));
			$(document).on('render',function(event,time,screenCoord,worldCoord){		
				world.collisionSpherePicker.position.set(worldCoord.x,25,worldCoord.z);			
			});
			world.add('collisionPicker',world.collisionSpherePicker,false);
		}
	};
	this.updatePicker = function(worldCoord){
		if(world.engine.configuration.showPicker){
			world.collisionSpherePicker.position.set(worldCoord.x,worldCoord.y,worldCoord.z);			
		}
	};
	this.loadZones = function(center, callback){
		var centerX = Math.floor(center.x/(world.engine.configuration.zone_width/2))*world.engine.configuration.zone_width;
		var tmp = (Math.floor(center.y/(world.engine.configuration.zone_height/2)));		
		var centerY = 0;
		if (tmp>=0){centerY = tmp *world.engine.configuration.zone_height;}else{centerY = (tmp +1)*world.engine.configuration.zone_height;}
		
		world.zones[0] = new OATHJS.TODDLER.WORLD.ZONE(world,new THREE.Vector3( centerX, 0, centerY ),world.engine.configuration.zone_width, world.engine.configuration.zone_height);
		world.zones[1] = new OATHJS.TODDLER.WORLD.ZONE(world,new THREE.Vector3( centerX +world.engine.configuration.zone_width,0, centerY +world.engine.configuration.zone_height ),world.engine.configuration.zone_width, world.engine.configuration.zone_height);
		world.zones[2] = new OATHJS.TODDLER.WORLD.ZONE(world,new THREE.Vector3( centerX,0, centerY +world.engine.configuration.zone_height ),world.engine.configuration.zone_width, world.engine.configuration.zone_height);
		world.zones[3] = new OATHJS.TODDLER.WORLD.ZONE(world,new THREE.Vector3( centerX -world.engine.configuration.zone_width, 0,centerY+world.engine.configuration.zone_height ),world.engine.configuration.zone_width, world.engine.configuration.zone_height);
		world.zones[4] = new OATHJS.TODDLER.WORLD.ZONE(world,new THREE.Vector3( centerX +world.engine.configuration.zone_width, 0,centerY ),world.engine.configuration.zone_width, world.engine.configuration.zone_height);
		world.zones[5] = new OATHJS.TODDLER.WORLD.ZONE(world,new THREE.Vector3( centerX -world.engine.configuration.zone_width, 0,centerY ),world.engine.configuration.zone_width, world.engine.configuration.zone_height);
		world.zones[6] = new OATHJS.TODDLER.WORLD.ZONE(world,new THREE.Vector3( centerX +world.engine.configuration.zone_width, 0,centerY-world.engine.configuration.zone_height ),world.engine.configuration.zone_width, world.engine.configuration.zone_height);
		world.zones[7] = new OATHJS.TODDLER.WORLD.ZONE(world,new THREE.Vector3( centerX,0, centerY-world.engine.configuration.zone_height ),world.engine.configuration.zone_width, world.engine.configuration.zone_height);
		world.zones[8] = new OATHJS.TODDLER.WORLD.ZONE(world,new THREE.Vector3( centerX -world.engine.configuration.zone_width, 0,centerY-world.engine.configuration.zone_height ),world.engine.configuration.zone_width, world.engine.configuration.zone_height);
		if(callback)callback();
	};
	
	this.init = function(anEngine,position, callback){	
		world.engine = anEngine;
		world.engine.helper.info("Initing world at ["+ position.x+","+position.y+"]");
		world.addPicker();
		world.loadZones(position,
			function(){			
			world.engine.helper.toast(world.zones.length+" zones loaded");		
		});					
		callback();
	};
	this._enem = [];
	this.addEntity = function(data){
			//TODO: DELEGATE TO THE CORRECT ZONE
			if (!world._enem[data.uid]){
				var toddler_mesh = new THREE.Mesh(new THREE.CubeGeometry( 1, 1, 1 ),new THREE.MeshLambertMaterial( { color: 0xFF00FF } ));			
				var arrow = new THREE.ArrowHelper( toddler_mesh.rotation,toddler_mesh.position, 2 );
				var __g = new THREE.Object3D();
				__g.add(toddler_mesh);__g.add(arrow);
				__g.targetposition = new THREE.Vector3(0,0,0);
				__g.targetrotation = new THREE.Vector3(0,0,0);
				
				world._enem[data.uid] = __g;
				world._enem[data.uid].position.set(data.position.x, data.position.y, data.position.z);
				world._enem[data.uid].targetposition.set(data.position.x, data.position.y, data.position.z);
				world._enem[data.uid].rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
				world._enem[data.uid].targetrotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
				world._enem[data.uid]._speed = data.speed;
				world.add(data.uid, world._enem[data.uid],'true');
				$(document).on('render',function(){
					var movx = (world._enem[data.uid].targetposition.x - world._enem[data.uid].position.x)/20 ;
					var movy = (world._enem[data.uid].targetposition.y - world._enem[data.uid].position.y)/20 ;
					world._enem[data.uid].position.x += movx;
					world._enem[data.uid].position.y += movy;
					var rotx = (world._enem[data.uid].targetrotation.x - world._enem[data.uid].rotation.x)/20 ;
					var roty = (world._enem[data.uid].targetrotation.y - world._enem[data.uid].rotation.y)/20 ;
					var rotz = (world._enem[data.uid].targetrotation.z - world._enem[data.uid].rotation.z)/20 ;
					world._enem[data.uid].rotation.x += rotx;
					world._enem[data.uid].rotation.y += roty;
					world._enem[data.uid].rotation.x += rotx;					
				});			
			}else{
				world._enem[data.uid].targetposition.set(data.position.x, data.position.y, data.position.z);
				world._enem[data.uid].rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
				world._enem[data.uid]._speed = data.speed;
			}
		};
	this.lastupdate = $time();
	this.update = function(obj){
		var now = $time();
		if (!world.lastUpdate)world.lastUpdate = $time();
		if (now-world.lastUpdate>1000){
			world.lastUpdate=now;
			var toddler_position = obj.mesh.position;			
			var bb = world.zones[0].getBoundingBox();
			if (toddler_position.x>bb.lx) world.changeZone(4);
			if (toddler_position.x<bb.ux) world.changeZone(5);
			if (toddler_position.z>bb.ly) world.changeZone(2);
			if (toddler_position.z<bb.uy) world.changeZone(7);
		}
	};
	this.reloadZone = function(newZone, index){				
		var newCenter = new THREE.Vector3(0,0,0) ;
		switch (index){
			case 1:	newCenter = new THREE.Vector3( newZone.getCenter().x + world.engine.configuration.zone_width, 0,newZone.getCenter().z + world.engine.configuration.zone_height );break;		
			case 2:	newCenter = new THREE.Vector3( newZone.getCenter().x , 0,newZone.getCenter().z + world.engine.configuration.zone_height );	break;	
			case 3:	newCenter = new THREE.Vector3( newZone.getCenter().x - world.engine.configuration.zone_width, 0,newZone.getCenter().z + world.engine.configuration.zone_height );	break;	
			case 4:	newCenter = new THREE.Vector3( newZone.getCenter().x + world.engine.configuration.zone_width, 0,newZone.getCenter().z  );	break;	
			case 5:	newCenter = new THREE.Vector3( newZone.getCenter().x - world.engine.configuration.zone_width, 0,newZone.getCenter().z  );	break;	
			case 6:	newCenter = new THREE.Vector3( newZone.getCenter().x + world.engine.configuration.zone_width, 0,newZone.getCenter().z - world.engine.configuration.zone_height );	break;		
			case 7:	newCenter = new THREE.Vector3( newZone.getCenter().x , 0,newZone.getCenter().z - world.engine.configuration.zone_height );	break;	
			case 8: newCenter = new THREE.Vector3( newZone.getCenter().x - world.engine.configuration.zone_width, 0,newZone.getCenter().z - world.engine.configuration.zone_height, 0 );break;		
		}
		world.engine.com.send({uid: world.engine.pid, type : 'requestUpdateWorld', center: newCenter});
		return new OATHJS.TODDLER.WORLD.ZONE(world,newCenter,world.engine.configuration.zone_width, world.engine.configuration.zone_height);
	}
	this.emptyZone = function(index){
		var group_uid = world.zones[index].uid;
		world.removeGroup(group_uid);
	};
	this.changeZone = function(newZoneIndex){		
		switch(newZoneIndex){
			case 2:
				world.emptyZone(6);
				world.emptyZone(7);
				world.emptyZone(8);
				var newZone = world.zones[2];
				world.zones[6]=world.zones[4];
				world.zones[4]=world.zones[1];
				world.zones[1] =world.reloadZone(newZone,1);
				world.zones[7]=world.zones[0];
				world.zones[0]=world.zones[2];
				world.zones[2]=world.reloadZone(newZone,2);
				world.zones[8]=world.zones[5];
				world.zones[5]=world.zones[3];
				world.zones[3]=world.reloadZone(newZone,3);
				break;
			case 7:
				world.emptyZone(1);
				world.emptyZone(2);
				world.emptyZone(3);
				var newZone = world.zones[7];
				world.zones[1]=world.zones[4];
				world.zones[4]=world.zones[6];
				world.zones[6] =world.reloadZone(newZone,6);
				world.zones[2]=world.zones[0];
				world.zones[0]=world.zones[7];
				world.zones[7]=world.reloadZone(newZone,7);
				world.zones[3]=world.zones[5];
				world.zones[5]=world.zones[8];
				world.zones[8]=world.reloadZone(newZone,8);
				break;
			case 4:
				world.emptyZone(3);
				world.emptyZone(5);
				world.emptyZone(8);
				var newZone = world.zones[4];				
				world.zones[3]=world.zones[2];
				world.zones[2]=world.zones[1];
				world.zones[1] =world.reloadZone(newZone,1);
				world.zones[5]=world.zones[0];
				world.zones[0]=world.zones[4];
				world.zones[4]=world.reloadZone(newZone,4);
				world.zones[8]=world.zones[7];
				world.zones[7]=world.zones[6];
				world.zones[6]=world.reloadZone(newZone,6);
				break;
			case 5:
				world.emptyZone(1);
				world.emptyZone(4);
				world.emptyZone(6);
				var newZone = world.zones[5];
				world.zones[1]=world.zones[2];
				world.zones[2]=world.zones[3];
				world.zones[3] =world.reloadZone(newZone,3);
				world.zones[4]=world.zones[0];
				world.zones[0]=world.zones[5];
				world.zones[5]=world.reloadZone(newZone,5);
				world.zones[6]=world.zones[7];
				world.zones[7]=world.zones[8];
				world.zones[8]=world.reloadZone(newZone,8);
				break;
			
		}
		world.engine.helper.info("Moved to " + world.zones[0].name);
		
	};
	(function() {
		
	})();
};

OATHJS.TODDLER.WORLD.ZONE = function(world,center, width, height){
	var zone = this;	
	this.zoneData = null; //WORLD DATA DOWNLOADED FROM SERVER
	this.entities = []; //MOVABLE ENTITIES (NPC, BULLETS)
	this.worldEntities = []; //FIXED ENTITIES (Landscape, terrain)
	this.zoneData = null; //WORLD DATA DOWNLOADED FROM SERVER
	
	this.dirty =false;
	this.world,this.center, this.width, this.height, this.uid, this.name, this.plane;
	this.getCenter = function(){return zone.center;}
	this.getBoundingBox = function(){
		var ret = [];
		ret.lx = zone.center.x + zone.width/2;
		ret.ux = zone.center.x - zone.width/2;
		ret.ly = zone.center.z + zone.height/2;
		ret.uy = zone.center.z - zone.height/2;
		return ret;
	};
	this.createBB = function(){
		var bb = zone.getBoundingBox();
		/*ADDING BOUNDING LINES*/
		var geometry = new THREE.Geometry();
		var material = new THREE.LineBasicMaterial({color: 0x0000ff});
		geometry.vertices.push(new THREE.Vector3(bb.lx+1, bb.ly+1, 0));
		geometry.vertices.push(new THREE.Vector3(bb.ux-1, bb.ly+1, 0));
		geometry.vertices.push(new THREE.Vector3(bb.ux-1, bb.uy-1, 0));
		geometry.vertices.push(new THREE.Vector3(bb.lx+1, bb.uy-1, 0));
		world.add('bb_'+zone.uid ,new THREE.Line(geometry, material), false, zone.uid);
	};
	this.createCenter = function(){
		/*ADDING CENTER*/
		var aa = new THREE.Object3D();
		aa.position.set(center.x,0,center.z);
		/**/
		var toddler_mesh = new THREE.Mesh(
			new THREE.CubeGeometry( 40, 40, 40 ),
			new THREE.MeshLambertMaterial( { color: 0xFFFFFF } )
		);	
		toddler_mesh.receiveShadow  =true;
		toddler_mesh.castShadow  =true;
		//toddler_mesh.position.set(center.x,center.y,0);
		aa.add(toddler_mesh);		
		aa.add(new THREE.ArrowHelper(new THREE.Vector3(-500, 0,-500),toddler_mesh.position, 300 ));

		world.add("centerzone"+zone.uid,aa,true, zone.uid);
			
		$(document).on('render',function(){
			//aa.rotation.x +=0.1;
			//aa.rotation.z -=0.1;
		});		
	};
	this.loadWorldData = function(callback){
		//TODO: Contact server and add entities
		callback();
	};
	this.loadEntities = function(callback){
		//TODO: Contact server and add entities
		callback();
	};
	this.createStarfield = function(){
		var particlesGroup = new THREE.Object3D();
		var geometry = new THREE.Geometry();
		var materials = [];
		for ( i = 0; i < 100; i ++ ) {
			var vertex = new THREE.Vector3();
			vertex.x = (Math.random() * 2000 - 1000);
			vertex.y = (Math.random() * 2000 - 1000);
			vertex.z = (Math.random() * 2000 - 1000);
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
			particles.position.set(zone.center.x, zone.center.y, 0);
			particlesGroup.add( particles );
		}
		zone.world.add('particle_'+$time(), particlesGroup,false,zone.uid);	
	};
	this.attachListeners = function(callback){
		$(document).on('render',function(){
			
		});		
	};
	this.createPlane = function(callback){
		var texture = THREE.ImageUtils.loadTexture( 'images/textures/grass.jpg', {},function(){
			texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
			texture.repeat.set( 2, 2 );	
			var material = new THREE.MeshPhongMaterial( {
			   color: 0xffffff,
			   specular:0xffffff,
			   shininess: 10,
			   map: texture,
			   //envMap: textureCube,
			   combine: THREE.MixOperation,
			   reflectivity: 0.05
			} );
			//material = new THREE.MeshBasicMaterial( { color: 0x555555, wireframe: true } )
			zone.plane = new THREE.Mesh(new THREE.CubeGeometry(zone.width, 1 ,zone.height), material);
			zone.plane.receiveShadow  =true;
			zone.plane.castShadow  =true;
			zone.plane.overdraw = true;
			zone.plane.position.set(zone.center.x,-10,zone.center.z);
			zone.world.add('zplane_'+zone.name,zone.plane,false,zone.uid);
			
			callback();
		});
	};
	this.addWireplane = function(callback){
		zone.wplane = new THREE.Mesh( new THREE.PlaneGeometry( zone.width, zone.height, 20, 20 ), new THREE.MeshBasicMaterial( { color: 0x555555, wireframe: true } ) );
		zone.wplane.rotation.x = - Math.PI / 2;
		zone.wplane.position.set(zone.center.x,0,zone.center.z);
		zone.world.add('wplane_'+zone.name,zone.wplane,false,zone.uid);
			
			
	};
	(function() {
		zone.center = center;
		zone.width = width;
		zone.height = height;
		zone.world = world;
		zone.name = "zone["+ center.x +","+center.zwwwwwwwwwwww+"]";
		zone.uid = "z"+center.x+"-"+center.z;		
		if(world.engine.configuration.debug){
			zone.createCenter();
			//zone.createBB();
		}
		//zone.addWireplane();
		//zone.createStarfield();
		zone.createPlane(function(){
			zone.loadWorldData(function(){
				for ( var i in zone.worldEntities){
					
				};
				zone.loadEntities(function(){
					world.engine.helper.info("Created zone at ["+ center.x +","+center.z+"]");				
					zone.attachListeners();
				});			
			});	
		});		
	})();
};