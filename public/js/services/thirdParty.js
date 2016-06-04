roadFravel.factory('g_placesautocomplete', ["$http","$q",function($http,$q) {

	function getResultsFromService (inp) {
		var promise = $q.defer();
		 $http.get("https://maps.googleapis.com/maps/api/place/autocomplete/json?key="+googleBrowserKey+"&input=" + inp)
     		.success(function(response){
     				console.log(response);
     				promise.resolve({data:response});
     			}).error(function (response) {
     				promise.reject({data:response});
     				console.log('auto complete failed');
     				console.log(response);
     			});
     	return promise;
	}
   

     	return {
     		getResults : function (inp) {
     			return getResultsFromService(inp);
     		}
     	};
}]);


roadFravel.factory('g_direction',["$http","$q", function($http,$q) {

     function getDirectionFromService (inp) {
          var q = $q.defer();
           $http.post("/directions",JSON.stringify(inp))
               .success(function(response){
                        
                         q.resolve(response);
                    }).error(function (response) {
                         q.reject({data:response});
                         console.log('directions failed');
                         console.log(response);
                    });
          return q.promise;
     }
   

          return {
               getDirection : function (inp) {
                    return getDirectionFromService(inp);
               }
          };
}]);