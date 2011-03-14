var sys = require('util'),
		http= require('http'),
		url = require('url'),
		fs  = require('fs'),
		C   = require('./collabotron.js').Collabotron,
		D   = require('./data.js').Data;


var c = new C({});
var d = new D({});

function graphicsCommand(cmd,id,uri,req,res) {
	if(cmd == "dev.cmd") {
		c.commands(id,req,function(err) {
			res.writeHead(200);
			res.end();
		});
	} else if(cmd == "dev.new") {
		c.open(uri.query.id || id,uri.query.width || (5*72),uri.query.height || (5*72),function(err,newId) {
			if(err) {
				sys.puts(sys.inspect(err));
				res.writeHead(500);
				res.end();
			} else {
				res.writeHead(200);
				res.end(".Gfx.Id = \""+newId+"\"");
			}
		});
	} else if(cmd == "dev.page") {
		c.new_page(id,function(err) {
			if(err) {
				sys.puts(err);
				res.writeHead(500);
				res.end();
			} else {
				res.writeHead(200);
				res.end();
			}
		})
	} else if(cmd == "dev.js") {
		c.device(id,function(err,obj) {
			if(err) {
				res.writeHead(500);
				res.end();
			} else {
				res.writeHead(200,{'Content-type':'application/json'});
				res.end(JSON.stringify(obj));
			}
		});
	}	else {
		sys.puts(cmd+": "+id);
		res.writeHead(500);
		res.end("Uknown device command "+cmd);
	}
};


function serveStaticFile(path,res) {
	if(path == "/")
		path = "/device.html";
	fs.readFile("../html"+path,function(err,data) {
		if(err) {
			res.writeHead(404);
			res.end();
		} else {
			res.writeHead(200,{'Content-type':'text/html'});
			res.end(data);
		}
	});
}


http.createServer(function(req,res) {
	var uri   = url.parse(req.url,true);
	var parts = uri.pathname.split("/");
	var cmd   = parts[1] || "";
	if(cmd == "obs") {
		d.observe(parts[2],uri.query,function(err) {
			if(err) { 
				res.writeHead(500);
				res.end(); 
			} else {
				res.writeHead(200);
				res.end();				
			}
		});
	} else if(cmd == "df") {
		d.report(parts[2],uri.query,res);
	} else if(cmd.substring(0,3) == "dev") 
		graphicsCommand(cmd,parts[2] || null,uri,req,res);
	else 
		serveStaticFile(uri.pathname,res);
}).listen(3000);