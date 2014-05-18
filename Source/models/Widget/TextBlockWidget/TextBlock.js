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

    TextBlock.prototype.getCss = function() {

        Widget.prototype.getCss.call(this);

        var vm = this.viewModel;

        this._css.color = vm.textColor.originalValue;
        this._css.border = vm.border.originalValue + 'px solid ' + vm.borderColor.originalValue;
        this._css.overflow = 'hidden';
        this._css.padding = '3px';
        this._css['font-size'] = vm.textSize.originalValue + 'px';
        this._css['text-align'] = vm.textAlign.originalValue;
        this._css['font-weight'] = (vm.textWeight.originalValue === true) ? 'bold' : 'normal';
        this._css['text-decoration'] = (vm.textUnderline.originalValue === true) ? 'underline' : 'none';
        this._css['background-color'] = vm.backgroundColor.originalValue;
        this._css['border-radius'] = '5px';
        this._css['font-family'] = 'Arial';

        return this._css;
    };

    TextBlock.prototype.exportHtml = function() {
        return '<div id="' + this.viewModel.name.value + '">' + this.viewModel.text.originalValue + '</div>';
    };

    return TextBlock;
});