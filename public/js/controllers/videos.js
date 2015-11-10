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
          $rootScope.selected_video = {};

          $rootScope.addVideo = function(parentID){
            if($rootScope.viewVideo === true){
              $rootScope.viewVideo = false;
            } else {
              $rootScope.viewVideo = true;
              if(parentID != 0){
                $rootScope.isReply = true;
                $rootScope.connectID = parentID;
              } else {
                $rootScope.isReply = false;
                $rootScope.connectID = '';
              }
              $http.get('api/videoauth/').
                then(function(response) {
                  $rootScope.creds = response.data;
                }, function(response) {
                  toastr.error(response.message);
                });
            }
          }

          $rootScope.fixVid = function(video){
            $('#videosource').attr('src', video);
          }

          $rootScope.cancelReply = function() {
            $rootScope.viewVideo = false;
            $rootScope.videoTitle = '';
            $rootScope.videoNote = '';
            $rootScope.connectID = '';
          }

          $rootScope.findReply = function(video){
            $http.get('api/video_replies/' + video.id).
              then(function(response) {
                if(response.data.length > 0) {
                  video.replies = response.data;
                }
              }, function(response) {
                toastr.error(response.message);
              });
          }

          $rootScope.getVideos = function(){
            $http.get('api/videos/' + $rootScope.globals.currentUser.userid).
              then(function(response) {
                var videos = response.data;
                for (var video of videos) {
                  $rootScope.findReply(video);
                }
                $rootScope.videos = videos
                $rootScope.selected_video = videos[0];
                $rootScope.fixVid($rootScope.selected_video.video_link);
              }, function(response) {
                toastr.error(response.message);
            });
          }

          $rootScope.getVideo = function(video){

            function getVideoByID(value){
              return value.id == video.id;
            }
            var a = $rootScope.videos.filter(getVideoByID);

            $rootScope.selected_video = a[0]
            $rootScope.fixVid($rootScope.selected_video.video_link);

          }

          $rootScope.getVideos();

          $rootScope.upload = function(videoTitle, videoNote, isReply, videoParent) {
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
                    
                    // Upload Successfully Finished, add the video to the users videos pile

                    $rootScope.nv = {};
                    
                    //console.log($rootScope.videoTitle+ ": " + $rootScope.videoNote)
                    if($rootScope.isReply){
                      $rootScope.nv = {
                        'note': videoNote,
                        'userid': $rootScope.globals.currentUser.userid,
                        'title': videoTitle,
                        'video_id': videoParent,
                        'video_link': 'http://s3.amazonaws.com/' + $rootScope.creds.bucket + '/' + uniqueFileName
                      }
                      $http.post('api/video_replies/', $rootScope.nv).
                        then(function(response) {
                          $rootScope.nv = {};
                          $rootScope.getVideos();
                          toastr.success('File Uploaded Successfully', 'Done');
                          $rootScope.addVideo();
                        }, function(response) {
                          toastr.error(response.message);
                      });
                    } else {
                      $rootScope.nv = {
                        'note': videoNote,
                        'userid': $rootScope.globals.currentUser.userid,
                        'title': videoTitle,
                        'video_link': 'http://s3.amazonaws.com/' + $rootScope.creds.bucket + '/' + uniqueFileName
                      }
                      $http.post('api/videos/', $rootScope.nv).
                        then(function(response) {
                          $rootScope.nv = {};
                          $rootScope.getVideos();
                          toastr.success('File Uploaded Successfully', 'Done');
                          $rootScope.addVideo();
                        }, function(response) {
                          toastr.error(response.message);
                      });
                    }

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

                if($rootScope.isReply){
                  //  No file, but content to be added (for non video replies i guess)
                  $rootScope.nv = {
                  'note': videoNote,
                  'userid': $rootScope.globals.currentUser.userid,
                  'title': videoTitle,
                  'video_link': '',
                  'video_id': videoParent,
                  }
                  $http.post('api/video_replies/', $rootScope.nv).
                    then(function(response) {
                      $rootScope.nv = {};
                      toastr.success(response.message);
                      $rootScope.getVideos();
                      toastr.success('File Uploaded Successfully', 'Done');
                      $rootScope.addVideo();
                    }, function(response) {
                      toastr.error(response.message);
                  });
                } else {
                  ///  No file, but non video content to be added
                  $rootScope.nv = {
                  'note': videoNote,
                  'userid': $rootScope.globals.currentUser.userid,
                  'title': videoTitle,
                  'video_link': '',
                  }
                  $http.post('api/videos/', $rootScope.nv).
                    then(function(response) {
                      $rootScope.nv = {};
                      toastr.success(response.message);
                      $rootScope.getVideos();
                      toastr.success('Added Successfully', 'Done');
                      $rootScope.addVideo();
                    }, function(response) {
                      toastr.error(response.message);
                  });

                }
                
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