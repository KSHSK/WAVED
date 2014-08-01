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

        this._css.overflow = 'hidden';
        this._css.padding = '3px';
        this._css['border-style'] = 'solid';
        this._css['border-radius'] = '5px';
        this._css['font-family'] = 'Arial';

        this._css[vm.textSize.css.attribute] = vm.textSize.originalValue + vm.textSize.css.units;
        this._css[vm.textAlign.css.attribute] = vm.textAlign.originalValue + vm.textAlign.css.units;
        this._css[vm.textColor.css.attribute] = vm.textColor.originalValue + vm.textColor.css.units;
        this._css[vm.textWeight.css.attribute] = vm.textWeight.css.options[vm.textWeight.originalValue.toString()];
        this._css[vm.textUnderline.css.attribute] = vm.textUnderline.css.options[vm.textUnderline.originalValue.toString()];

        this._css[vm.backgroundColor.css.attribute] = vm.backgroundColor.originalValue + vm.backgroundColor.css.units;
        this._css[vm.border.css.attribute] = vm.border.originalValue + vm.border.css.units;
        this._css[vm.borderColor.css.attribute] = vm.borderColor.originalValue + vm.borderColor.css.units;

        return this._css;
    };

    TextBlock.prototype.exportHtml = function() {
        return '<div class="widget widget-textblock" id="' + this.viewModel.exportId + '">' + this.viewModel.text.originalValue + '</div>';
    };

    return TextBlock;
});