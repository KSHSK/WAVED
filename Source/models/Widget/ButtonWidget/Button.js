define([
        'models/Widget/ButtonWidget/ButtonViewModel',
        'models/Constants/ComponentTemplateName',
        'models/Event/Trigger',
        'knockout',
        'jquery'
    ],function(
        ButtonViewModel,
        ComponentTemplateName,
        Trigger,
        ko,
        $){
    'use strict';

    var Button = function(state, getDataSet) {
        this._templateName = ComponentTemplateName.BUTTON;

        var viewModel = new ButtonViewModel(state, getDataSet);

        var $workspace = $('#waved-workspace');

        var button = document.createElement('div');
        button.className = 'widget-container';
        $(button).attr('data-bind', 'template: {name: \'' + this._templateName + '\'}');
        $workspace.append(button);

        viewModel.triggers.push(new Trigger('Button', button));

        this._domElement = button;
        this.viewModel = viewModel;
        ko.applyBindings(viewModel, button);
    };

    Object.defineProperties(Button.prototype, {
        domElement: {
            get: function() {
                return this._domElement;
            }
        }
    });

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