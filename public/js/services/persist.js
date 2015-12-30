roadFravel.factory('rf_persistPool', function($http,$q) {

	function persistPool (inp) {
		var q = $q.defer();
		 $http({
               method:'POST',
               url:'/persist',
               data:JSON.stringify(inp)
           })
     		.success(function(response){
     				console.log(response);
     				q.resolve({data:response});
     			}).error(function (response) {
     				q.reject({data:response});
     				console.log('persist failed');
     				console.log(response);
     			});
     	return q.promise;
	}
   

     	return {
     		savePool : function (inp) {
     			return persistPool(inp);
     		}
     	};
});