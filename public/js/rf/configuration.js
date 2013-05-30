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
  this.startingPosition = new THREE.Vector3(0,0,0);
  this.bgColor =  0x321832;
  //this.bgColor =  0xFFFFFF;
  this.world_width = 30;  
  this.world_height = 30;
  this.zone_width = 2000;
  this.zone_height = 2000;
  this.wheelspeed = 2.5;
  this.maxspeed = 5.3;
  this.accelleration = 0.28;
  this.debug = true;
  this.friction = 10;
  this.cameraZ = -20;
  this.fov =35;
  this.canvasW = window.innerWidth ;
  this.canvasH = window.innerHeight -80;
  this.msBeforeUpdate = 100;
  this.showPicker = true;
  this.pickerSize = s;
  /*WORKERS*/
  this.w_com = 'COM_WORKER';
  this.msBeforeUpdate = 10;
  
  /*CONSTRUCTOR*/
  (function() {
  
   })();
};