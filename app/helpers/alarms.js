alarms = {
	load: function(){
		this.cookie = new Mojo.Model.Cookie('alarms_alarmClock');
		try {
			var contents = this.cookie.get();
			if(contents){
				this.alarms = contents;
			} else {
				this.alarms = [];
			}
		}catch(e){
			Mojo.Log.error(e);
			this.alarms = [];
			this.save();
		}
	},
	save: function(alarm_){
		if(alarm_){
			alarm = this.getAlarm(alarm_.id);
			if(alarm){
				this.alarms.splice(alarm.index, 1, alarm.obj)
			} else {
				this.alarms.push(alarm_);
			}
		}
		this.cookie.put(this.alarms);
	},
	newAlarm: function(){
		var d = new Date();
		var hourAhead = new Date(d.getTime() + 3600000);
		return {
			"id": "_"+ d.getTime() + "_",
			"name": "Alarm ",
			"on": false,
			"time": {
				"hours": hourAhead.getHours(),
				"minutes": hourAhead.getMinutes()
			},
			"occurs": "",
			"sound": {
				"type": "file",
				"name": "Alarm Clock",
				"path": Mojo.appPath + "sounds/alarm clock.mp3"
			},
			"priority": "high"
		};
	},	
	setAlarm: function(id, arg){
		var alarm = this.getAlarm(id).obj;
		var d = (arg && arg.keepToday) ? this.getNextDate(alarm, arg.keepToday) : this.getNextDate(alarm);			
		
		var dateString, mo, date, yr, hrs, mins, secs;
		function pad(num){
			if(num < 10){
				num = "0"+ num;
			}
			return num;
		}
		mo = d.getUTCMonth() + 1;
		date = d.getUTCDate();
		yr = d.getUTCFullYear();
		hrs = d.getUTCHours();
		mins = d.getUTCMinutes();
		//secs = d.getUTCSeconds();

		dateString = pad(mo) + "/" + pad(date) + "/" + pad(yr) + " " + pad(hrs) + ":" + pad(mins) + ":00";
		var params = {
			"wakeup": true,
			"key": "com.tibfib.app.clock.alarm."+alarm.id,
			"uri": "palm://com.palm.applicationManager/launch",
			"params": {
				"id": Mojo.Controller.appInfo.id,
				"params":{
					"action":"ring", 
					"alarmId": alarm.id
				}
			},
			"at": dateString
		};

		this.setAlarmRequest = g.ServiceRequest.request("palm://com.palm.power/timeout/", {
			method: "set",
			parameters: params,
			onSuccess: function(payload) {
				if (payload) {
					alarm.on = true;
				} else {
					alarm.on = false;
				}
				if(arg && arg.callback){
					arg.callback(true);
				}
				try {
					this.setAlarmRequest.cancel();
				}catch(e){};
				this.setAlarmRequest = undefined;
			}.bind(this),
			onFailure: function() {
				alarm.on = false;
				if(arg && arg.callback){
					arg.callback(false);
				}
				try {
					this.setAlarmRequest.cancel();
				}catch(e){}			
				this.setAlarmRequest = undefined;
			}.bind(this)
		});
	},
	clearAlarm: function(id, callback){
		var alarm = this.getAlarm(id).obj;		
		this.clearAlarmRequest = new Mojo.Service.Request("luna://com.palm.power/timeout/", {
			method: "clear",
			parameters: {"key": "com.tibfib.app.clock.alarm."+id},
			onSuccess: function() {
				alarm.on = false;
				if(callback){
					callback(false);
				}
				//this.clearAlarmRequest.cancel();
				this.clearAlarmRequest = undefined;
			}.bind(this),
			onFailure: function() {
				Mojo.Log.error("Alarm: removeTask couldn't connect to scheduler service");
				if(callback){
					callback(true);
				}
				//this.clearAlarmRequest.cancel();
				this.clearAlarmRequest = undefined;
			}.bind(this)	
		});
	},
	reSetAlarms: function(keepToday){
		this.alarms.each(function(alarm) {
			if (alarm.on) {
				this.setAlarm(alarm.id, {keepToday: keepToday});
			}
		}.bind(this));
	},
	getAlarm: function(id){
		for(var i = 0; i < this.alarms.length; i++){
			if(this.alarms[i].id && this.alarms[i].id === id){
				return {obj: this.alarms[i], index: i};
			}
		}
		return undefined;
	},
	
	getNextDate: function(alarm, keepToday){
		var d = new Date();
		var alarmDate = new Date();
			alarmDate.setHours(alarm.time.hours);
			alarmDate.setMinutes(alarm.time.minutes);
			alarmDate.setSeconds(0);
		if(!keepToday){
			switch (alarm.occurs){
				case "":
				case "daily":
					//calculate current time in milliseconds
					if(alarmDate.getTime() < d.getTime()){
						alarmDate.setDate(d.getDate()+1);
					}
					break;
				case "weekends":
				
				case "weekdays":
				
				case "sundays":
					
					break;
				
				case "mondays":
					
					break;
				
				case "tuesdays":
					
					break;
				
				case "wednesdays":
					
					break;
				
				case "thursdays":
					
					break;
				
				case "fridays":
					
					break;
				
				case "saturdays":
					
					break;		
			}
		}
		return alarmDate;
	},
	ring: function(id){
		var alarm = this.getAlarm(id).obj;
		Mojo.Log.info("Alarm! "+ Object.toJSON(alarm));
		var d = new Date();
		if(d.getHours() !== alarm.hours){
			//this.reSetAlarms();
			//return;
		}
		this.createAlarmDashboard(alarm);
		if(alarm.occurs === ""){
			alarm.on = false;
			this.save(alarm);
			this.updateScene();
		} else {
			this.setAlarm(alarm.id, {callback: function(returnValue){
				alarm.on = returnValue;
				this.save(alarm);
				this.updateScene();
			}.bind(this)});
		}
	},
	createAlarmDashboard: function(alarm){
		var dashboardStage = Mojo.Controller.getAppController().getStageController(alarm.id);
		if(dashboardStage) 
			dashboardStage.delegateToSceneAssistant("displayDashboard", alarm);
		else{
			pushDashboard = function (stageController) {
				stageController.pushScene('dashalarm', alarm);
			};
			Mojo.Controller.getAppController().createStageWithCallback({name: alarm.id, lightweight: true, clickableWhenLocked: false}, pushDashboard, 'dashboard');
		};
	
	},
	updateScene: function(){
		Mojo.Controller.getAppController().getStageController("cardStage").delegateToSceneAssistant("activate");
	},
}
