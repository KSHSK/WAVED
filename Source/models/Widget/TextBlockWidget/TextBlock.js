define([
        'models/Widget/TextBlockWidget/TextBlockViewModel',
        'models/Constants/ComponentTemplateName',
        '../Widget',
        'knockout',
        'jquery'
    ],function(
        TextBlockViewModel,
        ComponentTemplateName,
        Widget,
        ko,
        $){
    'use strict';

    var TextBlock = function(state) {
        Widget.call(this, state);

        this._templateName = ComponentTemplateName.TEXTBLOCK;

        var viewModel = new TextBlockViewModel(state);

        var textBlock = this.newWidgetContainer();
        textBlock.attr('data-bind', 'template: {name: \'' + this._templateName + '\'}');

        this._domElement = textBlock;
        this.viewModel = viewModel;

        ko.applyBindings(viewModel, textBlock[0]);
    };

    TextBlock.prototype = Object.create(Widget.prototype);

    /**
     * Static method that returns the type String for this class's ViewModel.
     */
    TextBlock.getViewModelType = function() {
        return TextBlockViewModel.getType();
    };

    TextBlock.iconLocation = function() {
        return 'Source/models/Widget/TextBlockWidget/textblock-icon.png';
    };

    return TextBlock;
});