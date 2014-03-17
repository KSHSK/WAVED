define([
        'models/Widget/TextBlockWidget/TextBlockViewModel',
        'models/Constants/ComponentTemplateName',
        'models/Event/Trigger',
        'knockout',
        'jquery'
    ],function(
        TextBlockViewModel,
        ComponentTemplateName,
        Trigger,
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

        viewModel.triggers.push(new Trigger('TextBlock', textBlock));

        this._domElement = textBlock;
        this.viewModel = viewModel;
        ko.applyBindings(viewModel, textBlock);
    };

    Object.defineProperties(TextBlock.prototype, {
        domElement: {
            get: function() {
                return this._domElement;
            }
        }
    });

    /**
     * Static method that returns the type String for this class's ViewModel.
     */
    TextBlock.getViewModelType = function() {
        return TextBlockViewModel.getType();
    };

    return TextBlock;
});