polyLine = null;
destinationMarker = null;
sourceMarker = null;
function CustomMarker (obj) {

	var icon , marker;
	switch (obj.type) {
		case 'source' :
			icon = '/img/icons/source.png';
			break;
		case 'destination' :
			icon = '/img/icons/destination.png';
			break;
		case '2':
			icon = '/img/icons/bike.png';
			break;
		case '4':
			icon = '/img/icons/car.png';
			break;
		case 'need':
			icon = '/img/icons/need.png';
			break;
	}

	google.maps.Marker.call(this,{
					position: obj.latLng,
					map: map,
					title: 'Hello World!',
					icon: icon,
					animation: google.maps.Animation.DROP
				});

	this.index = obj.index;
	this.source = obj.source;
	this.destination = obj.destination;
	this.polyline = obj.polyLine;

}

CustomMarker.prototype = new google.maps.Marker();


function drawDestinationMarker (destination) {
	if (destinationMarker) {
		destinationMarker.setMap(null);
	}

	destinationMarker = new google.maps.Marker({
					position: destination,
					map: map,
					title: 'Hello World!',
					icon: '/img/icons/stop.png'
				});
}

function drawPolyLine (polyLinePoints) {
	if (polyLine) {
		polyLine.setMap(null);
	}

	polyLine = new google.maps.Polyline({
                path: polyLinePoints,
                strokeColor: '#00008B',
                strokeOpacity: 1.0,
                strokeWeight: 4,
                zIndex: 3
            });



	polyLine.setMap(map);
}

roadFravel.controller('MapCtrl',function ($scope,$state) { 
	var lat,lng,bounds;


		navigator.geolocation.getCurrentPosition(GetLocation);
		function GetLocation(location) {
				lat = location.coords.latitude;
				lng = location.coords.longitude;
				var latLng = {lat: lat, lng: lng};
				$scope.locations.source.latLng = latLng;
			function initMap() {
			
				map = new google.maps.Map(document.getElementById('map'), {
					center: latLng,
					zoom: 13,
					mapTypeControl:false,
					streetViewControl:false
				});

				map.addListener('idle',function() {
					if (!sourceRepositionReqd && $scope.locations.source.name != '' ) {
					
						return false;
					}
					latLng = {lat: map.getCenter().lat(), lng: map.getCenter().lng()};
					$scope.locations.source.latLng = latLng;
					$scope.locations.source.name = map.getCenter().lat();
					sourceMarker.setPosition(latLng);
					

					var geocoder;
					geocoder = new google.maps.Geocoder();
					var latlngObj = new google.maps.LatLng(latLng.lat, latLng.lng);

					geocoder.geocode(
					    {'latLng': latlngObj}, 
					    function(results, status) {
					        if (status == google.maps.GeocoderStatus.OK) {
					                if (results[0]) {
					                 
					                    var obj = {
											name:results[0].formatted_address,
											latLng:latLng,
											id:results[0].place_id,
											vicinity:results[1] ? results[1].formatted_address:null 
					                    }
					                
					                   
					                    $scope.locations.source = obj;
					                    $scope.$apply();
					                }
					                else  {
					                    console.log("address not found");
					                }
					        }
					         else {
					             console.log("Geocoder failed due to: " + status);
					        }
					    }
					);
				});

					sourceMarker = new google.maps.Marker({
						position: latLng,
						map: map,
						title: 'Hello World!',
						icon: '/img/icons/source.png'
					});
				
				
			

				oms = new OverlappingMarkerSpiderfier(map, {keepSpiderfied:true,markersWontMove: true, markersWontHide: true });
				var iw = new google.maps.InfoWindow();
				var clickedMarker,previousMarker;
				oms.addListener('click', function(marker, event) {
					var t;
						if (t) {
							clearTimeout(t);
				
						previousMarker.setAnimation(null);
						destinationMarker.setAnimation(null);
						}
						
					  iw.setContent(marker.desc);
					  iw.open(map, marker);
					  drawDestinationMarker(marker.destination);
		  			drawPolyLine(marker.polyline);
					var bounds = new google.maps.LatLngBounds();
					bounds.extend(marker.getPosition());
					bounds.extend(destinationMarker.getPosition());

					marker.setAnimation(google.maps.Animation.BOUNCE);
				 	destinationMarker.setAnimation(google.maps.Animation.BOUNCE);

					t = setTimeout(function () {
						marker.setAnimation(null);
						destinationMarker.setAnimation(null);
					},2000)
					map.fitBounds(bounds);
					previousMarker = marker;
				});


				oms.addListener('spiderfy', function(markers) {
					 iw.close();
					 var clickedMarker = arguments[2];
					 iw.setContent(clickedMarker.desc);
				 	 iw.open(map, clickedMarker);
				 	 new google.maps.event.trigger( clickedMarker, 'click' );
 					
				});


			}
			initMap();
			
	 	}

});

roadFravel.controller('SearchCtrl',function ($scope,rf_fetchResults) {
		var polyLine , polyLinePoints , appliedFilters;
		$scope.clearMarker();  //this method is in global contrl it clears destination marker
		$scope.pools = [];		
		
		$scope.filters = [];
		markers = [];
		
		
		appliedFilters = []; //tis array will contain the filters that the user has applied



		$scope.applyFilter = function (filterMeta) {
			if (filterMeta.checked) {
				appliedFilters.push( {
					type : filterMeta.type,
					value : filterMeta.value
				})
			}else {
				for (var ii in appliedFilters) {
					if (appliedFilters[ii].value == filterMeta.value && appliedFilters[ii].type == filterMeta.type) {
						appliedFilters.splice(ii,1);
						break;
					}
				}
			}
		

			fetchResults();
		}


		//this function iterates over the fetched results
		function drawAvailablePools (data) {
			var fetcedData,length,sourceMarker  ;
			var arrMarkerPositions = [];
			//each time when the result is fetched the old set of data has to be removed
			$scope.clearMarker ();
			$scope.pools = [];
			fetcedData = data.data.results;
			length = fetcedData.length;

			if (length == 0) {
				return;
			}
			
			for (var ii = 0; ii < length; ++ii) {
				fetcedData[ii]._source.source.latLng.lng = fetcedData[ii]._source.source.latLng.lon;
				delete fetcedData[ii]._source.source.latLng.lon;
				var obj = {
					type : fetcedData[ii]._source.vehicle,
					latLng: {
						lat:fetcedData[ii]._source.source.latLng.lat,
						lng:fetcedData[ii]._source.source.latLng.lng
					},
					profilePicUrl : fetcedData[ii]._source.profilePicUrl,
					name : fetcedData[ii]._source.name,
					email :fetcedData[ii]._source.email,
					planneddate : fetcedData[ii]._source.planneddate,
					profileUrl : fetcedData[ii]._source.profileUrl,
					index:ii,
					source :fetcedData[ii]._source.source,
					destination: {
						lat : fetcedData[ii]._source.destination.latLng.lat,
						lng : fetcedData[ii]._source.destination.latLng.lon
					},
					polyLine:fetcedData[ii]._source.polyline

				};

				$scope.pools.push(obj);
				sourceMarker = new CustomMarker(obj);				
				
				oms.addMarker(sourceMarker);
				markers.push(sourceMarker);
				arrMarkerPositions.push(sourceMarker.getPosition())
			

			}

			$scope.fitInAllMarkers(arrMarkerPositions);
			
			
		}

		function drawFilters (data) {
			var aggregations ;

			aggregations = data.data.aggregations;

			for (var filter in aggregations) {
					$scope.filters.push ({
						title : filter,
						values : aggregations[filter].buckets
					});
			}


 		}

 		function fetchResults() {
			var promise = rf_fetchResults.fetchPool({appliedFilters:appliedFilters,filtersReqd : $scope.filters.length > 0 ? false:true});
			promise.then(drawAvailablePools);
			promise.then(drawFilters);

		}

		

		
		setTimeout(fetchResults,1000);

		$scope.searchListItemClicked = function (index) {
			var promise;
			
			google.maps.event.trigger(markers[index], 'click');
			//map.setCenter(markers[index].latLng);
			
		}

	});


roadFravel.controller('OfferCtrl',function ($scope,rf_persistPool) {
		
		$scope.clearMarker(); 
		
		$scope.minDate = new Date();
		$scope.selDate = new Date();
		$scope.selTime = new Date();
		var vehicleTypeValue;
		//this function is called to persist pool to elastic search
		$scope.persistPool = function () {
			var inp = {
				source:$scope.locations.source,
				destination:$scope.locations.destination,
				creationdate: new Date(),
				planneddate:$scope.selDate,
				vehicle:vehicleTypeValue,
				polyline:$scope.locations.polyline
			}

			var prom = rf_persistPool.savePool(inp);
			prom.then(function () {
				console.log('persisted');
			});

		}

		$scope.changeVehicleType = function (arg) {
			vehicleTypeValue = arg.value;
		}


		$scope.vehicleTypes = [{
		   value: '2',
		   label: 'Bike'
		 }, {
		   value: '4',
		   label: 'Car'
		 }];  
		/*-- code for date picker --*/
		$scope.today = function() {
		   $scope.dt = new Date();
		 };
		 $scope.today();

		 $scope.clear = function() {
		   $scope.dt = null;
		 };

		 $scope.inlineOptions = {
		   customClass: getDayClass,
		   minDate: new Date(),
		   showWeeks: true
		 };

		 $scope.dateOptions = {
		  
		   formatYear: 'yy',
		   maxDate: new Date(2020, 5, 22),
		   minDate: new Date(),
		   startingDay: 1
		 };

		

		

		 $scope.open1 = function() {
		   $scope.popup1.opened = true;
		 };

	
		 $scope.setDate = function(year, month, day) {
		   $scope.dt = new Date(year, month, day);
		 };

		 $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
		 $scope.format = $scope.formats[0];
		 $scope.altInputFormats = ['M!/d!/yyyy'];

		 $scope.popup1 = {
		   opened: false
		 };

	

		 var tomorrow = new Date();
		 tomorrow.setDate(tomorrow.getDate() + 1);
		 var afterTomorrow = new Date();
		 afterTomorrow.setDate(tomorrow.getDate() + 1);
		 $scope.events = [
		   {
		     date: tomorrow,
		     status: 'full'
		   },
		   {
		     date: afterTomorrow,
		     status: 'partially'
		   }
		 ];

		 function getDayClass(data) {
		   var date = data.date,
		     mode = data.mode;
		   if (mode === 'day') {
		     var dayToCheck = new Date(date).setHours(0,0,0,0);

		     for (var i = 0; i < $scope.events.length; i++) {
		       var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

		       if (dayToCheck === currentDay) {
		         return $scope.events[i].status;
		       }
		     }
		   }

		   return '';
		 }

		   /*-- code for date picker  END--*/
	});


roadFravel.controller('GlobalCtrl',function ($scope,g_direction) {
		
		$scope.locations = {
			source :{
				name:"",
				latLng:{},
				id:"",
				vicinity:""
			},
			destination :{
				name:"",
				latLng:{},
				id:"",
				vicinity:""
			},
			intermediate : [] ,
			polyline :""
		};



		 	$scope.fitInAllMarkers = function (arrMarkerPositions) {
			 			var bounds = new google.maps.LatLngBounds();

			 			if (arrMarkerPositions) {
		 					for (var pos in arrMarkerPositions) {
			 					bounds.extend(arrMarkerPositions[pos]);
		 					}

			 			}else {
			 				bounds.extend(sourceMarker.getPosition());
			 				if (destinationMarker) {
			 					bounds.extend(destinationMarker.getPosition());
			 				}
			 				
			 			}
			 			
			 			map.fitBounds(bounds);


			 	}


		$scope.fetchPolyLine = function () {

			if ($scope.locations.source.id && $scope.locations.destination.id) {
				var req = {
					source : $scope.locations.source.id,
					destination : $scope.locations.destination.id
				}

				promise = g_direction.getDirection(req);
				promise.then(function (data) {
					var res = JSON.parse(data.body);
					console.log(res);
					polyLinePoints = google.maps.geometry.encoding.decodePath(res.routes[0].overview_polyline.points);

					$scope.locations.polyline = polyLinePoints;

					drawPolyLine(polyLinePoints);

					//map.fitBounds(bounds);
				});
			}
		}

		$scope.updateLocations = function (type,obj) {
			type = type.toLowerCase();
			$scope.locations[type] = obj;

			switch (type) {
				case 'source':
					sourceMarker.setPosition(obj.latLng);
					map.setCenter(obj.latLng);
					$scope.fitInAllMarkers();
					break;
				case 'destination':

					destinationMarker ? destinationMarker.setPosition(obj.latLng) : drawDestinationMarker(obj.latLng);
					
					$scope.fitInAllMarkers();
					map.panBy(200,0);
					map.setZoom(map.zoom - 1);
					break;

				

			}
		


			
		}

		$scope.clearMarker = function () {
			var lenth;
			destinationMarker ? destinationMarker.setPosition(null) : null;

			if (polyLine) {
				polyLine.setMap(null);
			}

			if (destinationMarker) {
				destinationMarker.setMap(null);
			}

		
			if (typeof markers == 'undefined') {
				return;
			}
			length = markers.length;
			if (length > 0) {
				markers.forEach(function (marker) {
					marker.setMap(null);
				});
				markers = [];
			}
		}

		//shift this event to appear only on landing page
		$(window).on('mousewheel',function(event) {
			var navElement = $("nav.navbar.navbar-default");
			//navElement = navElement.length > 0 ?  navElement.addClass("navbar-fixed-top"):navElement.removeClass("navbar-fixed-top");			
			//window.scrollY > 5  ? navElement.addClass("navbar-fixed-top") : undefined;


			if (navElement.hasClass("navbar-fixed-top") &&  window.scrollY <= 1) {
				navElement.removeClass("navbar-fixed-top");
				
			}else {
				if (window.scrollY > 1) {
					navElement.addClass("navbar-fixed-top");
				}
				
			}
		});
		
	});


roadFravel.controller('LandingCtrl',function ($scope) { 


});