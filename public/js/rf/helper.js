
/* STATIC CONFIGURATION*/
OATHJS.TODDLER.HELPER = function(aConf) {
	var helper = this;
	this.toaster = $.toaster({showTime:1000, centerX:true, centerY:false}); 
	this.toast = function(message){
		
		helper.toaster.toast(message);
		console.info(message);
	};
	this.info = function(message){
		console.info(message);	
	};
	this.debug = function(message){
		if (helper.configuration.debug){
			console.info(message);
		}
	};
	this.deg2rad = function(angle){return angle * .017453292519943295;};
	this.rad2deg = function(angle){return angle * 57.29577951308232;};
	this.round = function(num, dec) {
		return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
	};
	this.v2s = function(vector){
		return "["+helper.round(vector.x,2)+","+helper.round(vector.y,2)+","+helper.round(vector.z,2)+"]";
	};
	this.rotateAroundObjectAxis = function(object, axis, radians ) {
			var rotationMatrix = new THREE.Matrix4();
			rotationMatrix.makeRotationAxis( axis.normalize(), radians );
			object.matrix.multiply( rotationMatrix );                       // post-multiply
			object.rotation.setEulerFromRotationMatrix( object.matrix );
	};
	
  /*CONSTRUCTOR*/
  (function() {
	helper.configuration = aConf;
   })();
};
/*
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
*/