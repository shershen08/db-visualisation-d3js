
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