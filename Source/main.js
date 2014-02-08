require.config({
    paths: {
        angular: '../ThirdParty/angularjs/angular.min',
        jquery: 'require-jquery'
    },
    
    // AngularJS doesn't use define(), so we configure it as a module here.
    shim: {
        'angular' : {'exports' : 'angular'}
    },
    
    // Load bootstrap.js to start the application.
    deps: ['./bootstrap']

});