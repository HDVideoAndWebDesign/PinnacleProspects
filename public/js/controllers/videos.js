(function () {
    'use strict';

    angular
        .module('app')
        .controller('VideosController', VideosController);

    VideosController.$inject = ['$rootScope', '$http'];
    function VideosController($rootScope, $http) {
          $rootScope.sizeLimit      = 1058576000; // 1000MB in Bytes
          $rootScope.uploadProgress = 0;
          $rootScope.creds          = {};
          $rootScope.videoTitle     = "";
          $rootScope.videoNote      = "";

          $rootScope.addVideo = function(){
            if($rootScope.viewVideo === true){
              $rootScope.viewVideo = false;
            } else {
              $rootScope.viewVideo = true;
              $http.get('/videoauth/').
                then(function(response) {
                  $rootScope.creds = response.data;
                }, function(response) {
                  toastr.error(response.message);
                });
            }
          }

          $rootScope.getVideos = function(){
            $http.get('/videos/' + $rootScope.globals.currentUser.userid).
              then(function(response) {
                $rootScope.videos = response.data;
              }, function(response) {
                toastr.error(response.message);
            });
          }

          $rootScope.getVideos();

          $rootScope.upload = function() {
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
                    console.log(data);
                    console.log(uniqueFileName);
                    // Upload Successfully Finished, add the video to the users videos pile

                    $rootScope.nv = {};
                    
                    $rootScope.nv = {
                      'note': $rootScope.videoNote,
                      'userid': $rootScope.globals.currentUser.userid,
                      'title': $rootScope.videoTitle,
                      'video_link': 'http://s3.amazonaws.com/' + $rootScope.creds.bucket + '/' + uniqueFileName
                    }

                    $http.post('/videos/', $rootScope.nv).
                      then(function(response) {
                        $rootScope.nv = {};
                        toastr.success(response.message);
                        $rootScope.getVideos();
                      }, function(response) {
                        toastr.error(response.message);
                    });

                    toastr.success('File Uploaded Successfully', 'Done');
                    $rootScope.addVideo();

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