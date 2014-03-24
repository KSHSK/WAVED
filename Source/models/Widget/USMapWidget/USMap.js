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
        $(usMap).attr('data-bind', 'template: {name: \'' + this._templateName + '\', ' +
            'afterRender: render}');
        $workspace.append(usMap);

        this.viewModel = viewModel;
        ko.applyBindings(viewModel, usMap);
    };

    /**
     * Static method that returns the type String for this class's ViewModel.
     */
    USMap.getViewModelType = function() {
        return USMapViewModel.getType();
    };

    USMap.iconLocation = function() {
        return 'Source/models/Widget/USMapWidget/usmap-icon.png';
    };

    return USMap;
});