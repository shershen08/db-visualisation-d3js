var utils = UTILS();
var x2js = new X2JS();
var dl = DataLayer();
var loadedData = dl.loadData();
var draw = drawer();
var t = TREE();


Promise.all(loadedData).then(function(dataArray){
  var clearData = utils.extractJSON(dataArray, x2js);

  var convertedRelationsData = utils.extractRelationsData(clearData.relations);
  var convertedDBData = utils.extractDBData(clearData.subjtypes);

  initAndDrawWithData(convertedRelationsData);
  initAndDrawSecondData(convertedDBData);

  console.log('convertedRelationsData', convertedRelationsData);
  console.log('convertedDBData', convertedDBData);
})





var initAndDrawWithData = function (dataJSON){
  draw.initDraw();
  var drawObj = {};
  var nodes = draw.cluster.nodes(utils.packageHierarchy(dataJSON)),
  links = utils.packageImports(nodes);
  draw.drawSchema(links, nodes);
}

var initAndDrawSecondData = function (dataJSON){
  t.initSecondPart(dataJSON)
}


/**
Data loading
*/



var DataLayer = function(){

  qwest.base = 'api/';
  //var domain = 'https://dev.effacts.com/effacts/form';
  //var relationsLoadRequest = pegasus(domain + '?method=SubjectRelationTypeList&outputtype=xml');
  var _relationsLoadRequest = 'SubjectRelationTypeList.xml';
  //var dBSchemaLoadRequest = pegasus(domain + '?method=SubjectRoleList&outputtype=xml');
  var _dBSchemaLoadRequest = 'SubjectRoleList.xml';

  return {
      loadData : function (){

        var p1 = new Promise(function(resolve,reject){

          qwest.get(_relationsLoadRequest).then(function(xhr, response) {
            resolve(xhr.response);
          }, function(){
            reject('error');
          });

        });

        var p2 = new Promise(function(resolve,reject){

          qwest.get(_dBSchemaLoadRequest).then(function(xhr, response) {
            resolve(xhr.response);
          }, function(){
            reject('error');
          });
          
        });

        return [p1, p2];

      }
  }
}

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
/**
@fileDescription
*/
var UTILS = function(){

	return {
		toggleAll : function(d) {
		    if (d.children && _.isArray(d.children)) {
		      d.children.forEach(utils.toggleAll);
		      utils.toggle(d, false);
		    }
		},
		handleClick : function(item){
			console.log(item);
		},
		initTip : function(base, templateFunction, offsetElem){

			tip = d3.tip()
				    .attr('class', 'd3-tip')
				    .offset(offsetElem)
				    .html(function(d) {
				      return templateFunction(d);
				    });

		    base.call(tip);
		},
		toggle : function(d, updateNode) {
		  if (d.children) {
		    d._children = d.children;
		    d.children = null;
		  } else {
		    d.children = d._children;
		    d._children = null;
		  }

		  t.update(d);
		},
		setColor : function(){

		},
		addStaticText : function(base, text, position){
			base.append("text").attr({
							            x: base.attr("width") / 2,
							            y: 10,
							            class: "vertical-text"
							        }).text(text);
		},
		getRandomColor : function() {
		    var letters = '0123456789ABCDEF'.split('');
		    var color = '#';
		    for (var i = 0; i < 6; i++ ) {
		        color += letters[Math.floor(Math.random() * 16)];
		    }
		    return color;
		},
		packageImports : function (nodes) {
			  var map = {},
			      imports = [];

			  // Compute a map from name to node.
			  nodes.forEach(function(d) {
			    map[d.name] = d;
			  });

			  // For each import, construct a link from the source to target node.
			  nodes.forEach(function(d) {
			    if (d.imports) d.imports.forEach(function(i) {
			      imports.push({source: map[d.name], target: map[i]});
			    });
			  });

			  return imports;
			},
		packageHierarchy : function (classes) {
			  var map = {};

			  function find(name, data) {
			    var node = map[name], i;
			    if (!node) {
			      node = map[name] = data || {name: name, children: []};
			      if (name.length) {
			        node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
			        node.parent.children.push(node);
			        node.key = name.substring(i + 1);
			      }
			    }
			    return node;
			  }

			  classes.forEach(function(d) {
			    find(d.name, d);
			  });

			  return map[""];
		},
		extractJSON : function(fullJSON, lib){

			var structuredData = {
				"relations" : {},
				"subjtypes" : {}
			};
			fullJSON.forEach(function(item){
				var fullJSON = lib.xml_str2json(item).Effacts;
				if(fullJSON.RecordSet) structuredData.relations = fullJSON.RecordSet;
				if(fullJSON.Record) structuredData.subjtypes = fullJSON.Record;
			})

			return structuredData;
		},
		extractRelationsData : function(rData){
			var extractedData = [];

			rData.Record.forEach(function(rItem){
				var n1 = rItem.Field[1];
				var n2 = rItem.Field[2];

				var itemTemplate = {
									"name" : n1._id,
									"text" : n1._value,
									"imports" : [],
									"size" : 50
									};
				if(!_.findWhere(extractedData, {"name" : n2._id})){
					extractedData.push({
									"name" : n2._id,
									"text" : n2._value,
									"imports" : [],
									"size" : 50
								});
				}

				if(!_.findWhere(extractedData, {"name" : n1._id})){
					itemTemplate.imports.push(n2._id);
					extractedData.push(itemTemplate);
				} else {
					var ex = _.find(extractedData, {"name" : n1._id});
					ex.imports.push(n2._id);
				}


			});

			return extractedData;
		},
		extractDBData : function(sData){
			var JSONstring = JSON.stringify(sData);
			var replacedJSON = JSONstring.replace(/Record/g, "children");

			return _.attempt(function(){
				return JSON.parse(replacedJSON);	
			});
		}
	};
}