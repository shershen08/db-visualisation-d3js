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

