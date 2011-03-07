library(RGraphicsDevice)
library(rjson)
library(maps)

mongoDevice = function(dim=c(800,800),host="localhost:3000") {
	dev = new("RDevDescMethods")
	dim = as.integer(dim)
	source(sprintf("http://%s/dev.new?width=%d&height=%d",host,dim[1],dim[2]))
	print(sprintf("http://localhost:3000/device.html?%s",.Gfx.Id))
	postCmd = function(cmd) {
		con = socketConnection(port=3000,host="localhost")
		j = toJSON(cmd)
		l = sprintf("POST /dev.cmd/%s HTTP/1.1\nContent-Type: application/json\nContent-Length:%d\n\n%s",.Gfx.Id,nchar(j),j)
#		writeLines(l)
		writeLines(l,con)
		close(con)
	}
	
	to.attr = function(from) {

		ans = character()
	  ans["stroke-width"] = from$lwd

	  col = as(from$col, "RGB")
	  ans["stroke"] = if(col == "transparent") "none" else col


	  fill = as(from$fill, "RGB")
	  ans["fill"] = if(fill == "transparent") "none" else fill          
		ans		
	}
	
	
	
	dev@line = function(x1,y1,x2,y2,gcontext,dev) {
		postCmd(list(type="polyline",x=c(x1,x2),y=c(y1,y2),attr=to.attr(gcontext)))
	}
	dev@circle = function(x,y,r,gcontext,dev) {
		postCmd(list(type="circle",x=x,y=y,r=r,attr=to.attr(gcontext)))
	}
	dev@rect = function(x,y,w,h,gcontext,dev) {
		postCmd(list(type="rect",x=x,y=y,w=w,h=h,attr=to.attr(gcontext)))
	}
	dev@polygon = function(n,x,y,gcontext,dev) {
		postCmd(list(type="polygon",x=x[1:n],y=y[1:n],attr=to.attr(gcontext)))
	}
	dev@polyline = function(n,x,y,gcontext,dev) {
		postCmd(list(type="polyline",x=x[1:n],y=y[1:n],attr=to.attr(gcontext)))
	}
	dev@text = function(x,y,str,rot,hadj,gcontext,dev) {
		postCmd(list(type="text",x=x,y=y,str=str,rot=rot,hadj=hadj,attr=to.attr(gcontext)))
	}
	dev@strWidth = function(str, gcontext, dev) {
		nchar(str) *  min(10, gcontext $ ps) * gcontext$cex
	}
	dev@close = function(dev) {
		
	}
	dev@initDevice = function(dev) {
    dev$ipr = rep(1/72.27, 2)
    dev$cra = rep(c(6, 13)/12) * 10
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
#d = mongoDevice()
#plot(x,col=c("red","green","blue")[x$Species],pch=19)
#dev.off()
#pdf()
#plot(x,col=c("red","green","blue")[x$Species],pch=19)
#dev.off()
d = mongoDevice()
x = read.delim("california.txt")
map("county","california",fill=TRUE,col=as.character(x$color))
dev.off()


