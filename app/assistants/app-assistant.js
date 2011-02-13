g = {};
g.Metrix = new Metrix(); //Instantiate Metrix Library
g.ServiceRequest = new ServiceRequestWrapper(); //Instantiate asynchronous service protection
g.AjaxRequest = new AjaxRequestWrapper(); ////Instantiate ajax request protection

function AppAssistant(appController){
	this.watchTimeChange();
}
AppAssistant.prototype.handleLaunch = function(launchParams){
	var cardStageController = this.controller.getStageController('cardStage');
 	
	if (!launchParams) {
		// first launch or tap on icon when minimized
		if (cardStageController)
			// application already running
			cardStageController.activate();
		else {

			// Need to launch the stage and scene
			var pushMainScene = function(stageController){
				var versionCookie = new Mojo.Model.Cookie('appVersion_alarmClockPro');
				if(!versionCookie.get())
					stageController.pushScene("startup", "new");
				else if(versionCookie.get() !== Mojo.Controller.appInfo.version)
					stageController.pushScene("startup", "update");
				else
					stageController.pushScene('clock');
			};	
			var stageArgs = {
				name: 'cardStage',
				lightweight: true,
				assistantName: 'StageAssistant'
			};
			this.controller.createStageWithCallback(stageArgs, pushMainScene.bind(this), 'card');
		}
   }
   else {
		//m.debugObj("launchParams", launchParams);
		if(launchParams.action){
			switch (launchParams.action) {
				case 'pushScene':
					data = launchParams.data || "";
					this.controller.getActiveStageController().pushScene(launchParams.scene, data);
					break;
				// Stuff
				case "ring":
					var d = new Date();
					Mojo.Log.error("Rang! ", formatObjTime(d), formatObjDate(d));
					//Mojo.Log.info("Get Alarm Id 1 " + launchParams.alarmId);

					if(!alarms.alarms){
						alarms.load();
					}
					//Mojo.Log.info("Get Alarm Id 2 " + launchParams.alarmId);

					alarms.ring(launchParams.alarmId);
					break;
				case "updateAlarms":
					Mojo.Log.error("Time changed, updating alarms");
					this.updateOnTimezoneChange();
					/*if(!alarms.alarms){
						alarms.load();
					};
					alarms.reSetAlarms(true);//pass true to keep date to today*/
					break;
				case 'nothing':
					cardStageController.activate();
					break;
			}
		}else if (launchParams.justTypeTap){
		}
	}
}
AppAssistant.prototype.watchTimeChange = function (event) {
	this.timeChangeRegisterRequest = g.ServiceRequest.request("palm://com.palm.systemservice/time", {
		method: "setTimeChangeLaunch",
		parameters: {
			"appId":"com.tibfib.app.clock",
			"parameters":{
				"action":"updateAlarms"
			}
		},
		onSuccess: function(payload) {
			Mojo.Log.info("Clock: registered for timezone changes");
		}.bind(this),
		onFailure: function() {
			Mojo.Log.error("Clock: can't register for time changes");				
		}
	});
}

//Palm's function. adapted
AppAssistant.prototype.updateOnTimezoneChange = function() {
	this.timezoneRequest = new Mojo.Service.Request("palm://com.palm.systemservice/time", {
		method: "getSystemTime",
		parameters: {
			"subscribe":false
		},
		onSuccess: function(payload) {
			//Mojo.Log.error("time update payload = " + Object.toJSON(payload));
			if (this.lastTz === undefined) {
				this.lastTz = payload.offset;
			} else if (this.lastTz != payload.offset) {
				this.lastTz = payload.offset;
				alarms.updateScene();//update scene
			} else {
				Mojo.Log.error("resetting alarms");
				if(!alarms.alarms){
					alarms.load();
				};
				alarms.reSetAlarms(true);//pass true to keep date to today*/	
			}			
		}.bind(this),
		onFailure: function() {
			Mojo.Log.error("Alarm: can't connect to system service");				
		}.bind(this)
	});
	
};

AppAssistant.prototype.handleCommand = function (event) {
    switch(event.type) {
        case Mojo.Event.command:
            switch (event.command) { 
				case 'popScene':
					this.controller.getActiveStageController().popScene('pop', Mojo.Transition.zoomFade);
					break;
				case Mojo.Menu.prefsCmd:			
					this.controller.getActiveStageController().pushScene("prefs");
					break;
				case 'do-about':
					this.controller.getActiveStageController().pushScene("about");
					break;
				case Mojo.Menu.helpCmd:
					this.controller.getActiveStageController().pushScene("help");
					break;
				case "swapMain-fromStartUp":
				case "swapClock-fromStartUp":
					this.controller.getActiveStageController().swapScene("clock");
					break;
				case "clock":
					if(this.controller.getActiveStageController().activeScene().assistant.controller.sceneName !== "clock"){
						this.controller.getActiveStageController().swapScene({name: "clock", transition: Mojo.Transition.crossFade});
					}
					break;
				case "alarms":
					if(this.controller.getActiveStageController().activeScene().assistant.controller.sceneName !== "alarms"){
						this.controller.getActiveStageController().swapScene({name: "alarms", transition: Mojo.Transition.crossFade});
					}
					break;
				case "new-alarm":
					this.controller.getActiveStageController().pushScene("alarm-preferences");
					break;
				case 'do-review':
					var launchParams = {
						id: "com.palm.app.findapps",
						params: {'target': "http://developer.palm.com/appredirect/?packageid=com.tibfib.mojo.player"}
					};
        
					g.ServiceRequest.request('palm://com.palm.applicationManager',
					{
						method: 'open',
						parameters: launchParams
					});
    
					break;
            }
        break;
    }
};