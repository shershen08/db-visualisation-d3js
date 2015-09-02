var TREE = function(){

  //init
  var m = [20, 120, 20, 120],
  w = 1280 - m[1] - m[3],
  h = 800 - m[0] - m[2],
  i = 0,
  root;

  function init(){
    this.tree = d3.layout.tree()
    .size([h, w]);

    this.diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

    this.vis = d3.select("body").append("svg:svg")
    .attr("width", w + m[1] + m[3])
    .attr("height", h + m[0] + m[2])
    .append("svg:g")
    .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

    utils.addStaticText(this.vis, "DB inheritance (interactive)");

    var tipTemplateFunction = function(obj){
      return 'i---';
    };

    utils.initTip(this.vis, tipTemplateFunction, [-10, 0]);

  };

  init();

  return {

    update : function(source){
      var duration = d3.event && d3.event.altKey ? 5000 : 500;
      // Compute the new tree layout.
      var nodes = tree.nodes(root).reverse();
      // Normalize for fixed-depth.
      nodes.forEach(function(d) { d.y = d.depth * 180; });
      // Update the nodes…
      var node = vis.selectAll("g.node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

      // Enter any new nodes at the parent's previous position.
      var nodeEnter = node.enter().append("svg:g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      .on("click", function(d) { 
        utils.toggle(d);
      });

      nodeEnter.append("svg:circle")
      .attr("r", 1e-6)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

      nodeEnter.append("svg:text")
      //.attr("x", function(d) { return d.children || d._children ? -10 : 10; })
      .attr("dy", "20")
      .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
      .text(function(d) { 
        return d.Field._value;
      })
      .style("fill-opacity", 1e-6)
      .on('mouseover', function(d){ if(tip) tip.show(d);})
      .on('mouseout',  function(d){ if(tip) tip.hide(d);});

      //+ ' (id: ' + d.Field._id + ')'

      // Transition nodes to their new position.
      var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

      nodeUpdate.select("circle")
      .attr("r", 4.5)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

      nodeUpdate.select("text")
      .style("fill-opacity", 1);

      // Transition exiting nodes to the parent's new position.
      var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
      .remove();

      nodeExit.select("circle")
      .attr("r", 1e-6);

      nodeExit.select("text")
      .style("fill-opacity", 1e-6);

      // Update the links…
      var link = vis.selectAll("path.link")
      .data(tree.links(nodes), function(d) { return d.target.id; });

      // Enter any new links at the parent's previous position.
      link.enter().insert("svg:path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      })
      .transition()
      .duration(duration)
      .attr("d", diagonal);

      // Transition links to their new position.
      link.transition()
      .duration(duration)
      .attr("d", diagonal);

      // Transition exiting nodes to the parent's new position.
      link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove();

      // Stash the old positions for transition.
      nodes.forEach(function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
      });

    }, 

    initSecondPart : function(json){

      root = json;
      root.x0 = h / 2;
      root.y0 = 0;

      root.children.forEach(utils.toggleAll);
      this.update(root, true);

    }

  }

};