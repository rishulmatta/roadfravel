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
				//dont change placeholders they have damn impact on these!
			var autocomplete = new google.maps.places.Autocomplete(element[0]);
				element.on('keyup',function () {
					console.log("user typed something");
					scope.resetMarkers(attr.markertype);
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
			   		

			   		scope.updateLocations(attr.markertype,obj); //this goes to global crl

			   		if ($state.$current.name == 'map.offer')  {

			   			scope.fetchPolyLine();
			   		}
			   		else 
			   		if ($state.$current.name == 'map.search'){ //this goes to search ctrl
			   			scope.applyFilter({type:attr.markertype.toLowerCase(),value : obj.latLng});
			   		}else 
			   		if ($state.$current.name == 'landing'){ //this goes to search ctrl
			   			$state.go("map.search");
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