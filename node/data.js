var sys = require('util'),M = require('mongodb');


function Data(options) {
	options = options || {};
	this.initialized = false;
	this.db = new M.Db(options.db || "data",new M.Server(options.host||"localhost",options.port||27017),{autoReconnect:true});
	var self = this;
	this.db.open(function(err,db) {
		if(!err && db) self.initialized = true;
	});
}
exports.Data = Data;
Data.prototype._c = function(name,cb) {
	if(!this.initialized) 
		cb("connection not open.");
	else {
		this.db.collection(name,cb);
	}
};

Data.prototype.report  = function(df,params,sink) {
	var self = this;
	self._c("metadata",function(err,coll) {
		coll.findOne({_id:df},function(err,meta) {
			if(err) {
				sink.writeHead(500);
				sink.end(err);
			} else if(!meta) {
				sink.writeHead(404);
				sink.end();
			} else {
				var order = [];
				var cols  = [];
				var cat   = [];
				for(var i in meta.columns) {
					order.push(meta.columns[i]);
					cat.push(meta.cat[i] ? true : false);
					cols.push(meta.columns[i].split("_").join("."));
				}

				var query = {d:df};
				if(params.q) {
					for(var i in params.q) {
						query[i] = params.q[i];
					}
				}
				sink.writeHead(200,{'Content-Type':'text/plain'});
				sink.write(cols.join("\t")+"\n");
				self._c("observations",function(err,coll) {
					if(!err) {
						coll.find(query,function(err,cursor) {
							cursor.each(function(err,x) {
								if(err || x == null) {
									sink.end();
								} else {
									var line = [];
									for(var i in order) {
										line.push(cat[i] ? '"'+x.r[order[i]]+'"' : x.r[order[i]]);
									}
									sink.write(line.join("\t")+"\n");
								}
							});
						});
					}
				});
			}
		});
	});
}


Data.prototype.observe = function(df,value,cb) {
	var cols = [];
	var meta = {};
	var rec  = {};
	for(var i in value) {
		var name = i.split(".").join("_");
		cols.push(name);
		var num  = 1*value[i];
		rec[name] = isNaN(num) ? value[i] : num;
		if(isNaN(num)) meta["cat."+name] = 1;
	}
	var self = this;
	self._c("observations",function(err,coll) {
		if(err) 
			cb(err);
		else {
			coll.insert({d:df,t:new(Date)().getTime(),r:rec});
			self._c("metadata",function(err,coll) {
				if(err)
					cb(err);
				else {
					coll.update({_id:df},{$set:meta,$addToSet:{columns:{$each:cols}}},{upsert:true});
					cb(null,true);
				}
			});
		}
	});
};
