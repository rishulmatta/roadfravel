roadFravel.factory('rf_auth', function($http,$q) {

	function isLoggedIn (inp) {
		var q = $q.defer();
		 $http({
               method:'POST',
               url:'/isLoggedIn',
               data:JSON.stringify(inp)
           })
     		.success(function(response){
     				
     				q.resolve(response);
     			}).error(function (response) {
     				q.reject(response);
     				console.log('auth check failed');
     				console.log(response);
     			});
     	return q.promise;
	}
   

     	return {
     		isLoggedIn : function (inp) {
     			return isLoggedIn(inp);
     		}
     	};
});