library(RGraphicsDevice)
library(rjson)
library(maps)

mongoDevice = function(dim=c(800,800),host="localhost:3000",id=NULL,record=FALSE) {
	dev = new("RDevDescMethods")
	dim = as.integer(dim)
	if(is.null(id))
		source(sprintf("http://%s/dev.new?width=%d&height=%d",host,dim[1],dim[2]))
	else
		source(sprintf("http://%s/dev.new?width=%d&height=%d&id=%s",host,dim[1],dim[2],id))
	print(sprintf("http://localhost:3000/#!/%s",.Gfx.Id))
	
	postCmd = function(cmd,from) {
		new.attr = to.attr(from)
		if(length(new.attr) > 0)
			cmd$attr = new.attr
		con = socketConnection(port=3000,host="localhost")
		j = toJSON(cmd)
		l = sprintf("POST /dev.cmd/%s HTTP/1.1\nContent-Type: application/json\nContent-Length:%d\n\n%s",.Gfx.Id,nchar(j),j)
		writeLines(l,con)
		close(con)
	}
	
	last.attr = list()
	
	
	to.attr = function(from,font=FALSE) {
		new.attr = list()
		update.val = function(key,val) {
			if(length(last.attr[[key]]) == 0 || val != last.attr[[key]]) {
				last.attr[[key]] <<- val
				new.attr[[key]] <<- val
			}
		}
		update.val("col",as.character(as(from$col,'RGB')))
		update.val("fill",as.character(as(from$fill,'RGB')))
		update.val("gamma",from$gamma)
		update.val("lwd",from$lwd)
		update.val("lty",from$lty)
		update.val("lend",from$lend)
		update.val("ljoin",from$ljoin)
		update.val("lmitre",from$lmitre)
		update.val("cex",from$cex)
		update.val("ps",from$ps)
		update.val("lineheight",from$lineheight)
		update.val("fontface",from$fontface)
		update.val("fontfamily",from$fontfamily)
		new.attr
	}
	
	dev@newPage = function(gcontext,dev) {
		last.attr <<- list()
		if(record)
			postCmd(list(type="page"),gcontext)
		else
			source(sprintf("http://%s/dev.page/%s",host,.Gfx.Id))
	}
	dev@line = function(x1,y1,x2,y2,gcontext,dev) {
		postCmd(list(type="polyline",x=round(c(x1,x2),2),y=round(c(y1,y2),2)),gcontext)
	}
	dev@circle = function(x,y,r,gcontext,dev) {
		postCmd(list(type="circle",x=round(x,2),y=round(y,2),r=round(r,2)),gcontext)
	}
	dev@rect = function(x,y,w,h,gcontext,dev) {
		postCmd(list(type="rect",x=round(x,2),y=round(y,2),w=round(w,2),h=round(h,2)),gcontext)
	}
	dev@polygon = function(n,x,y,gcontext,dev) {
		postCmd(list(type="polygon",x=round(x[1:n],2),y=round(y[1:n],2)),gcontext)
	}
	dev@polyline = function(n,x,y,gcontext,dev) {
		postCmd(list(type="polyline",x=round(x[1:n],2),y=round(y[1:n],2)),gcontext)
	}
	dev@text = function(x,y,str,rot,hadj,gcontext,dev) {
		postCmd(list(type="text",x=round(x,2),y=round(y,2),str=str,rot=rot,hadj=hadj),gcontext)
	}
	dev@strWidth = function(str, gcontext, dev) {
		nchar(str) *  max(10, gcontext $ ps) * gcontext$cex
	}
	dev@close = function(dev) {
		
	}
	dev@initDevice = function(dev) {
		dev$xCharOffset = 0.4900
		dev$yCharOffset = 0.3333
		dev$yLineBias   = 0.20
    dev$ipr = rep(1/72, 2)
    dev$cra = 10*c(6,13)/12
    dev$startps = 10
    dev$canClip = TRUE
    dev$canChangeGamma = TRUE
    dev$startgamma = 1 
    dev$startcol = as("black", "RGBInt")		
	}
	dev = graphicsDevice(dev,dim)
	dev
}
#x = read.delim("http://localhost:3000/df/iris")
#data(iris)
#x = iris
#d = mongoDevice(id="elections")
#plot(x,col=c("red","green","blue")[x$Species],pch=19)
#dev.off()
#warnings()
#pdf()
#plot(x,col=c("red","green","blue")[x$Species],pch=19)
#dev.off()
#d = mongoDevice(id="elections")
#x = read.delim("california.txt")
#map("county","california",fill=TRUE,col=as.character(x$color))
#dev.off()


