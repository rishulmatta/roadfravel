roadFravel.factory('rf_fetchResults', function($http,$q) {

     var aggregationsRequired = true;

	function fetch (inp) {
          var validityFilterExist = false;

          for (var ii  in inp.appliedFilters) {
               if (inp.appliedFilters[ii].type == 'validitydate') {
                    validityFilterExist = true;
               }
          }

          if (!validityFilterExist) {
               inp.appliedFilters.push({type:'validitydate',value: {presentdate: new Date().getTime()}});
          }


		var q = $q.defer();
		 $http({
               method:'POST',
               url:'/fetch',
               params:{page:inp.page},
               data:JSON.stringify(inp)
           })
     		.success(function(response){
     				console.log(response);
     				q.resolve({data:response});
     			}).error(function (response) {
     				q.reject({data:response});
     				console.log('fetch failed');
     				console.log(response);
     			});
     	return q.promise;
	}
   

     	return {
     		fetchPool : function (inp) {
     			return fetch(inp);
     		},
               aggregationsRequired : aggregationsRequired
     	};
});