var mongo = require('mongodb');
var sys   = require('util');

function Gfx(options) {
	this.options = options || {};
	this.client = new mongo.Db(this.options.db || "beeper",
		new mongo.Server(this.options.host || "localhost",this.options.port || 27017),{});
}
exports.Gfx = Gfx;

Gfx.prototype.dev_new = function(res,width,height) {
	var self = this;
	var id = ""+((new Date()).getTime());
	self.client.open(function(err,d) {
		d.collection('gfx',function(err,coll) {
			coll.insert({_id:id,width:width,height:height});
			res.writeHeader(200,{"Content-type":"text/plain"});
			res.end(".Gfx.Id = \""+id+"\";");
			d.close();
		});
	});
};

Gfx.prototype.cmd = function(id,cmd,res) {
	new mongo.Db(this.options.db || "beeper",
	new mongo.Server(this.options.host || "localhost",this.options.port || 27017),{})
		.open(function(err,d) {
			d.collection('gfx',function(err,coll) {
				coll.update({_id:id},{$push:{cmds:cmd}},{upsert:true});
				d.close();
				res.writeHead(200,{});res.end();
			});
	});
};

Gfx.prototype.get = function(id,res) {
	var self = this;
	self.client.open(function(err,d) {
		d.collection('gfx',function(err,coll) {
			coll.findOne({_id:id},function(err,gfx) {
				d.close();
				res.writeHeader(200,{"Content-type":"application/json"});
				res.end(JSON.stringify(gfx));
			});
		})
	})
};


