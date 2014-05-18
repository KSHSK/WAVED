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

    Button.prototype.exportCss = function() {

        // TODO: Add a exportCss function to the widget class. call that to get the standard stuff like
        // position, display, left, top, width, height, z-index, etc. Then in this function, just concat
        // the widget-specific css.

        // TODO: id should be widget-id
        var css = '#' + this.viewModel.name.value + ' {' +
                  '\tposition: relative;\n' +
                  '\tdisplay: ' + (this.viewModel.value ? 'block' : 'none') + ';\n' +
                  '\tleft: ' + this.viewModel.x.originalValue + '%;\n' +
                  '\ttop: ' + this.viewModel.y.originalValue + '%;\n' +
                  '\theight: ' + this.viewModel.height.originalValue + '%;\n' +
                  '\twidth: ' + this.viewModel.width.originalValue + '%;\n' +
                  '\tz-index: ' + this.viewModel.z.originalValue + ';\n' +
                  '}';

        return css;
    };

    Button.prototype.exportHtml = function() {
        return '<button id="' + this.viewModel.name.value + '">' + this.viewModel.label.originalValue + '</button>';
    };

    return Button;
});