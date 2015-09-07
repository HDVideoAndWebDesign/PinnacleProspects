(function () {
    'use strict';

    angular
        .module('app')
        .controller('ProfileController', ProfileController);

    ProfileController.$inject = ['$rootScope'];
    function ProfileController($rootScope) {
        console.log('dicks');
    }

})();