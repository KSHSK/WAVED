define([
	'angular',
	'controllers/controllers'
	], function (angular, controllers, WAVEDController) {

		// Declare app level module which depends on filters, and services
		
		return angular.module('ngWAVED', [
			'ngWAVED.controllers'
		]);
});
