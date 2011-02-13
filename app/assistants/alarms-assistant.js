function AlarmsAssistant() {}

AlarmsAssistant.prototype.setup = function() {
	this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass: 'no-fade'}, {
		visible: true,
		items: [
			{icon: "new", command: "new-alarm"}
		]
	});
	
	this.listAttrs = { 
	    itemTemplate: "alarms/list-item",
		hasNoWidgets: false,
		formatters: {
			"info": function(value, model){
				if(model && model.time){
					var d = alarms.getNextDate(model);
					return formatObjTime(d) + " " + getAM_PM(d.getHours()) + " " + model.occurs.capitalize();
				}
			},
			"next": function(value, model){
				if(model && model.time){
					if(model.on){
						var d = alarms.getNextDate(model);
						return formatObjDate(d, "decent")
					}else {
						return "<i>Alarm Off</i>";
					}
				}
			},
			"sound": function(value, model){
				if(model && model.sound){
					return model.sound.name;
				}
			}
		},
		//filterFunction: this.filterAlarms.bind(this), //todo
	    reorderable: false,
	    swipeToDelete: true
    };
	this.listModel = {            
        items: alarms.alarms
    };
	this.controller.setupWidget("toggleButton", {modelProperty: "on"});
	this.controller.setupWidget('alarms_list', this.listAttrs, this.listModel);
	this.controller.listen("alarms_list", Mojo.Event.listTap, this.handleListTap = this.listTap.bind(this));
	this.controller.listen("alarms_list", Mojo.Event.listDelete, this.handleListDelete = this.listDelete.bind(this));
	this.controller.listen("alarms_list", Mojo.Event.propertyChange, this.handlePropertyChange = this.propertyChange.bind(this));
};

AlarmsAssistant.prototype.activate = function(event) {
	this.controller.modelChanged(this.listModel);
};
AlarmsAssistant.prototype.listTap = function(event) {
	this.controller.stageController.pushScene("alarm-preferences", event.item);
};
AlarmsAssistant.prototype.listDelete = function(event) {
	alarms.alarms.splice(event.index, 1);
	alarms.save();
};
AlarmsAssistant.prototype.propertyChange = function(event) {
	if(event.value === true){
		alarms.setAlarm(event.model.id, {callback: this.activate.bind(this)});
	}else {
		alarms.clearAlarm(event.model.id, this.activate.bind(this));
	}
};
AlarmsAssistant.prototype.filterAlarms = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

AlarmsAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

AlarmsAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
