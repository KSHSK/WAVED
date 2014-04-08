define([
        'models/Widget/USMapWidget/USMapViewModel',
        'models/Constants/ComponentTemplateName',
        'models/Event/Trigger',
        '../Widget',
        'knockout',
        'jquery'
    ],function(
        USMapViewModel,
        ComponentTemplateName,
        Trigger,
        Widget,
        ko,
        $){
    'use strict';

    var USMap = function(state, getDataSet) {
        Widget.call(this, state);

        this._templateName = ComponentTemplateName.US_MAP;

        var $workspace = $('#waved-workspace');
        var usMap = this.newWidgetContainer();
        usMap.attr('data-bind', 'template: {name: \'' + this._templateName + '\', afterRender: render}');

        var viewModel = new USMapViewModel(state, getDataSet);
        viewModel.addTrigger(new Trigger('US Map', function() {
            return usMap;
        }));

        this._domElement = usMap;
        this.viewModel = viewModel;

        ko.applyBindings(viewModel, usMap[0]);
    };

    USMap.prototype = Object.create(Widget.prototype);

    /**
     * Static method that returns the type String for this class's ViewModel.
     */
    USMap.getViewModelType = function() {
        return USMapViewModel.getType();
    };

    USMap.iconLocation = function() {
        return 'Source/models/Widget/USMapWidget/usmap-icon.png';
    };

    USMap.prototype.addToWorkspace = function() {
        Widget.prototype.addToWorkspace.call(this);
        this.viewModel.render();
    };

    return USMap;
});