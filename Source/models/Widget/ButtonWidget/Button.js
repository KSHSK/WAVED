define([
        'models/Widget/ButtonWidget/ButtonViewModel',
        'models/Constants/ComponentTemplateName',
        '../Widget',
        'knockout',
        'jquery'
    ],function(
        ButtonViewModel,
        ComponentTemplateName,
        Widget,
        ko,
        $){
    'use strict';

    var Button = function(state, getDataSet) {
        Widget.call(this, state);

        this._templateName = ComponentTemplateName.BUTTON;

        var viewModel = new ButtonViewModel(state, getDataSet);

        var button = this.newWidgetContainer();
        button.attr('data-bind', 'template: {name: \'' + this._templateName + '\'}');

        this.domElement = button;
        this.viewModel = viewModel;

        this.addToWorkspace();

        ko.applyBindings(viewModel, button[0]);
    };

    Button.prototype = Object.create(Widget.prototype);

    /**
     * Static method that returns the type String for this class's ViewModel.
     */
    Button.getViewModelType = function() {
        return ButtonViewModel.getType();
    };

    Button.iconLocation = function() {
        return 'Source/models/Widget/ButtonWidget/button-icon.png';
    };

    return Button;
});