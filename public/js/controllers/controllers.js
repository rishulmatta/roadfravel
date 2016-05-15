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
		case 2:
			icon = '/img/icons/bike.png';
			break;
		case 4:
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

roadFravel.controller('MapCtrl',function ($scope,$state,$q) { 
	 var lat,lng, bounds;
	resultsFetched = false;

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

			/*	map.addListener('idle',function() {
					if (!resultsFetched) {
					
						return false;
					}
					latLng = {lat: map.getCenter().lat(), lng: map.getCenter().lng()};
					$scope.locations.source.latLng = latLng;
					
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
				});*/

					sourceMarker = new google.maps.Marker({
						position: latLng,
						map: map,
						title: 'Hello World!',
						icon: '/img/icons/source.png'
					});
				
				var prom = getTheNameFromLatLng(latLng);
				prom.then(function (obj) {
					$scope.locations.source = obj;
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


	 	function getTheNameFromLatLng(latLng) {
	 		var geocoder;
					geocoder = new google.maps.Geocoder();
					var latlngObj = new google.maps.LatLng(latLng.lat, latLng.lng);
					var defered = $q.defer();
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
					                
					                   
					                    defered.resolve(obj);
					                    
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
			return defered.promise
	 	}


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

roadFravel.controller('SearchCtrl',function ($scope,rf_fetchResults,toastr) {
		var polyLine , polyLinePoints , appliedFilters;
		$scope.clearMarker();  //this method is in global contrl it clears destination marker
		$scope.pools = [];		
		$scope.searchDate = {
			selDate :null
		};
		
		$scope.filters = [];
		markers = [];
		
		
		appliedFilters = []; //tis array will contain the filters that the user has applied

		/*$scope.locationChanged = function (name) {
			if (name == 'source') {
				$scope.applyFilter({type:'source'});
			}
		} */

		$scope.applyFilter = function (filters) {

			function removeFromFilters(type) {
				//this function checks for types and removes the applied filter.
				for (var ii in appliedFilters) {
					if (appliedFilters[ii].type == type) {
						appliedFilters.splice(ii,1);
						break;
					}
				}
			} 

			function filterLogic(filterMeta) {
				if (filterMeta.type == 'vehicle' || filterMeta.type == 'iseven') {
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
				}

				if (filterMeta.type == 'planneddate') {
					removeFromFilters(filterMeta.type);
					if (filterMeta.value.from) {
						appliedFilters.push(filterMeta);
					}
						
					
				}

				if (filterMeta.type == 'source' || filterMeta.type == 'destination') {
					removeFromFilters(filterMeta.type);
					appliedFilters.push(filterMeta);
				}


				if (filterMeta.type == 'validitydate') {
					removeFromFilters(filterMeta.type);
					appliedFilters.push(filterMeta);
				}
			}


			if (typeof filters.length != "undefined") {
				for (var ii in filters) {
					filterLogic(filters[ii]);
				}
			}else {
				filterLogic(filters);
			}
			

			
		

			fetchResults();
		}


		//this function iterates over the fetched results
		function drawAvailablePools (data) {
			var fetcedData,length,sourceMarker  ;
			var arrMarkerPositions = [];
			resultsFetched = true; //this is a global variable which decides when the source marker should reposition
			//each time when the result is fetched the old set of data has to be removed
			$scope.clearMarker ();
			$scope.pools = [];
			if (data.data.statusCode) {
				return;
			}
			fetcedData = data.data.results;
			length = fetcedData.length;

			if (length == 0) {
				toastr.info('Please try clearing the filters or changing the Source', 'No Results Found');
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
			if (!rf_fetchResults.aggregationsRequired) {
				return;
			}else {
				$scope.filters = [];
			}

			aggregations = data.data.aggregations;

			for (var filter in aggregations) {
					$scope.filters.push ({
						title : filter,
						values : aggregations[filter].buckets,
						uiValue : aggregations[filter].uiValue
					});
			}


 		}

 		function fetchResults() {
 			var recurtype = null;
 			if ($scope.searchDate.selDate ) {
 				var day = $scope.searchDate.selDate.getDay();
 				if (day >0 && day < 6) {
 					recurtype = "wd";
 				}
 				else {
 					recurtype = "we";
 				}
 			}
 			 

			var promise = rf_fetchResults.fetchPool({appliedFilters:appliedFilters,filtersReqd : rf_fetchResults.aggregationsRequired,postQueryFilter: recurtype ? [{value:recurtype,type:"recurtype"}]:undefined});
			promise.then(drawAvailablePools);
			promise.then(drawFilters);

		}

		

		
		setTimeout(function() {
			$scope.applyFilter([{type:'source',value: {lat:$scope.locations.source.latLng.lat , lng:$scope.locations.source.latLng.lng}}]);
		},1000);

		$scope.searchListItemClicked = function (index) {
			var promise;
			
			google.maps.event.trigger(markers[index], 'click');
			//map.setCenter(markers[index].latLng);
			
		}

		$scope.dateChanged = function () {
			rf_fetchResults.aggregationsRequired = true;
			var minDate,maxDate,type,selectedDate;
			type = "planneddate";
			if ($scope.searchDate.selDate) {



				minDate = $scope.searchDate.selDate.getTime();

				selectedDate =  new Date(minDate);
				maxDate = selectedDate.setDate(parseInt($scope.searchDate.selDate.getDate()) + 1);
			}else {
				minDate = null;
				maxDate = null;
			}

			$scope.applyFilter([{
				type:type,
				value : {from:minDate,
						to : maxDate
					}
			},{type:'validitydate',value: {presentdate: minDate}}]);

		}

	});


roadFravel.controller('OfferCtrl',function ($scope,rf_persistPool) {
		
		$scope.clearMarker(); 

		var todaysDate = new Date();

		$scope.vehicleInfo = {
			registrationnumber:null,
			description:null,
			type : null
		};

		$scope.tripInfo = {
			cost:null
		};

		$scope.poolInfo = {
			isOneTime:null,
			dateAndTime : {
				selDate :null,
				selTime : todaysDate
			},
			validityDate: null,
			recurType :null
		};

		$scope.minDate = todaysDate;
		//$scope.selDate = new Date();
		//$scope.selTime = new Date();
		var vehicleTypeValue;

		function generateDateAndTime () {
			var milliSeconds;
			$scope.poolInfo.dateAndTime.selDate.setHours($scope.poolInfo.dateAndTime.selTime.getHours());
			$scope.poolInfo.dateAndTime.selDate.setMinutes($scope.poolInfo.dateAndTime.selTime.getMinutes());
			$scope.poolInfo.dateAndTime.selDate.setSeconds("0");
			$scope.poolInfo.dateAndTime.selDate.setMilliseconds("0");


			milliSeconds = $scope.poolInfo.dateAndTime.selDate.getTime();

			return milliSeconds;
		}

		//this function is called to persist pool to elastic search
		$scope.persistPool = function () {
			var inp = {
				source:$scope.locations.source,
				destination:$scope.locations.destination,
				creationdate: new Date().getTime(),
				planneddate: $scope.poolInfo.dateAndTime.selDate ? generateDateAndTime():null,
				vehicle:$scope.vehicleInfo.type.value,
				polyline:$scope.locations.polyline,
				description:$scope.vehicleInfo.description,
				registrationnumber : $scope.vehicleInfo.registrationnumber,
				iseven : $scope.vehicleInfo.registrationnumber % 2 == 0 ? true : false,
				cost:$scope.tripInfo.cost || 0,
				recurtype : $scope.poolInfo.recurType || "all",
				validitydate : $scope.poolInfo.validityDate ? $scope.poolInfo.validityDate.getTime() : null
			}

			var prom = rf_persistPool.savePool(inp);
			prom.then(function () {
				console.log('persisted');
			});

		}



		$scope.vehicleTypes = [{
		   value: 2,
		   label: 'Bike'
		 }, {
		   value: 4,
		   label: 'Car'
		 }];  
		




		   /* --   code for time picker --*/
		   $scope.mytime = new Date();

		  $scope.hstep = 1;
		  $scope.mstep = 15;








     /* --   code for time picker END --*/
	});


roadFravel.controller('GlobalCtrl',function ($scope,g_direction,rf_fetchResults) {
		
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
			 				
			 				if (destinationMarker && destinationMarker.getPosition()) {
			 					bounds.extend(destinationMarker.getPosition());
			 				}
			 				
			 			}
			 			bounds.extend(sourceMarker.getPosition());
			 			map.fitBounds(bounds);

			 			setTimeout(function() { 
			 				map.setZoom(map.zoom - 2);
			 			},1000) 


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
			rf_fetchResults.aggregationsRequired = true;

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