// The Beeper Module handles interactions with MongoDB to maintain the dataset
var mongo = require('mongodb');
var sys   = require('util');

function Beeper(options) {
	this.options = options || {};
	this.client = new mongo.Db(this.options.db || "beeper",
		new mongo.Server(this.options.host || "localhost",this.options.port || 27017),{});
}
Beeper.prototype.observe = function(id,data,fn) {
	var self = this;
	var ts = Math.floor(new Date().getTime()/1000); //time in seconds
	var cats = {columns:{$each:[]}};
	var rec  = {};
	for(var i in data) {
		var name = i.split(".").join("_");
		cats.columns.$each.push(name);
		var num = 1.0*data[i];
		if(isNaN(num)) { //Categorical data
			cats["cat."+name] = data[i];
			rec[name] = data[i];
		} else
			rec[name] = num;
	}

	self.client.open(function(err,conn) {
		if(err) { fn(err,null);return; }
		conn.collection('beeps',function(err,coll) {
			if(err) { conn.close();fn(err,null);return; }
			coll.insert({t:ts,d:id,r:rec});
			conn.collection('metadata',function(err,coll) {
				if(err) sys.puts(JSON.stringify(err));				
				coll.update({_id:id},{$addToSet:cats},{upsert:true});
				conn.close();
				fn(null,data);
			});
		});
	});
};


Beeper.prototype.output = function(id,res) {
	var self = this;
	self.client.open(function(err,conn) {
		conn.collection('metadata',function(err,coll) {
			coll.findOne({_id:id},function(err,meta) {
				var order = [];
				var cols  = [];
				for(var i in meta.columns) {
					order.push(meta.columns[i]);
					cols.push(meta.columns[i].split("_").join("."));
				}
				res.write(cols.join("\t")+"\n");
					conn.collection('beeps',function(err,coll) {
						coll.find({d:id},function(err,cur) {
							cur.each(function(err,x) {
								if(x == null) {
									conn.close();
									res.end();
								} else {
									var line = [];
									for(var i in order) {
										line.push(x.r[order[i]]);
									}
									res.write(line.join("\t")+"\n");
								}
							});
						});
					});
				});
			});
		});
}




exports.Beeper = Beeper;

