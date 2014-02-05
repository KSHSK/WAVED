define([
    './module',
    '../WAVED'
], function(controllers, WAVED) {
    controllers.controller('WAVEDCtrl', function ($scope) {
        
        $scope.widgets = [];
    
        $scope.selectedWidgetChanged = function() {
            console.log('Selected Widget: ' + $scope.selectedWidget.name);
        };
    });
});