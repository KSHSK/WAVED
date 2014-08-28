define([
        'models/Widget/ButtonWidget/ButtonViewModel',
        'models/Constants/WidgetTemplateName',
        'models/Event/Trigger',
        '../Widget',
        'knockout',
        'jquery'
    ],function(
        ButtonViewModel,
        WidgetTemplateName,
        Trigger,
        Widget,
        ko,
        $){
    'use strict';

    var Button = function(state, getDataSet) {
        Widget.call(this, state);

        this._templateName = WidgetTemplateName.BUTTON;

        var button = this.newWidgetContainer();
        button.attr('data-bind', 'template: {name: \'' + this._templateName + '\'}');

        var viewModel = new ButtonViewModel(state, getDataSet);
        viewModel.trigger.domElement = button;

        this._domElement = button;
        this.viewModel = viewModel;

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

    Button.prototype.getCss = function() {
        return Widget.prototype.getCss.call(this);
    };

    Button.prototype.exportHtml = function() {
        return '<button class="widget widget-button" id="' + this.viewModel.exportId + '">' + this.viewModel.label.originalValue + '</button>';
    };

    return Button;
});