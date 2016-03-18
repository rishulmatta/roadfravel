roadFravel.directive('gPlaces',["g_placesautocomplete",function (autocomplete) {
		return {
			restrict : 'A',
			require : 'ngModel',
			link : function (scope ,element ,attr, ngModelCtrl) {
				var a = 0;
			}
		}
	}]);

roadFravel.directive('gAutoComplete',[function () {
		return {
			restrict : 'A',
			scope:true,
			link : function (scope ,element ,attr) {
				
			var autocomplete = new google.maps.places.Autocomplete(element[0]);
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
			   		scope.fetchPolyLine();
			   });
			}
		}
	}]);


roadFravel.directive('rFilters',[function () {
		return {
			restrict : 'A',
			scope:{
				title:"@",
				values:"=",
				apply:"&"

			},
			transclude:true,
			templateUrl:"partials/filter",
			link : function (scope ,element ,attr) {
				
			   scope.filterClicked = function (event) {
			   	event.stopPropagation();
			   	scope.apply({filterMeta :{
			   		title:scope.title,
			   		key:event.currentTarget.id
			   	}})
			   }
			}
		}
	}]);