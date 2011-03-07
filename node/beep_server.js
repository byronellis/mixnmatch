var sys  = require('util'),
	  http = require('http'),
		url  = require('url'),
		fs   = require('fs'),
		B    = require('./beep.js'),
		G    = require('./gfx.js');

var beeper = new B.Beeper({});
var gfx    = new G.Gfx({});

http.createServer(function(req,res) {
	var postData = "";
	req.setEncoding("utf8");
	req.addListener("data",function(chunk) { 
		postData += chunk; 
	});
	req.addListener("end",function() {
		var uri = url.parse(req.url,true);
		var elts= uri.pathname.split("/");
		if(elts[1] == "obs") {
			var id = elts[2];
			beeper.observe(id,uri.query,function(err,rec) {
				if(err) {
					res.writeHead(500,{});
					res.end()
				} else {
					res.writeHead(200,{'Content-type':'application/json'});									
					res.end();
				}
			});
		} else if(elts[1] == "df") {
			var id = elts[2];
			res.writeHead(200,{'Content-type':'text/plain'});
			beeper.output(id,res);
		} else if(elts[1] == "dev.new") {
			gfx.dev_new(res,uri.query.width||(5*72),uri.query.height||(5*72));
		} else if(elts[1] == "dev.cmd") {
			if(postData.length > 0)
				gfx.cmd(elts[2],JSON.parse(postData),res);
			else {
				res.writeHead(200,{});
				res.end();
			}
		} else if(elts[1] == "dev.js") {
			console.log("Getting device "+elts[2]);
			gfx.get(elts[2],res);
		} else {
			sys.puts("../html"+uri.pathname);
			fs.readFile("../html"+uri.pathname,function(err,data) {
				if(err) {
					console.log(sys.inspect(err));
					res.writeHead(404);
					res.end();
				} else {
					res.writeHead(200,{'Content-type':'text/html'});
					res.end(data);
				}
			});
		}
	});
}).listen(3000,"localhost");
console.log("Server is running on port 3000");

