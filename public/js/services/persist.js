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

roadFravel.factory('rf_deleteMyPool', function($http,$q) {

     function persistPool (inp) {
          var q = $q.defer();
           $http({
               method:'DELETE',
               url:'/fetch/mypools/'+inp.id,
           })
               .success(function(response){
                         console.log(response);
                         q.resolve(response);
                    }).error(function (response) {
                         q.reject(response);
                         console.log('deletion failed');
                         console.log(response);
                    });
          return q.promise;
     }
   

          return {
               deleteMyPool : function (inp) {
                    return persistPool(inp);
               }
          };
});