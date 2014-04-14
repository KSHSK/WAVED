define([
        'models/Element/TooltipViewModel',
        'models/Constants/WidgetTemplateName',
        'knockout',
        'jquery'
    ],function(
        TooltipViewModel,
        WidgetTemplateName,
        ko,
        $){
    'use strict';

    var Tooltip = function(state) {
        this._templateName = WidgetTemplateName.TOOLTIP;

        var viewModel = new TooltipViewModel(state);

        var $workspace = $('#waved-workspace');
        var tooltip = document.createElement('div');
        tooltip.className = 'widget-container';
        $(tooltip).attr('data-bind', 'template: {name: \'' + this._templateName + '\'}');

        // TODO: Probably not right
        $workspace.append(tooltip);

        this.viewModel = viewModel;
        ko.applyBindings(viewModel, tooltip);
    };

    return Tooltip;
});