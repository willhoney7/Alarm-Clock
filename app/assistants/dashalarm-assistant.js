function DashalarmAssistant(alarm) {
	this.alarm = alarm;
}

DashalarmAssistant.prototype.setup = function() {
	this.displayDashboard(this.alarm);
};

DashalarmAssistant.prototype.displayDashboard = function(alarm) {
	this.alarm = alarm;
	var renderedContent = Mojo.View.render({object: alarm, template: "dashalarm/dashalarm-template", formatters: {
		"time": function(value, model){
			if(model){
				var d = alarms.getNextDate(model);
				return formatObjTime(d) + " " + getAM_PM(d.getHours()) + " " + model.occurs.capitalize();
			}
		}
	}});
	this.controller.get("dashalarm").innerHTML = renderedContent;
	
	this.handleAlert();
}
DashalarmAssistant.prototype.handleAlert = function() {
	if(this.alarm.sound){
		if(this.alarm.sound.type === "file"){
			this.sound = new Audio();
			this.sound.src = this.alarm.sound.path;
			this.libs = MojoLoader.require({ name: "mediaextension", version: "1.0"});
			this.extObj = this.libs.mediaextension.MediaExtension.getInstance(this.sound);
			this.extObj.audioClass = "media";
			
			this.playSound();			
			this.sound.addEventListener("ended", this.playSound.bind(this), true);
			this.sound.addEventListener("pause", this.playSound.bind(this), true);
			this.sound.addEventListener("error", this.playSound.bind(this), true);
		}
	}
}
DashalarmAssistant.prototype.playSound = function(event) {
	this.sound.play();
};


DashalarmAssistant.prototype.activate = function(event) {};
DashalarmAssistant.prototype.deactivate = function(event) {};
DashalarmAssistant.prototype.cleanup = function(event) {
	Mojo.Log.error("cleaning up");
	this.sound.removeEventListener("ended", this.playSound.bind(this), true);
	this.sound.removeEventListener("pause", this.playSound.bind(this), true);
	this.sound.removeEventListener("error", this.playSound.bind(this), true);
	this.sound.pause();
	
	this.sound = undefined;
};