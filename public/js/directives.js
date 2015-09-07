'use strict';

var directives = angular.module('directives', []);

directives.directive('file', function() {
  return {
    restrict: 'AE',
    $rootScope: {
      file: '@'
    },
    link: function($rootScope, el, attrs){
      el.bind('change', function(event){
        console.log($rootScope);
        var files = event.target.files;
        var file = files[0];
        $rootScope.file = file;
        $rootScope.$parent.file = file;
        $rootScope.$apply();
      });
    }
  };
});