polyLine = null;
destinationMarker = null;
sourceMarker = null;

function getInfoWindowTemplate(obj) {
	var mainTemplate, templateObj,timetemplate;

	mainTemplate = '<div class="info-window-container">     <div class="my-places-meta">     <div><b>Source :  </b> <span>{{source}}</span> </div>     <div><b>Destination : </b> <span>{{destination}}</span> </div>   </div>   <div class="well">{{timetemplate}}</div> <div class="my-places-meta">   <div class="info-window-reg-nos"><b>Registration nos :</b> {{registrationnumber}}</div>  <div class="info-window-charge"><b>Charge : </b>{{cost}}</div> </div> <div class="info-window-description"><em>{{description}}</em></div> </div>';
	templateObj = getTemplateType(obj);

	switch (templateObj.template) {
		case "lookingonce": 
			timetemplate = "<div><a href = '{{profileUrl}}' target = '_blank'>{{name}}</a> is looking for a pool on <b>{{date}} </b>at <b>{{time}}</b></div>";
			break;

		case "once":
			timetemplate = "<div><a href = '{{profileUrl}}' target = '_blank' >{{name}}</a> has offered a <b>{{vehicle}} </b>wheeler on <b>{{date}} </b>at <b>{{time}}</b></div>";
			break;

		case "lookingrecur": 
			timetemplate = "<div><a href = '{{profileUrl}}' target = '_blank' >{{name}}</a> is looking for a pool on <b>{{frequency}} </b>valid upto <b>{{validityDate}}</b></div>";
			break;

		case "recur" :
			timetemplate = "<div><a href = '{{profileUrl}}' target = '_blank'>{{name}}</a> has offered a recurring pool of <b>{{vehicle}} </b>wheeler on <b>{{frequency}} </b>valid upto <b>{{validityDate}}</b></div>";
			break;
	}

	mainTemplate = mainTemplate.replace(/{{timetemplate}}/,timetemplate);

	//extra properties added
	templateObj.vehicle = obj.vehicle;
	templateObj.description = obj.description ? obj.description: "Click on the name link to open the profile and ask more about this offering.";
	templateObj.registrationnumber = obj.registrationnumber ? obj.registrationnumber: "Contact the user for details";
	templateObj.name = obj.name;
	templateObj.profilePicUrl = obj.profilePicUrl;
	templateObj.profileUrl = obj.profileUrl;
	templateObj.cost = obj.cost ? obj.cost : "It is free yay!";

	for (var prop in templateObj) {
		mainTemplate = mainTemplate.replace("{{"+prop+"}}",templateObj[prop])
	}

	return mainTemplate;


}


function getTemplateType(info) {
				var obj =  {
					source:info.source.name,
					destination:info.destination.name,
					vehicle:info.vehicle,
					description:info.description,
					id:info.id
				}

				if (info.recurtype == 'all') {
					obj.date = new Date(info.planneddate).getFormattedDate();
					obj.time = new Date(info.planneddate).getFormattedTime();
					obj.disabled = new Date().getTime() > info.planneddate ? true:false;
					obj.template = obj.vehicle == 0 ? "lookingonce": "once";
				}else 
				if (info.recurtype == 'wd' || info.recurtype == 'we' ) {
					obj.frequency = info.recurtype == 'wd' ? "weekdays": "weekends";
					obj.validityDate = new Date(info.validitydate).getFormattedDate();
					obj.disabled = new Date().getTime() > info.validitydate ? true:false;
					obj.template = obj.vehicle == 0 ? "lookingrecur": "recur";	
				}
				obj.active = false;

				return obj;
			}


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
		case 0: //this means that person need the pool
			icon = '/img/icons/need.png';
			break;
	}

	google.maps.Marker.call(this,{
					position: obj.source.latLng,
					map: map,
					title: 'From ' + obj.source.name + " to " + obj.destination.name,
					icon: icon,
					animation: google.maps.Animation.DROP
				});

	this.index = obj.index;
	this.source = obj.source;
	this.destination = obj.destination;
	this.polyline = obj.polyLine;
	this.vehicle = obj.type;
	this.description = obj.description;
	this.planneddate = obj.planneddate;
	this.recurtype = obj.recurtype;
	this.validitydate = obj.validitydate;
	this.registrationnumber = obj.registrationnumber;
	this.name = obj.name;
	this.profilePicUrl = obj.profilePicUrl;
	this.profileUrl = obj.profileUrl;
	this.cost = obj.cost;
	



}

onLoad = function () {
	
CustomMarker.prototype = new google.maps.Marker();
}



function drawDestinationMarker (destination) {
	if (destinationMarker) {
		destinationMarker.setMap(null);
	}

	destinationMarker = new google.maps.Marker({
					position: destination.latLng,
					map: map,
					title: destination.name,
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


Date.prototype.getFormattedDate = function () {


	var monthNames = [
	  "Jan", "Feb", "Mar",
	  "Apr", "May", "Jun", "Jul",
	  "Aug", "Sep", "Oct",
	  "Nov", "Dec"
	];

	
	var day = this.getDate();
	var monthIndex = this.getMonth();
	var year = this.getFullYear().toString().substring(2);

	return day + '-' + monthNames[monthIndex] + '-' + year;
}

Date.prototype.getFormattedTime = function () {

	var medidian , hours , minutes;

	hours = this.getHours();

	meridian = hours >= 12 ? "PM" : "AM";

	hours = hours > 12 ? hours - 12 : 12;
	hours = hours > 9 ? hours : "0" + hours;

	minutes = this.getMinutes() > 9 ?  this.getMinutes() : "0"+this.getMinutes() 
	console.log(hours);
	console.log(minutes);
	


	return hours + ':' + minutes+ ' ' + meridian;
}


roadFravel.controller('MapCtrl',["$scope","$state","$q","$timeout",function ($scope,$state,$q,$timeout) { 
	 var lat,lng, bounds;
	resultsFetched = false;


	//google.maps.event.addDomListener(window, 'load', initialize);
	//for using geolocation api the protocol must be https which sucks! as i got to know this after moving into prod
	$timeout(initialize,1);

	function initialize () {
		var latLng;
		latLng = navigator.geolocation.getCurrentPosition(GetLocation,geoError);

	}

	function geoError () {
		initMap({lat:12.9715987,lng:77.5945627});
	}

		
			function initMap(latLng) {
			
				map = new google.maps.Map(document.getElementById('map'), {
					center: latLng,
					mapTypeControl:false,
					streetViewControl:false,
					 zoom: 10,
					 maxZoom:15,
					 zoomControl:false
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
					

					  iw.setContent(getInfoWindowTemplate(marker));
					  iw.open(map, marker);
					  drawDestinationMarker(marker.destination);
		  			drawPolyLine(marker.polyline);
					var bounds = new google.maps.LatLngBounds();
					//bounds.extend(marker.getPosition());
					//bounds.extend(destinationMarker.getPosition());
					map.setCenter(marker.source.latLng)

					marker.setAnimation(google.maps.Animation.BOUNCE);
				 	destinationMarker.setAnimation(google.maps.Animation.BOUNCE);

					t = setTimeout(function () {
						marker.setAnimation(null);
						destinationMarker.setAnimation(null);
					},2000)
					//map.fitBounds(bounds);
					previousMarker = marker;
					$scope.setSelectedSearch(marker.index);
					$scope.$apply();
				});


				oms.addListener('spiderfy', function(markers) {
					 iw.close();
					 var clickedMarker = arguments[2];
					 //new google.maps.event.trigger( clickedMarker, 'click' );
						
				});


			}

		function GetLocation(location) {
				lat = location.coords.latitude;
				lng = location.coords.longitude;
				var latLng = {lat: lat, lng: lng};
				$scope.locations.source.latLng = latLng;
				initMap(latLng);
				return latLng;
			
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
	    //minDate: new Date(),
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


	    //for icon selection

	    $scope.selectedSearchItem = undefined;

	    $scope.setSelectedSearch = function (val) {
	    		$scope.selectedSearchItem = val;
	    }

}]);

roadFravel.controller('SearchCtrl',["$scope","rf_fetchResults","toastr","$timeout",function ($scope,rf_fetchResults,toastr,$timeout) {
		var polyLine , polyLinePoints , appliedFilters , proximity;
		$scope.clearMarker(true);  //this method is in global contrl it clears destination marker
		$scope.pools = [];		
		$scope.currentPage = 1;
		$scope.itemsPerPage = Math.floor(screen.width/200);
		$scope.searchDate = {
			selDate :null
		};

		$scope.setActiveNav("pool");

		proximity = 10;

		$scope.slider = {
		  value: 10,
		  options: {
		    floor: 5,
		    ceil: 100,
		    step:5,
		    onEnd: sliderEnd
		  }
		};
		
		$scope.filters = [];
		markers = [];
		

		function sliderEnd(sliderId, modelValue, highValue) {
			if (!$scope.locations.source) {
				return;
			}
			proximity = modelValue;
			$scope.applyFilter({type:'source',value: {lat:$scope.locations.source.latLng.lat , lng:$scope.locations.source.latLng.lng,proximity:proximity+"km"}});

		}
		
		appliedFilters = []; //tis array will contain the filters that the user has applied

		/*$scope.locationChanged = function (name) {
			if (name == 'source') {
				$scope.applyFilter({type:'source'});
			}
		} */

		$scope.pageChanged = function () {
			//invoked during pagination
			fetchResults();

		}

     //for collapsable sidebar
     var width = 310;
		$scope.height = window.screen.availHeight/2 ;
		$scope.isExpanded = true;
		$scope.left = width;
		$scope.toggle = function () {
					$scope.isExpanded  = !$scope.isExpanded;
					$scope.left = $scope.isExpanded ? width : 5;
				}

		 //for collapsable sidebar ends

		$scope.applyFilter = function (filters) {
			$scope.currentPage = 1;
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
				//this function deals with applying all the filters 
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
					if (filterMeta.value.lat) {
						appliedFilters.push(filterMeta);
					}
					
					
				}


				if (filterMeta.type == 'validitydate') {
					removeFromFilters(filterMeta.type);
					filterMeta.value.presentdate  ? appliedFilters.push(filterMeta) : null;
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
			var fetcedData,length,sourceMarker,time,date  ;
			var arrMarkerPositions = [];
			resultsFetched = true; //this is a global variable which decides when the source marker should reposition
			//each time when the result is fetched the old set of data has to be removed
			$scope.clearMarker (false);

			$scope.pools = [];
			if (!data.data.results) {
				return;
			}
			
			fetcedData = data.data.results;
			length = fetcedData.length;

			if (length == 0) {
				toastr.info('Please try clearing the filters or changing the Source', 'No Results Found');
				return;
			}
			
			$scope.totalItems = data.data.resultMeta.total;
			for (var ii = 0; ii < length; ++ii) {
				fetcedData[ii]._source.source.latLng.lng = fetcedData[ii]._source.source.latLng.lon;
				fetcedData[ii]._source.destination.latLng.lng = fetcedData[ii]._source.destination.latLng.lon;
				delete fetcedData[ii]._source.source.latLng.lon;
				delete fetcedData[ii]._source.destination.latLng.lon;
				if (fetcedData[ii]._source.recurtype == 'wd') {
					time = "Weekdays";
				}
				else 
					if (fetcedData[ii]._source.recurtype == 'we') {
						time = "Weekends";
					}
					else {
						var fetchedDate = new Date(fetcedData[ii]._source.planneddate);
						date = fetchedDate.getFormattedDate();
						time = fetchedDate.getFormattedTime();
					}

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
					destination: fetcedData[ii]._source.destination,
					polyLine:fetcedData[ii]._source.polyline,
					registrationnumber:fetcedData[ii]._source.registrationnumber,
					description : fetcedData[ii]._source.description,
					cost :fetcedData[ii]._source.cost,
					time : time,
					date : date,
					recurtype:fetcedData[ii]._source.recurtype,
					validitydate:fetcedData[ii]._source.validitydate

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
 			 

			var promise = rf_fetchResults.fetchPool({appliedFilters:appliedFilters,filtersReqd : rf_fetchResults.aggregationsRequired,postQueryFilter: recurtype ? [{value:recurtype,type:"recurtype"}]:undefined,page:$scope.currentPage,pageSize:$scope.itemsPerPage});
			promise.then(drawAvailablePools);
			promise.then(drawFilters);

				$scope.setSelectedSearch(undefined);


		}

		

		
		$timeout(function() {
			//this is the default set of filter which is sent on the page load there are others in the service definitioon ie inside this call
			$scope.applyFilter([{type:'source',value: {lat:$scope.locations.source.latLng.lat , lng:$scope.locations.source.latLng.lng,proximity:proximity+"km"}}]);

		},1000);

		$scope.searchListItemClicked = function (index) {
			var promise;

				$scope.setSelectedSearch(index);


			
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

			//here two fileters are being sent because one is for the one time pools i.e. plannedate and the other is for recurring pools that depend on validity date i.e. to recur uptil what date
			$scope.applyFilter([{
				type:type,
				value : {from:minDate,
						to : maxDate
					}
			},{type:'validitydate',value: {presentdate: minDate}}]);

		}

	}]);


roadFravel.controller('OfferCtrl',["$scope","rf_persistPool","rf_auth","$uibModal","$state","$timeout","$interval","$state",function ($scope,rf_persistPool,rf_auth,$uibModal,$state,$timeout,$interval,$state) {
		
		var todaysDate,authProm;
		$scope.clearMarker(true); 
		$scope.timer = 5;
		todaysDate = new Date();

		$scope.setActiveNav("offer");

		authProm = rf_auth.isLoggedIn();
		authProm.then(function (res) {
			if (!res.isLoggedIn) {


				
				var modalInstance = $uibModal.open({
				     animation: true,
				     templateUrl: 'partials/loginModal',
				     scope:$scope,
				     //controller: 'ModalInstanceCtrl',
				    keyboard :false,
				    backdrop :"static"
				   });

				$timeout(function() {
					$state.go("login");
				},5000)

				$interval(function () {
					$scope.timer--;
				},1000)
			}
		});

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
			recurType :null,
			isClassified: false
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
		//if the person is looking for the pool then we pass vehicle type as 0
		$scope.persistPool = function () {
			var inp = {
				source:$scope.locations.source,
				destination:$scope.locations.destination,
				creationdate: new Date().getTime(),
				planneddate: $scope.poolInfo.dateAndTime.selDate ? generateDateAndTime():null,
				vehicle:$scope.poolInfo.isClassified ? 0 : $scope.vehicleInfo.type.value,
				polyline:$scope.locations.polyline,
				description:$scope.vehicleInfo.description,
				registrationnumber : $scope.vehicleInfo.registrationnumber,
				iseven : $scope.vehicleInfo.registrationnumber % 2 == 0 ? true : false,
				cost:$scope.tripInfo.cost || 0,
				recurtype : $scope.poolInfo.recurType || "all",
				validitydate : $scope.poolInfo.validityDate ? $scope.poolInfo.validityDate.getTime() : generateDateAndTime()
			}

			var prom = rf_persistPool.savePool(inp);
			prom.then(function () {
				console.log('persisted');
				$state.go("map.search");
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
	}]);


roadFravel.controller('GlobalCtrl',["$scope","g_direction","rf_fetchResults",function ($scope,g_direction,rf_fetchResults) {
		
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

		$scope.setActiveNav = function (val) {
			$scope.activeNav = val;
		}

		


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

			 			//this might not be required
			 			/*setTimeout(function() { 
			 				map.setZoom(map.zoom - 2);
			 			},1000) */


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

		$scope.resetMarkers = function (type) {
			type = type.toLowerCase();
			switch (type) {
				case 'source':

					$scope.locations.source = {
																		name:"",
																		latLng:{},
																		id:"",
																		vicinity:""
																	};
					break;
				case 'destination':

				$scope.locations.destination = {
																	name:"",
																	latLng:{},
																	id:"",
																	vicinity:""
																};
					
					break;

			}
		}

		$scope.updateLocations = function (type,obj) {
			type = type.toLowerCase();
			$scope.locations[type] = obj;
			rf_fetchResults.aggregationsRequired = true;

			switch (type) {
				case 'source':
					sourceMarker ? sourceMarker.setPosition(obj.latLng) : null;
					map.setCenter(obj.latLng);
					$scope.fitInAllMarkers();
					break;
				case 'destination':

					destinationMarker ? destinationMarker.setPosition(obj.latLng) : drawDestinationMarker(obj);
					
					$scope.fitInAllMarkers();
					
					break;

			}
			
		}

		$scope.clearMarker = function (clearDestinationMarker) {
			var lenth;

			if (polyLine) {
				polyLine.setMap(null);
			}

			if (destinationMarker && clearDestinationMarker) {
				destinationMarker.setMap(null);
				destinationMarker = null;
				$scope.locations.destination = {
																	name:"",
																	latLng:{},
																	id:"",
																	vicinity:""
																};
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
		/*$(window).on('mousewheel',function(event) {
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
		});*/
		
	}]);


roadFravel.controller('LandingCtrl',["$scope",function ($scope) { 
	$scope.setActiveNav("landing");

}]);

roadFravel.controller('LoginCtrl',["$scope",function ($scope) { 
	$scope.setActiveNav("login");

}]);
roadFravel.controller('AboutUsCtrl',["$scope",function ($scope) { 
	$scope.setActiveNav("aboutus");

}]);

roadFravel.controller('FaqCtrl',["$scope",function ($scope) { 

	$scope.setActiveNav("faq");

	$scope.questions = [
	{
		header : "Q1. Does Road Fravel also assure the safety?",
		answer: "No. It is just a platform to connect the people who are looking for pooling. However the security has to be assured by the users . They must verify from the social media profile of a person if the user is genuine and also can ask for identity card before pooling with another person."
	},
	{
		header : "Q2. Are the pools charged?",
		answer: " This completely depends upon the person who is offering the pool. You must ensure the pricing of the pool (if any) before taking up the pool with the offerer . Road Fravel takes no cut in the pooling amount it is completely free :)"
	},
	{
		header : "Q3. What is this even and odd?",
		answer: "In New Delhi a system was started in which depending on the even and odd dates of a month vehicles were allowed on the roads , e.g. on 2nd of any month only the vehicles having even registration number were allowed. So while offering the pool the user can enter the registration number of the vehicle this will allow others to search on the filter of even and odd."
	},
	{
		header : "Q4. I can't find pools on my route . How can I ask for a pool like a classified?",
		answer: "You can navigate to the offer tab and there select the second option i.e. Looking for a pool. Then complete the wizard. Your resquest will start appearing in the search results if any other user does a same search then he/she might connect with you and it might be your lucky day."
	},
	{
		header : "Q5. I don't have a facebook account can I offer pools?",
		answer: "No.Keeping in mind the genuine users the site allows registration only by facebook so that others can confirm your background. However you can still search for pool."
	}



	]
}]);


roadFravel.controller('MyPoolsCtrl',["$scope","rf_fetchMyPools", function ($scope,rf_fetchMyPools) { 

		$scope.setActiveNav("mypools");

	function fetchMyPools (inp) {
		var prom = rf_fetchMyPools.fetchPool({page:inp.page,pageSize:inp.pageSize});
		prom.then(drawMyPools);
	}

	function drawMyPools (data) {
		var obj;
		$scope.myPools = [];

		if (!data.hits) {
			return false;
		}
		$scope.totalItems = data.hits.total;
		for (var ii in data.hits.hits) {

			data.hits.hits[ii]._source.id = data.hits.hits[ii]._id;
			obj = getTemplateType(data.hits.hits[ii]._source);
			$scope.myPools.push(obj);
		}
		console.log(data);

		
	}



	$scope.totalItems;
	$scope.itemsPerPage = 5;
	$scope.currentPage = 1; 
	$scope.pageChanged = function () {
		fetchMyPools({page:$scope.currentPage,pageSize:$scope.itemsPerPage});
	}

	fetchMyPools({page:$scope.currentPage,pageSize:$scope.itemsPerPage});


}]);


