data(iris)

n = names(iris)
for(obs in apply(iris,1,function(x) paste(n,x,sep="=",collapse="&"))) {
	source(sprintf("http://localhost:3000/obs/iris?%s",obs))
}