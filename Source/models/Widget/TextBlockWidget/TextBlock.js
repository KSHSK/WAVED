define([
        'models/Widget/TextBlockWidget/TextBlockViewModel',
        'models/Constants/WidgetTemplateName',
        'models/Event/Trigger',
        '../Widget',
        'knockout',
        'jquery'
    ],function(
        TextBlockViewModel,
        WidgetTemplateName,
        Trigger,
        Widget,
        ko,
        $){
    'use strict';

    var TextBlock = function(state, getDataSet) {
        Widget.call(this, state);

        this._templateName = WidgetTemplateName.TEXTBLOCK;

        var viewModel = new TextBlockViewModel(state, getDataSet);

        var textBlock = this.newWidgetContainer();
        textBlock.attr('data-bind', 'template: {name: \'' + this._templateName + '\'}');

        viewModel.addTrigger(new Trigger('TextBlock', function() {
            return textBlock;
        }));

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