roadFravel.factory('g_placesautocomplete', function($http,$q) {

	function getResultsFromService (inp) {
		var promise = $q.defer();
		 $http.get("https://maps.googleapis.com/maps/api/place/autocomplete/json?key=AIzaSyBab8wu7ql6hGAXF7MYmHN8-KL_xqOZvaw&input=" + inp)
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
});