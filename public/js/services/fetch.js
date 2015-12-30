roadFravel.factory('rf_fetchResults', function($http,$q) {

	function fetch (inp) {
		var q = $q.defer();
		 $http({
               method:'POST',
               url:'/fetch',
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
     		fetchPool : function (inp) {
     			return fetch(inp);
     		}
     	};
});