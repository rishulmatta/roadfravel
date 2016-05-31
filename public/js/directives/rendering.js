roadFravel.directive('rfPoolList',[function () {
		return {
			restrict : 'A',
			scope:true,
			templateUrl:'partials/poolList',
			link : function (scope ,element ,attr) {
				
		
			}
		}
	}]);


roadFravel.directive('rfPoolRow',[function () {
		return {
			restrict : 'A',
			scope:true,
			templateUrl:'partials/poolRow',
			link : function (scope ,element ,attr) {
				
			}
		}
	}]);





roadFravel.directive('rfMask',["$timeout","$location",function ($timeout,$location) {
		return {
			restrict : 'A',
			scope:{
				'btntext' : '@',
				'redirecturl' : '@'
			},
			transclude:true,
			templateUrl:'partials/d_mask',
			link : function (scope ,element ,attr) {

				element.css("position","relative");
				element.css("overflow","hidden");
				
				element.on('mouseenter', function(event) {
					scope.mouseInside = true;
					$timeout(function(){
						if (scope.mouseInside) {
							scope.$apply();
						}
					},300)
					
				});

				element.on('mouseleave', function(event) {
					scope.mouseInside = false;
					scope.$apply();
				});

				scope.buttonClick = function () {
					$location.path(scope.redirecturl);
				}

				
			}
		}
	}]);

roadFravel.directive('rfMyPoolRow',["$uibModal","rf_deleteMyPool",function ($uibModal,rf_deleteMyPool) {
		return {
			restrict : 'A',
			scope:true,
			templateUrl:'partials/myPoolRow',
			link : function (scope ,element ,attr) {
					var modalInstance,index;
				element.click(function () {
					if (scope.pool.disabled) {
						return;
					}
					for (var ii in scope.myPools) {
						scope.myPools[ii].active = false;
					}
					scope.myPools[scope.pool.index].active = true;
					scope.$apply();
				});

				scope.deleteMyPoolConfirmation = function () {
					var prom = rf_deleteMyPool.deleteMyPool({id:scope.pool.id});
					prom.then(function (res) {
						if (res.status){
							window.location.reload();
						}
					})
				}

				scope.closeModal = function () {
					modalInstance.close();
				}

				scope.deleteMyPool = function () {
					index  = scope.pool.index;

					 modalInstance = $uibModal.open({
				     animation: true,
				     templateUrl: 'partials/myPoolDeleteModal',
				     scope:scope,
				     //controller: 'ModalInstanceCtrl',
				    keyboard :false,
				    backdrop :"static"
				   });

				}
			}
		}
	}]);