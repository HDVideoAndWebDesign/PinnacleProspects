(function () {
    'use strict';

    angular
        .module('app')
        .controller('ScoutController', ScoutController);

    ScoutController.$inject = ['$rootScope', '$http'];
    function ScoutController($rootScope, $http) {

    	$rootScope.disabled = true; //defaulted 

        // Simple get request example:
		$http.get('api/profile/' + $rootScope.globals.currentUser.username).
		  then(function(response) {
		  	$rootScope.profile = response.data;
		  }, function(response) {
		    toastr.error(response.msg);
		 });

		 if($rootScope.globals.currentUser.usertype != 'admin'){
		 	$("body :input").prop("disabled", true); 
		 	$rootScope.disabled = false;
		 }

		// Simple get request example:
		$http.get('api/scout/' + $rootScope.globals.currentUser.username).
		  then(function(response) {
		  	$rootScope.scout = response.data;
		  }, function(response) {
		    toastr.error(response.msg);
		 });  

		$rootScope.updateScout = function() {
			$http.put('api/scout/' + $rootScope.scout.id, $rootScope.scout).
				then(function(response) {
					toastr.success(response.data.msg);
				}, function(response) {
					toastr.error(response.data.msg);
			});
		}

    }
})();