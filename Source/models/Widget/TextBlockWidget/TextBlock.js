define([
        'models/Widget/TextBlockWidget/TextBlockViewModel',
        'models/Constants/WidgetTemplateName',
        'models/Event/Trigger',
        'modules/ExportProject',
        '../Widget',
        'knockout',
        'jquery'
    ],function(
        TextBlockViewModel,
        WidgetTemplateName,
        Trigger,
        ExportHelper,
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

        viewModel.trigger.domElement = textBlock;

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

    TextBlock.prototype.exportCss = function() {
        var vm = this.viewModel;
        var css =  Widget.prototype.exportCss.call(this);
        css = ExportHelper.addCssProperty(css, 'font-size', vm.textSize.originalValue + 'px');
        css = ExportHelper.addCssProperty(css, 'text-align', vm.textAlign.originalValue);
        css = ExportHelper.addCssProperty(css, 'color', vm.textColor.originalValue);
        css = ExportHelper.addCssProperty(css, 'font-weight', (vm.textWeight.originalValue === true) ? 'bold' : 'normal');
        css = ExportHelper.addCssProperty(css, 'text-decoration', (vm.textUnderline.originalValue === true) ? 'underline' : 'none');
        css = ExportHelper.addCssProperty(css, 'background-color', vm.backgroundColor.originalValue);
        css = ExportHelper.addCssProperty(css, 'border', vm.border.originalValue + 'px solid ' + vm.borderColor.originalValue);
        css = ExportHelper.addCssProperty(css, 'border-radius', '5px');
        css = ExportHelper.addCssProperty(css, 'overflow', 'hidden');
        css = ExportHelper.addCssProperty(css, 'padding', '3px');
        css = ExportHelper.addCssProperty(css, 'font-family', 'Arial');
        return css;
    };

    TextBlock.prototype.exportHtml = function() {
        return '<div id="' + this.viewModel.name.value + '">' + this.viewModel.text.originalValue + '</div>';
    };

    return TextBlock;
});