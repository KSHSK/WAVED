define([
        'models/Widget/TextBlockWidget/TextBlockViewModel',
        'models/Constants/ComponentTemplateName',
        'knockout',
        'jquery'
    ],function(
        TextBlockViewModel,
        ComponentTemplateName,
        ko,
        $){
    'use strict';

    var TextBlock = function(state) {
        this._templateName = ComponentTemplateName.TEXTBLOCK;

        var viewModel = new TextBlockViewModel(state);

        var $workspace = $('#waved-workspace');
        var textBlock = document.createElement('div');
        textBlock.className = 'widget-container';
        $(textBlock).attr('data-bind', 'template: {name: \'' + this._templateName + '\'}');
        $workspace.append(textBlock);

        this.domElement = textBlock;
        this.viewModel = viewModel;
        ko.applyBindings(viewModel, textBlock);
    };

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