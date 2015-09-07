(function () {
    'use strict';

    angular
        .module('app')
        .controller('VideosController', VideosController);

    VideosController.$inject = ['$rootScope'];
    function VideosController($rootScope) {
          $rootScope.sizeLimit      = 105857600; // 100MB in Bytes
          $rootScope.uploadProgress = 0;
          $rootScope.creds          = {};
          $rootScope.creds.access_key = 'AKIAJFYTBERMGTQ64J6Q';
          $rootScope.creds.secret_key = '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';
          $rootScope.creds.bucket = 'pinnacleprospects';


          $rootScope.upload = function() {
            AWS.config.update({ accessKeyId: $rootScope.creds.access_key, secretAccessKey: $rootScope.creds.secret_key });
            AWS.config.region = 'us-east-1';
            var bucket = new AWS.S3({ params: { Bucket: $rootScope.creds.bucket } });
            
            console.log($rootScope.file);

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
                    // Upload Successfully Finished
                    toastr.success('File Uploaded Successfully', 'Done');

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