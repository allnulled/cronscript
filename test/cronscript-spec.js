var CronScript = require(__dirname + "/../src/cronscript.js");
var content = require("fs").readFileSync(__dirname + "/sample1.cst", "utf8");
var data = CronScript.parse(content);

console.log(data);