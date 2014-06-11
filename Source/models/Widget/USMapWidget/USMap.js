define([
        'models/Widget/USMapWidget/USMapViewModel',
        'models/Constants/WidgetTemplateName',
        'models/Event/Trigger',
        '../Widget',
        'knockout',
        'jquery'
    ],function(
        USMapViewModel,
        WidgetTemplateName,
        Trigger,
        Widget,
        ko,
        $){
    'use strict';

    var USMap = function(state, getDataSet) {
        Widget.call(this, state);

        this._templateName = WidgetTemplateName.US_MAP;

        var $workspace = $('#waved-workspace');
        var usMap = this.newWidgetContainer();
        usMap.attr('data-bind', 'template: {name: \'' + this._templateName + '\', afterRender: render}');

        var viewModel = new USMapViewModel(state, getDataSet);
        viewModel.trigger.domElement = usMap;

        this._domElement = usMap;
        this.viewModel = viewModel;

        ko.applyBindings(viewModel, usMap[0]);
    };

    USMap.prototype = Object.create(Widget.prototype);

    USMap.prototype.addToWorkspace = function() {
        Widget.prototype.addToWorkspace.call(this);

        this.viewModel.render();
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

    /**
     * Returns trigger data supplied to actions when this widget triggers an event.
     */
    USMap.actionTriggerInfo = function() {
        return {
            'state': 'The name of the state that was clicked.',
            'stateAbbreviation': 'The abbreviation of the state that was clicked.'
        };
    };

    return USMap;
});