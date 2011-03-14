votes = read.delim("votes.txt")




toload = votes[sample(1:nrow(votes),1000,prob=votes$p,replace=TRUE),c("county","party")]
n =names(toload)
for(obs in apply(toload,1,function(x) paste(n,x,sep="=",collapse="&"))) {
	try(source(sprintf("http://localhost:3000/obs/elections?%s",gsub(",","%2C",obs))))
}

