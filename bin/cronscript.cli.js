var program = require("commander");
var chokidar = require("chokidar");
var cron = require("node-cron");
var desknotify = require("desknotify");
var fecha = require("fecha");
var CronScript = require(__dirname + "/../src/cronscript.js");
var fs = require("fs");

program
	.version("1.0.0")
	.option("-f, --file <file>", "Specify the file to start listening for changes.")
	.parse(process.argv);

var file = program.file;

console.log("[cronscript.cli] Start watching file: " + file);

var cronScripts = [];

var cleanCronScripts = function () {
	cronScripts.forEach(function(item) {
		item.task.destroy();
		console.log("[cronscript.cli] Removed task at: " + item.data.date);
	});
};

var updateCron = function(filepath) {
	cleanCronScripts();
	var contents = fs.readFileSync(filepath, "utf8");
	var s = CronScript.parse(contents);
	for(var a=0; a<s.length; a++) {
		var item = s[a];
		(function(date, content) {
			var task = cron.schedule(date, function() {
				console.log("[cronscript.cli] Executing task at: " + date + "\nMessage: ", content.title || content.message);
				var curDate = new Date();
				var curDateStr = "$year/$month/$day $hour:$minute:$second.$milisecond"
					.replace("$year", curDate.getFullYear())
					.replace("$month", curDate.getMonth()+1)
					.replace("$day", curDate.getDate())
					.replace("$hour", curDate.getHours())
					.replace("$minute", curDate.getMinutes())
					.replace("$second", curDate.getSeconds())
					.replace("$milisecond", curDate.getMilliseconds())
				;
				desknotify.notify({
					title: content.title,
					message: curDateStr + "\n" + content.message
				}).then(function() {}).catch(function() {}).finally(function() {});
			});
	    cronScripts.push({data:{date,content},task});
			console.log("[cronscript.cli] Added task at: " + date);// + fecha.format(date, "YYYY/MM/DD hh:mm:ss.SSS A"));
	  })(item.date, item.content);
	}
};

chokidar.watch(file).on("change", updateCron);

process.on("exit", cleanCronScripts);

updateCron(file);

/*
if(typeof cronScripts !== "undefined") {
	cronScripts.forEach(function(item) {
		item.destroy();
	});
}
var cronScripts = [];
var cron = require("node-cron");
var desknotify = require("desknotify");
for(var a=0; a<s.length; a++) {
	var item = s[a];
	(function(date, content) {
		var task = cron.schedule(date, function() {
			desknotify.notify({
				title: content.title,
				message: content.message
			});
		});
    cronScripts.push(task);
		console.log("[cronscript] Added task at: " + date);
  })(item.date, item.content);
}
//*/