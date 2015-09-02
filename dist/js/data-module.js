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
