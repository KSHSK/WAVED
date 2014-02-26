/*global define*/
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

    var Button = function(options) {
        this._templateName = ComponentTemplateName.BUTTON;

        var viewModel = new ButtonViewModel(options);

        var $workspace = $('#waved-workspace');
        var button = document.createElement('div');
        button.className = 'widget-container';
        $(button).attr('data-bind', 'template: {name: \'' + this._templateName + '\'}');
        $workspace.append(button);

        this.viewModel = viewModel;
        ko.applyBindings(viewModel, button);
    };

    return Button;
});