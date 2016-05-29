roadFravel.directive('gPlaces',["g_placesautocomplete",function (autocomplete) {
		return {
			restrict : 'A',
			require : 'ngModel',
			link : function (scope ,element ,attr, ngModelCtrl) {
				var a = 0;
			}
		}
	}]);

roadFravel.directive('gAutoComplete',["$state",function ($state) {
		return {
			restrict : 'A',
			scope:true,
			link : function (scope ,element ,attr) {
				
			var autocomplete = new google.maps.places.Autocomplete(element[0]);
				element.on('keyup',function () {
					console.log("user typed something");
					scope.resetMarkers(attr.placeholder);
				});

			   autocomplete.addListener('place_changed', function() { 
			   		var place , name ,id , latLng , vicinity;
			   		
			   		place = autocomplete.getPlace();

			   		var obj = {
			   			name :place.name,
				   		id :place.place_id,
				   		vicinity :place.vicinity,
				   		latLng :{
				   			lat:place.geometry.location.lat(),
				   			lng:place.geometry.location.lng()
				   		}
			   		};
			   		

			   		scope.updateLocations(attr.placeholder,obj);
			   		if ($state.$current.name != 'map.search')  {

			   			scope.fetchPolyLine();
			   		}
			   		if (scope.applyFilter) { //this checks if the user is in search route have to change this
			   			scope.applyFilter({type:attr.placeholder.toLowerCase(),value : obj.latLng});
			   		}
			   });
			}
		}
	}]);


roadFravel.directive('rFilters',["rf_fetchResults",function (rf_fetchResults) {
		return {
			restrict : 'A',
			scope:{
				title:"@",
				values:"=",
				apply:"&"
			},
			transclude:true,
			templateUrl:"partials/d_filter",
			link : function (scope ,element ,attr) {
				
			   scope.filterClicked = function (event) {
			   	event.stopPropagation();
		  		rf_fetchResults.aggregationsRequired = false;
			   	scope.apply({filterMeta :{
			   		type:scope.title,
			   		value:event.currentTarget.id,
			   		checked : event.target.checked,
			   		page:scope.page
			   	}})
			   }
			}
		}
	}]);