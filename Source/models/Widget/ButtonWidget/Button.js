define([
        'models/Widget/ButtonWidget/ButtonViewModel',
        'models/Constants/ComponentTemplateName',
        'knockout',
        'jquery'
    ],function(
        ButtonViewModel,
        ComponentTemplateName,
        ko,
        $){
    'use strict';

    // TODO: Remove getDataSet
    var Button = function(state, project) {
        this._templateName = ComponentTemplateName.BUTTON;

        // TODO: Remove getDataSet
        var viewModel = new ButtonViewModel(state, project);

        var $workspace = $('#waved-workspace');
        var button = document.createElement('div');
        button.className = 'widget-container';
        $(button).attr('data-bind', 'template: {name: \'' + this._templateName + '\'}');
        $workspace.append(button);

        this.viewModel = viewModel;
        ko.applyBindings(viewModel, button);
    };

    /**
     * Static method that returns the type String for this class's ViewModel.
     */
    Button.getViewModelType = function() {
        return ButtonViewModel.getType();
    };

    return Button;
});