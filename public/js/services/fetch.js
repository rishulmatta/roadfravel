roadFravel.factory('rf_fetchResults',["$http","$q", function($http,$q) {

     var aggregationsRequired = true;

	function fetch (inp) {
          var validityFilterExist , gtePresentDate;
          validityFilterExist = false;
          gtePresentDate = false;

          for (var ii  in inp.appliedFilters) {
               if (inp.appliedFilters[ii].type == 'validitydate') {
                    validityFilterExist = true;
               }

               if (inp.appliedFilters[ii].type == 'gtepresentdate') {
                    gtePresentDate = true;
               }
          }

          if (!validityFilterExist) {
               inp.appliedFilters.push({type:'validitydate',value: {presentdate: new Date().getTime()}});
          }

          if (!gtePresentDate) {
              // inp.appliedFilters.push({type:'gtepresentdate',value: {presentdate: new Date().getTime()}});
          }

		var q = $q.defer();
		 $http({
               method:'POST',
               url:'/fetch',
               params:{page:inp.page,pageSize:inp.pageSize},
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
}]);




roadFravel.factory('rf_fetchMyPools',["$http","$q", function($http,$q) {

    

     function fetch (inp) {
    


          var q = $q.defer();
           $http({
               method:'GET',
               url:'/fetch/mypools',
               params:{page:inp.page,pageSize:inp.pageSize},
               data:JSON.stringify(inp)
           })
               .success(function(response){
                         console.log(response);
                         q.resolve(response);
                    }).error(function (response) {
                         q.reject(response);
                         console.log('my pools fetch failed');
                         console.log(response);
                    });
          return q.promise;
     }
   

          return {
               fetchPool : function (inp) {
                    return fetch(inp);
               }
          };
}]);