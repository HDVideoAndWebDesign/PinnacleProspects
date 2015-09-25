(function () {
    'use strict';

    angular
        .module('app')
        .controller('ProfileController', ProfileController);

    ProfileController.$inject = ['$rootScope', '$http'];
    function ProfileController($rootScope, $http) {

		$rootScope.showWrite = false;
		$rootScope.showImage = false;

		$rootScope.getDatetime = function() {
			var newDate = Date.now();
			return newDate;
		};

        // Simple get request example:
		$http.get('/profile/' + $rootScope.globals.currentUser.username).
		  then(function(response) {
		  	$rootScope.profile = response.data;
		    	///  Get Profile's videos
			    $rootScope.getVideos();
			    $rootScope.getAnnouncements();
			    if($rootScope.profile.weight == ''){
			    	$rootScope.profile.weight = []
			    }
			    if($rootScope.profile.height == ''){
			    	$rootScope.profile.height = []
			    }
			    if($rootScope.profile.bats == ''){
			    	$rootScope.profile.bats = []
			    }
			    if($rootScope.profile.throws == ''){
			    	$rootScope.profile.throws = []
			    }
		        // Get all users list for messages
			    $http.get('/users/all').
					then(function(response) {
						$rootScope.allUsers = response.data
					}, function(response) {
						toastr.error(response.data.msg);
					});
					$rootScope.getMessages();
		  }, function(response) {
		    toastr.error(response.msg);
		 });


		$rootScope.getVideos = function(){
			$http.get('/videos/' + $rootScope.profile.id).
	          then(function(response) {
	          	// got the video info
	          	$rootScope.profile_videos = response.data;
	          }, function(response) {
	            toastr.error(response.data.msg);
	        });
		}

		$rootScope.getAnnouncements = function(){
			$http.get('/announcements/').
	          then(function(response) {
	          	// got the video info
	          	$rootScope.announcements = response.data;
	          }, function(response) {
	            toastr.error(response.data.msg);
	        });
		}

		$rootScope.getMessages = function(){
			$http.get('/messages/' + $rootScope.profile.id).
				then(function(response) {
					$rootScope.messages = response.data;
					$rootScope.messages_count = response.data.length;
				}, function(response) {
				toastr.error(response.data.msg);
				});
		} 


		$rootScope.changeSeen = function(messageid, switchToggle) {
	    	$http.put('/message/' + switchToggle + '/' + messageid).
			  then(function(response) {
			  	$http.get('/messages/' + $rootScope.profile.id).
				  then(function(response) {
				  	$rootScope.messages = response.data;
				  	$rootScope.messages_count = response.data.length;
				  }, function(response) {
				    toastr.error(response.data.msg);
				  });
			  }, function(response) {
			    toastr.error(response.data.msg);
			  });
    	}

    	
		$rootScope.updateProfile = function() {
			$http.put('/profile/' + $rootScope.profile.id, $rootScope.profile).
				then(function(response) {
					console.log($rootScope.profile);
					toastr.success(response.data.msg);
				}, function(response) {
					toastr.error(response.data.msg);
			});
		}

		$rootScope.createMessage = function() {
			$rootScope.showWrite = true;
		}
		$rootScope.createImage = function() {
			if($rootScope.showImage == true) {
				$rootScope.showImage = false;
			} else {
				$rootScope.showImage = true;
				$http.get('/videoauth/').
				then(function(response) {
				  $rootScope.creds = response.data;
				}, function(response) {
				  toastr.error(response.data.msg);
				});
			}
			
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
				"profile_image": $rootScope.profile.image,
				"note": note
			};
			$http.post('/message/', $rootScope.newmessage).
				then(function(response) {
					$rootScope.newmessage = {};
					toastr.success(response.data.msg);
					$rootScope.getMessages();
				}, function(response) {
					toastr.error(response.data.msg);
			});
		}

		$rootScope.sizeLimit      = 10585760; // 10MB in Bytes
        $rootScope.uploadProgress = 0;
        $rootScope.creds          = {};

		$rootScope.upload = function(videoTitle, videoNote) {
            AWS.config.update({ accessKeyId: $rootScope.creds.access_key, secretAccessKey: $rootScope.creds.secret_key });
            AWS.config.region = 'us-east-1';
            var bucket = new AWS.S3({ params: { Bucket: $rootScope.creds.bucket } });
          
            if($rootScope.file) {
                // Perform File Size Check First
                var fileSize = Math.round(parseInt($rootScope.file.size));
                if (fileSize > $rootScope.sizeLimit) {
                  toastr.error('Sorry, your attachment is too big. <br/> Maximum '  + $rootScope.fileSizeLabel() + ' file attachment allowed','File Too Large');
                  return false;
                }
                // Prepend Unique String To Prevent Overwrites
                var uniqueFileName = $rootScope.uniqueString() + '-' + $rootScope.file.name;

                var params = { Key: uniqueFileName, ContentType: $rootScope.file.type, Body: $rootScope.file, ServerSideEncryption: 'AES256' };

                bucket.putObject(params, function(err, data) {
                  if(err) {
                    toastr.error(err.message,err.code);
                    return false;
                  }
                  else {
                    // Upload Successfully Finished, add the image to the users profile pile

                    $rootScope.profile.image = 'http://s3.amazonaws.com/' + $rootScope.creds.bucket + '/' + uniqueFileName;

                    $http.put('/profile/' + $rootScope.profile.id, $rootScope.profile).
                      then(function(response) {
                        toastr.success('File Uploaded Successfully', 'Done');
                        $rootScope.showImage = false;
                      }, function(response) {
                        toastr.error(response.data.msg);
                    });

                    // Reset The Progress Bar
                    setTimeout(function() {
                      $rootScope.uploadProgress = 0;
                      $rootScope.$digest();
                    }, 4000);
                  }
                })
                .on('httpUploadProgress',function(progress) {
                  $rootScope.uploadProgress = Math.round(progress.loaded / progress.total * 100);
                  $rootScope.$digest();
                });
              }
              else {
                // No File Selected
                toastr.error('Please select a file to upload');
              }
            }

            $rootScope.fileSizeLabel = function() {
            // Convert Bytes To MB
            return Math.round($rootScope.sizeLimit / 1024 / 1024) + 'MB';
          };

          $rootScope.uniqueString = function() {
            var text     = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for( var i=0; i < 8; i++ ) {
              text += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return text;
          }

    }
})();