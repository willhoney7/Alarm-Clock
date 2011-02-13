/* utils */
function formatSystemTime(obj){
	var hours = (Mojo.Format.using12HrTime()) ? (obj.hour > 12) ? (obj.hour - 12) : (obj.hour === 0) ? 12 : obj.hour : obj.hour;
	return hours + ":" + ((obj.minute > 9) ?obj.minute : "0"+obj.minute);
}
function getAM_PM(hours){
	return (Mojo.Format.using12HrTime()) ? (hours > 11) ? "PM" : "AM" : "";
}
function formatObjTime(date){
	var hours = date.getHours();
	var hours = (Mojo.Format.using12HrTime()) ? (hours > 12) ? (hours - 12) : (hours === 0) ? 12 : hours : hours;
	return hours + ":" + ((date.getMinutes() > 9) ?date.getMinutes() : "0"+date.getMinutes());
}
function formatObjDate(date, format_){
	format = (format_)? format_ : "default";
	if(format === "decent"){
		var daysOfWeek = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
		return daysOfWeek[date.getDay()] + ", " + Mojo.Format.formatDate(date, {"date": "long"})
	}
	return Mojo.Format.formatDate(date, {"date": format});
}