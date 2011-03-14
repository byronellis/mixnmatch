library(maps)
source("graphicsDevice.R")
votes = read.delim("votes.txt")

#ramp = colorRamp(c("#7a75cd","#ff8080"))
ramp = colorRamp(c("blue","red"))
mongoDevice(c(500,500),id="elections",record=FALSE)

while(TRUE) {
toload = votes[sample(1:nrow(votes),1000,prob=votes$p,replace=TRUE),c("county","party")]
n =names(toload)
for(obs in apply(toload,1,function(x) paste(n,x,sep="=",collapse="&"))) {
	try(source(sprintf("http://localhost:3000/obs/elections?%s",gsub(",","%2C",obs))))
}

x = table(read.delim("http://localhost:3000/df/elections"))
a = 127 + 128*log((x+1))/log(max(x+1))
shade = rgb(ramp(
	with(list(x=x+1),sweep(x,1,rowSums(x),"/"))[,2]
	),alpha=a,maxColorValue=255)
map("county",names(shade),fill=TRUE,boundary=FALSE,lty=0,interior=FALSE,col=shade)
text(-110,30,Sys.time())
Sys.sleep(120)
}
