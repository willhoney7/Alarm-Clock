function StartupAssistant(arg) {
	if(arg === "new"){
		this.message = "Welcome to Alarm Clock Pro!";
	}else if(arg === "update"){
		this.message = "Thanks for updating! The changelog is below.";
	}else if(arg === "changelog" || !arg){
		this.message = "";
	}
	this.arg = arg;
	var versionCookie = new Mojo.Model.Cookie('appVersion_alarmClockPro');
	//versionCookie.put("0.5.6");
	versionCookie.put(Mojo.Controller.appInfo.version);
}

StartupAssistant.prototype.setup = function() {
	var changelog = [
		{
			"version": "0.0.1",
			//"releaseDate":</b> "10/11/10",
			"log":
				[
					"Initial Release"
				]
		}
	]
	
	var html = '';
	for (var i = 0; i < changelog.length; i++){
		html += Mojo.View.render({object: {dividerLabel: "v"+changelog[i].version}, template: 'startup/divider'});
		html +='<ul class="palm-body-text">';
		for (var l = 0; l < changelog[i].log.length; l++){
			html += '<li>' + changelog[i].log[l] + '</li>';
		}
		html += '</ul>';
	}
	if(this.message !== ''){		
		this.controller.get("message").innerHTML = this.message;
		this.controller.get("message").show();

		this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass: 'no-fade'}, this.commandMenuModel = {visible: true, items:[{},{label: "Continue", command: "swapClock-fromStartUp"},{}]});	
		
	}
	this.controller.get("changelog").innerHTML = html;
};

StartupAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

StartupAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

StartupAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
