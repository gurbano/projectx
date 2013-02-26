var s = 5;
var rayDirections = [];
rayDirections.push(new THREE.Vector3(s, s, s));
rayDirections.push(new THREE.Vector3(-s, s, s));
rayDirections.push(new THREE.Vector3(s, s, -s));
rayDirections.push(new THREE.Vector3(-s, s, -s));            
rayDirections.push(new THREE.Vector3(s, -s, s));
rayDirections.push(new THREE.Vector3(-s, -s, s));
rayDirections.push(new THREE.Vector3(s, -s, -s));
rayDirections.push(new THREE.Vector3(-s, -s, -s));   


/* STATIC CONFIGURATION*/
OATHJS.TODDLER.CONFIGURATION = function() {
  var conf = this;
  this.bgColor =  0x321832;
  //this.bgColor =  0xFFFFFF;
  this.world_width = 30;  
  this.world_height = 30;
  this.zone_width = 500;
  this.zone_height = 500;
  this.wheelspeed = 2.5;
  this.maxspeed = 10.3;
  this.accelleration = 0.08;
  this.debug = false;
  this.friction = 0.1;
  this.cameraZ = -160;
  this.fov = 40;
  this.canvasW = window.innerWidth ;
  this.canvasH = window.innerHeight -80;
  this.msBeforeUpdate = 100;
  this.showPicker = false;
  this.pickerSize = s;
  /*WORKERS*/
  this.w_com = 'COM_WORKER';
  this.msBeforeUpdate = 10;
  
  /*CONSTRUCTOR*/
  (function() {
  
   })();
};