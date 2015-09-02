var drawer = function(){

	var diameter = 660,
	    radius = diameter / 2,
	    innerRadius = radius - 120;

	function initClusterAndBundle() {
		this.cluster = d3.layout.cluster()
		    .size([360, innerRadius])
		    .sort(null)
		    .value(function(d) { return d.size; });

		this.bundle = d3.layout.bundle();

		this.svg = d3.select("body").append("svg")
				    .attr("width", diameter)
				    .attr("height", diameter)
				    .append("g")
				    .attr("transform", "translate(" + radius + "," + radius + ")");

		this.line = d3.svg.line.radial()
				    .interpolate("bundle")
				    .tension(.85)
				    .radius(function(d) { return d.y; })
				    .angle(function(d) { return d.x / 180 * Math.PI; });

		utils.addStaticText(this.svg, "Subject roles relations");

		 var tipTemplateFunction = function(obj){
	      return 'id: ' + _.get(obj, 'Field._id');
	    };
		utils.initTip(this.svg, tipTemplateFunction, [-10, 0]);
	}


	return {
			
			initDraw : initClusterAndBundle,
			
			drawSchema : function(links, nodes){

			//draw connections
			 this.svg.selectAll(".link")
		      .data(this.bundle(links))
		      .enter().append("path")
		      //.attr("class", "link")
		      .attr("stroke", function(){
		      	return utils.getRandomColor();
		      })
		      .attr("fill", "none")
		      .attr("stroke-width", 2)
		      .attr("d", this.line);

			//draw labels
			this.svg.selectAll(".node")
			      .data(nodes.filter(function(n) { return !n.children; }))
			      .enter().append("g")
			      .attr("class", "node")
			      .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
			    .append("text")
			      .attr("dx", function(d) { return d.x < 180 ? 8 : -8; })
			      .attr("dy", ".31em")
			      .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
			      .attr("transform", function(d) { return d.x < 180 ? null : "rotate(180)"; })
			      .text(function(d) { 
			      	if(d.imports.length){
			      	  return d.text + ' (' + d.imports.length + ')';
			      	} else {
			      	  return d.text;
			      	}
			      })
			      .on("click", function(d) { utils.handleClick(d);})
			      .on('mouseover', function(d){ if(tip) tip.show(d);})
      			  .on('mouseout',  function(d){ if(tip) tip.hide(d);});
			
			d3.select(self.frameElement).style("height", diameter + "px");		
			}, 
			tick : function () {
		        path.attr("d", function (d) {
		            var dx = d.target.x - d.source.x,
		                dy = (d.target.y - d.source.y),
		                dr = Math.sqrt(dx * dx + dy * dy);
		            return "M" + d.source.x + "," + d.source.y + "A" + (dr - drSub) + "," + (dr - drSub) + " 0 0,1 " + d.target.x + "," + d.target.y;
		        });

		        circle.attr("transform", function (d) {
		            return "translate(" + d.x + "," + d.y + ")";
		        });

		        text.attr("transform", function (d) {
		            return "translate(" + d.x + "," + d.y + ")";
		        });
		    }
		}

}