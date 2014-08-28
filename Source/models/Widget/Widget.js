define([
        'jquery'
    ],function(
        $){
    'use strict';

    var workspace = $('#waved-workspace');

    var Widget = function(state, getDataSet) {
        this._templateName = undefined; // Defined by subclasses.
        this._domElement = undefined; // Defined by subclasses.
        this.viewModel = undefined; // Defined by subclasses.
        this._css = {};
    };

    Object.defineProperties(Widget.prototype, {
        domElement: {
            get: function() {
                return this._domElement;
            }
        }
    });

    Widget.prototype.newWidgetContainer = function() {
        return $('<div>').addClass('widget-container');
    };

    Widget.prototype.addToWorkspace = function() {
        workspace.append(this._domElement);
    };

    Widget.prototype.removeFromWorkspace = function() {
        this._domElement.detach();
    };

    Widget.prototype.getCss = function() {
        var vm = this.viewModel;

        this._css.position = 'absolute';

        if (!vm.visible.css.ignore) {
            this._css[vm.visible.css.attribute] = vm.visible.css.options[vm.visible.originalValue.toString()];
        }

        if (!vm.x.css.ignore) {
            this._css[vm.x.css.attribute] = vm.x.originalValue + vm.x.css.units;
        }

        if (!vm.y.css.ignore) {
            this._css[vm.y.css.attribute] = vm.y.originalValue + vm.y.css.units;
        }

        if (!vm.height.css.ignore) {
            this._css[vm.height.css.attribute] = vm.height.originalValue + vm.height.css.units;
        }

        if (!vm.width.css.ignore) {
            this._css[vm.width.css.attribute] = vm.width.originalValue + vm.height.css.units;
        }

        if (!vm.z.css.ignore) {
            this._css[vm.z.css.attribute] = vm.z.originalValue + vm.z.css.units;
        }

        return this._css;
    };

    return Widget;
});