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
					icon: icon
				});

}

CustomMarker.prototype = new google.maps.Marker();


roadFravel.controller('HomeCtrl',function ($scope,rf_fetchResults) {
		$scope.name = "Rishul";
		$scope.clearMarker();  //this method is in global contrl it clears destination marker
		$scope.pools = [];
		markers = [];
		function drawAvailablePools (data) {
			var fetcedData,length,sourceMarker  ;
			
			fetcedData = data.data;
			length = fetcedData.length;

			if (length == 0) {
				return;
			}
			
			for (var ii = 0; ii < length; ++ii) {
				var obj = {
					type : fetcedData[ii]._source.vehicle,
					latLng: {
						lat:fetcedData[ii]._source.source.lat,
						lng:fetcedData[ii]._source.source.lon
					},
					profilePicUrl : fetcedData[ii]._source.profilePicUrl,
					name : fetcedData[ii]._source.name,
					email :fetcedData[ii]._source.email,
					planneddate : fetcedData[ii]._source.planneddate,
					profileUrl : fetcedData[ii]._source.profileUrl 

				};

				$scope.pools.push(obj);
				sourceMarker = new CustomMarker(obj);
				oms.addMarker(sourceMarker);
				markers.push(sourceMarker);

			}

			
		}
		
		var promise = rf_fetchResults.fetchPool();
		promise.then(drawAvailablePools);

	});


roadFravel.controller('OfferCtrl',function ($scope,rf_persistPool) {
		$scope.name = "Rishul";
		$scope.clearMarker(); 
		$scope.minDate = new Date();
		$scope.selDate = new Date();
		$scope.selTime = new Date();
		$scope.persistPool = function () {
			var inp = {
				source:$scope.locations.source.latLng,
				destination:$scope.locations.destination.latLng,
				creationdate: new Date(),
				planneddate:$scope.selDate,
				vehicle:$scope.selVehicleType
			}

			var prom = rf_persistPool.savePool(inp);
			prom.then(function () {
				console.log('persisted');
			});

		}
		   
	});


roadFravel.controller('GlobalCtrl',function ($scope) {
		$scope.name = "Rishul";
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
			intermediate : []
		};


		$scope.updateLocations = function (type,obj) {
			type = type.toLowerCase();
			$scope.locations[type] = obj;

			switch (type) {
				case 'source':
					sourceMarker.setPosition(obj.latLng);
					map.setCenter(obj.latLng);
					break;
				case 'destination':
					destinationMarker.setPosition(obj.latLng);
					break;
			}
		/*	bounds = new google.maps.LatLngBounds();
				
				 bounds.extend(sourceMarker.getPosition());

				 bounds.extend(sourceMarker.getPosition());
			

			map.fitBounds(bounds);  */


			
		}

		$scope.clearMarker = function () {
			var lenth;
			destinationMarker ? destinationMarker.setPosition(null) : null;

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


		var lat,lng,sourceMarker,destinationMarker,bounds;


		navigator.geolocation.getCurrentPosition(GetLocation);
		function GetLocation(location) {
				lat = location.coords.latitude;
				lng = location.coords.longitude;
				var latLng = {lat: lat, lng: lng};
				$scope.locations.source.latLng = latLng;
			function initMap() {
			
				map = new google.maps.Map(document.getElementById('map'), {
					center: latLng,
					zoom: 14,
					mapTypeControl:false,
					streetViewControl:false
				});

				map.addListener('idle',function() {
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
											vicinity:results[1].formatted_address 
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

				destinationMarker = new google.maps.Marker({
					map: map,
					title: 'Hello World!',
					icon: '/img/icons/stop.png'
				});

				oms = new OverlappingMarkerSpiderfier(map);
				var iw = new google.maps.InfoWindow();
				oms.addListener('click', function(marker, event) {
				  iw.setContent(marker.desc);
				  iw.open(map, marker);
				});


			}
			initMap();
	 	}
	});