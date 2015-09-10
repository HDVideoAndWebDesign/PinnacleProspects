angular.module('trusted', []).filter('trusted', function($sce) {
	return function(url) {
	  return $sce.trustAsResourceUrl(url);
	};
});