/*global define*/
define([
        'models/Widget/USMapWidget/USMapViewModel',
        'models/Constants/ComponentTemplateName',
        'knockout',
        'jquery'
    ],function(
        USMapViewModel,
        ComponentTemplateName,
        ko,
        $){
    'use strict';

    var USMap = function(state) {
        this._templateName = ComponentTemplateName.US_MAP;

        var viewModel = new USMapViewModel(state);

        var $workspace = $('#waved-workspace');
        var usMap = document.createElement('div');
        usMap.className = 'widget-container';
        $(usMap).attr('data-bind', 'template: {name: \'' + this._templateName + '\'}');
        $workspace.append(usMap);

        this.viewModel = viewModel;
        ko.applyBindings(viewModel, usMap);
    };

    return USMap;
});