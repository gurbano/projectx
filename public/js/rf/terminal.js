/*ENVIRONMENTAL TERMINAL*/
OATHJS.TODDLER.TERMINAL = function(div,handlerDiv) {
	var terminal = this;
	var commands = ['help','reset','teleport'];
	this.processCommand = function(command){
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
  
	/*CONSTRUCTOR*/
	(function() {
		div.terminal(
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
		handlerDiv.click(function(event){					
			if ($('#terminal').is(':visible')){
				terminal.disable();
			}else{
				terminal.enable();
			}
			$('#terminal').toggle();
			event.preventDefault();
		});
	})();
};
