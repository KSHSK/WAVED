/*global define*/
define([
        'models/ButtonWidget/ButtonWidgetViewModel',
        'knockout',
        'jquery'
    ],function(
        ButtonWidgetViewModel,
        ko,
        $){
    'use strict';

    var ButtonWidget = function(options) {
        this._templateName = 'buttonWidgetTemplate';

        var viewModel = new ButtonWidgetViewModel(options);

        var $workspace = $('#waved-workspace');
        var button = document.createElement('div');
        button.className = 'widget-container';
        $(button).attr('data-bind', 'template: {name: \'' + this._templateName + '\'}');
        $workspace.append(button);

        this.viewModel = viewModel;
        ko.applyBindings(viewModel, button);
    };

    return ButtonWidget;
});