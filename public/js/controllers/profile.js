(function () {
    'use strict';

    angular
        .module('app')
        .controller('ProfileController', ProfileController);

    ProfileController.$inject = ['$rootScope', '$http'];
    function ProfileController($rootScope, $http) {

		$rootScope.showWrite = false;

        // Simple get request example:
		$http.get('/profile/' + $rootScope.globals.currentUser.username).
		  then(function(response) {
		  	$rootScope.profile = response.data;
		    console.log($rootScope.profile);
			    $http.get('/users/all').
					then(function(response) {
						$rootScope.allUsers = response.data
					}, function(response) {
						toastr.error(response.message);
					});
					$rootScope.getMessages();
		  }, function(response) {
		    toastr.error(response.msg);
		 });


		$rootScope.getMessages = function(){
			$http.get('/messages/' + $rootScope.profile.id).
				then(function(response) {
					$rootScope.messages = response.data;
					$rootScope.messages_count = response.data.length;
				console.log($rootScope.messages);
				}, function(response) {
				toastr.error(response.message);
				});
		} 


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

		$rootScope.createMessage = function() {
			$rootScope.showWrite = true;
		}
		$rootScope.cancelMessage = function() {
			$rootScope.showWrite = false;
			$rootScope.recipientid = '';
			$rootScope.note = '';
		}
		$rootScope.writeMessage = function(recipientid, note) {
			$rootScope.showWrite = false;
			$rootScope.newmessage = {
				"recipientid": recipientid,
				"sender": $rootScope.profile.id,
				"note": note
			};
			$http.post('/message/', $rootScope.newmessage).
				then(function(response) {
					$rootScope.newmessage = {};
					toastr.success(response.message);
					$rootScope.getMessages();
				}, function(response) {
					toastr.error(response.message);
			});
		}

    }
})();