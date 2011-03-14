// Implements the "Collabotron"
(function() {
	function setAttributes(ctx,attr) {
		ctx.strokeStyle = (!attr.stroke || attr.stroke == "none") ? null : attr.stroke;
		ctx.fillStyle   = (!attr.kill   || attr.fill == "none")   ? null : attr.fill;
		ctx.lineWidth   = attr.lwd;
		
	}


	function renderPlot(data) {
		
	}





	$(document).ready(function() {
	
	});
});