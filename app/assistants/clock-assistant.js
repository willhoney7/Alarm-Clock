function ClockAssistant() {}
ClockAssistant.prototype.setup = function() {
	
	this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass: 'no-fade'}, 
	{
		visible: false,
		items: [
			{},
			{toggleCmd: "clock", items: [
				{iconPath: "images/menu-icon-clock.png", command: "clock"},
				{iconPath: "images/menu-icon-alarm.png", command: "alarms"}
			]},
			{}
		]
	});
	this.controller.listen("alarms", Mojo.Event.tap, this.pushAlarmScene = function(){this.controller.stageController.pushScene("alarms")}.bind(this));
	this.controller.listen("weather", Mojo.Event.tap, this.pushWeatherScene = function(){this.controller.stageController.pushScene("weather")}.bind(this));
	
	this.timeDiv = this.controller.get("time");
	this.dateDiv = this.controller.get("date");
	this.am_pmDiv = this.controller.get("ampm");
	
	alarms.load();
};

ClockAssistant.prototype.getTime = function(){	
	this.controller.serviceRequest('palm://com.palm.systemservice/time', {
		method:"getSystemTime",
		parameters:	{subscribe: true},
		onSuccess: this.updateSystemTime.bind(this),
		onFailure: function(){},
	}); 

}
ClockAssistant.prototype.updateSystemTime = function(response) {
	if(response.localtime){
		setTimeout(function(){
			this.updateTime();
			if(this.updateClockTimeout){
				this.controller.window.clearInterval(this.updateClockTimeout);
			}
			this.updateClockTimeout = this.controller.window.setInterval(this.updateTime.bind(this), 60000);
		}.bind(this), (60.1-response.localtime.second)*1000)

		this.timeDiv.innerHTML = formatSystemTime(response.localtime);
		var d = new Date();
		this.dateDiv.innerHTML = formatObjDate(d, "decent");
		var am_pm = getAM_PM(response.localtime.hour);
		this.am_pmDiv.innerHTML = am_pm;
	}
}

ClockAssistant.prototype.updateTime = function() {
	var d = new Date();
	this.timeDiv.innerHTML = formatObjTime(d);
	this.dateDiv.innerHTML = formatObjDate(d, "decent");

	var am_pm = getAM_PM(d.getHours());//returns blank string if not using am/pm
	this.am_pmDiv.innerHTML = am_pm;
}
ClockAssistant.prototype.activate = function(event) {
	this.getTime();
};

ClockAssistant.prototype.deactivate = function(event) {
	this.controller.window.clearInterval(this.updateClockTimeout);
};

ClockAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
