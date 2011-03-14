//The Collabotron 3000!
var sys = require('util'),M = require('mongodb');


function Collabotron(options) {
	options = options || {};
	this.initialized = false;
	this.db = new M.Db(options.db || "collabotron",new M.Server(options.host||"localhost",options.port||27017),{autoReconnect:true});
	var self = this;
	this.db.open(function(err,db) {
		sys.puts("Opening connection");
		if(err)
			sys.puts(sys.inspect(err));
		if(!err && db) self.initialized = true;
	});
}
Collabotron.prototype._c = function(name,cb) {
	if(!this.initialized) 
		cb("connection not open.");
	else {
		this.db.collection(name,cb);
	}
}

Collabotron.prototype.open = function(id,width,height,cb) {
	this._c("devices",function(err,coll) {
		if(err) 
			cb(err);
		else {
			if(!id)
				id = ""+coll.pkFactory.createPk();
			width *= 1;
			height*= 1;
			sys.puts("width: "+width+",height: "+height+",id: "+id);
			coll.update({_id:id},{_id:id,width:width,height:height,cmd:[]},{upsert:true});
			cb(null,id);
		}
	});
}

Collabotron.prototype.new_page = function(id,cb) {
	var self = this;
		self._c("devices",function(err,coll) {
			if(err) cb(err);
			coll.update({_id:id},{$set:{cmd:[]}},{upsert:true});
			cb(null);
		});
}

Collabotron.prototype.device = function(id,cb) {
	var self = this;
	self._c("devices",function(err,coll) {
		if(err) cb(err);
		coll.findOne({_id:id},cb);
	});
}

Collabotron.prototype.commands = function(id,source,cb) {
//	var _id  = OID.createFromHexString(id);
	var upd  = {_id:id};
	var self = this;
	self._c("devices",function(err,dev_coll) {
		if(err) cb(err);

		var count  = 0;			
		function insert(cmd) {
			dev_coll.update(upd,{$push:{cmd:cmd}},{upsert:true});
			count++;
		}
		
		var buffer = "";
		source.addListener("data",function(newData) {
			buffer += newData;
		});
		source.addListener("end",function() {
			if(buffer.length > 0) {
				insert(JSON.parse(buffer));
			}
			cb(null,count);
		});
	});
}



exports.Collabotron = Collabotron;

