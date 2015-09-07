(function () {
    'use strict';

    angular
        .module('app')
        .controller('ProfileController', ProfileController);

    ProfileController.$inject = ['$rootScope', '$http'];
    function ProfileController($rootScope, $http) {
        // Simple get request example:
		$http.get('/profile/' + $rootScope.globals.currentUser.username).
		  then(function(response) {
		  	$rootScope.profile = response.data;
		    console.log($rootScope.profile);
			    $http.get('/messages/' + $rootScope.profile.id).
				  then(function(response) {
				  	$rootScope.messages = response.data;
				  	$rootScope.messages_count = response.data.length;
				    console.log($rootScope.messages);
				  }, function(response) {
				    toastr.error(response.message);
				  });
		  }, function(response) {
		    toastr.error(response.msg);
		 });


		$rootScope.changeSeen = function(messageid, switchToggle) {
	    	$http.put('/message/' + switchToggle + '/' + messageid).
			  then(function(response) {
			  	$http.get('/messages/' + $rootScope.profile.id).
				  then(function(response) {
				  	$rootScope.messages = response.data;
				  	$rootScope.messages_count = response.data.length;
				    console.log($rootScope.messages);
				  }, function(response) {
				    toastr.error(response.message);
				  });
			  }, function(response) {
			    toastr.error(response.message);
			  });
    	}

    	
		$rootScope.updateProfile = function() {
			console.log("Profile Change")
			$http.put('/profile/' + $rootScope.profile.id, $rootScope.profile).
				then(function(response) {
					toastr.success(response.message);
				}, function(response) {
					toastr.error(response.message);
			});
		}

    }
})();