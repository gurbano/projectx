



/* Communication module*/
OATHJS.TODDLER.COM = function() {
	var com = this;
	this.handler = null;
	this.socket = null;
	this.send = function(data){
		//com.socket.emit('client2server',data);
	};
	this.init = function(engine){	
		com.engine = engine;
		//com.handler = new OATHJS.TODDLER.COM.HANDLER();
		//com.handler.init(engine);
	};
  /*CONSTRUCTOR*/
  (function(socketURL) {
		//com.socket = io.connect(socketURL);
		//com.socket.on('server2client', function(data){
			//com.handler.process(data.type, data.uid, data);
		//}); 
   })();
};
OATHJS.TODDLER.COM.HANDLER = function() {
	var handler = this;
	this.init = function(engine){
		handler.engine = engine;
	};
	this.process = function(type, from, data){
		if (data.uid=='server'){
			if (data.type=='updateWorld'){
				handler.engine.helper.info('zone updated ' + handler.engine.helper.v2s(data.center));
			}
		}else if (data.uid!=handler.engine.pid){
			//handler.engine.helper.info('received ' + data.type + ' from ' +data.uid);
			if (data.uid!=handler.engine.pid && data.type=='updatePosition'){
					handler.engine.world.addEnemy(data);
			}
		}else{
			//handler.engine.helper.info('received autoupdate');
		}		
	};
  /*CONSTRUCTOR*/
  (function() {
		
   })();
};