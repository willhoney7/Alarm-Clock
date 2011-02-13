function AlarmPreferencesAssistant(alarm) {
	this.alarm = (alarm) ? alarm : alarms.newAlarm();
}
AlarmPreferencesAssistant.prototype.aboutToActivate = function(callback) {
	callback.defer();
}
AlarmPreferencesAssistant.prototype.setup = function() {
	this.controller.setupWidget("textField", {
		multiline: true,
	}, {
		value: this.alarm.name
	});
	
	this.controller.setupWidget("toggleButton", {}, this.toggleButtonModel = {
		value: this.alarm.on
	});
	this.controller.listen("toggleButton", Mojo.Event.propertyChange, this.handleToggleButtonSwap = function(event){
		if(event.value === true){
			alarms.setAlarm(this.alarm.id, {callback: this.handleAlarmFail.bind(this)});
		}else {
			alarms.clearAlarm(this.alarm.id);
		}
		//this.alarm.on = event.value;
	}.bind(this));
	this.d = new Date();
	this.d.setHours(this.alarm.time.hours);
	this.d.setMinutes(this.alarm.time.minutes);
	
	this.controller.setupWidget('timePicker', {
		label: 'Time:',
		labelPlacement: Mojo.Widget.labelPlacementLeft,
		minuteInterval: 1
	}, {
		time: this.d
	});
	this.controller.setupWidget('listSelector', {
		label: $L('Occurs'), 
		choices: [
			{label: $L('Once'), value: 'once'},
			{label: $L('Daily'), value: 'daily'},
			{label: $L('Weekdays'), value: 'weekdays'},
			{label: $L('Weekends'), value: 'weekends'},
			{label: $L('Sundays'), value: 'sundays'},
			{label: $L('Mondays'), value: 'mondays'},
			{label: $L('Tuesdays'), value: 'tuesdays'},
			{label: $L('Wednesdays'), value: 'wednesdays'},
			{label: $L('Thursdays'), value: 'thursdays'},
			{label: $L('Fridays'), value: 'fridays'},
			{label: $L('Saturdays'), value: 'saturdays'}
		]
	}, {
		value: this.alarm.occurs
	});
	this.controller.listen("listSelector", Mojo.Event.propertyChange, this.handleOccuranceChange = function(event){
		this.alarm.occurs = event.value;
		this.alarm.on =  true;
		alarms.setAlarm(this.alarm.id, {callback: this.handleAlarmFail.bind(this)});		
	}.bind(this));
	
	this.controller.listen("timePicker", Mojo.Event.propertyChange, this.handleTimeChange = function(event){
		this.alarm.time.hours = event.value.getHours();
		this.alarm.time.minutes = event.value.getMinutes();
		if(this.alarm.on){		
			alarms.setAlarm(this.alarm.id, {callback: this.handleAlarmFail.bind(this)});
		}
	}.bind(this));
	
	this.soundDiv = this.controller.get("sound");
	this.soundDiv.innerHTML = this.alarm.sound.name;

	this.controller.listen("sound", Mojo.Event.tap, this.handleSoundTap = function(event){
		Mojo.FilePicker.pickFile({
			"kinds": ["ringtone"],
			"filePath":this.alarm.sound.path,
			"onSelect":this.pickSound.bind(this),
			"actionType":"attach",
		}, this.controller.stageController);
	}.bind(this));

};

AlarmPreferencesAssistant.prototype.handleAlarmFail = function(failed) {
	//if(failed === "set"){ //either way, alarm.on should be correct
		this.toggleButtonModel.value = this.alarm.on;
		this.controller.modelChanged(this.toggleButtonModel);
	//}
}

AlarmPreferencesAssistant.prototype.activate = function(event) {
	alarms.save(this.alarm);
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

AlarmPreferencesAssistant.prototype.pickSound = function(file) {
	if (file && file.fullPath) {
		if (!file.name) {
			file.name = file.fullPath;
		}
		this.alarm.sound.name = file.name;
		this.alarm.sound.path = file.fullPath;
		this.alarm.sound.type = "file";
		this.soundDiv.innerHTML = this.alarm.sound.name;
	}
}

AlarmPreferencesAssistant.prototype.deactivate = function(event) {
	this.alarm.name = this.controller.get("textField").mojo.getValue();
	alarms.save(this.alarm);
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

AlarmPreferencesAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
