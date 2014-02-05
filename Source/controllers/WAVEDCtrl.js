define([
    './module',
    '../WAVED'
], function(controllers, WAVED) {
    controllers.controller('WAVEDCtrl', function ($scope) {
        
        $scope.widgets = [{name: "Widget 1"}, {name: "Widget 2"}];
    
        $scope.selectedWidgetChanged = function() {
            console.log('Selected Widget: ' + $scope.selectedWidget.name);
        };
    });
});