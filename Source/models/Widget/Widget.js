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
        this._css.position = 'absolute';

        if (!this.viewModel.visible.css.ignore) {
            this._css[this.viewModel.visible.css.attribute] = this.viewModel.visible.css.options[this.viewModel.visible.originalValue.toString()];
        }

        if (!this.viewModel.x.css.ignore) {
            this._css[this.viewModel.x.css.attribute] = this.viewModel.x.originalValue + this.viewModel.x.css.units;
        }

        if (!this.viewModel.y.css.ignore) {
            this._css[this.viewModel.y.css.attribute] = this.viewModel.y.originalValue + this.viewModel.y.css.units;
        }

        if (!this.viewModel.height.css.ignore) {
            this._css[this.viewModel.height.css.attribute] = this.viewModel.height.originalValue + this.viewModel.height.css.units;
        }

        if (!this.viewModel.width.css.ignore) {
            this._css[this.viewModel.width.css.attribute] = this.viewModel.width.originalValue + this.viewModel.height.css.units;
        }

        if (!this.viewModel.z.css.ignore) {
            this._css[this.viewModel.z.css.attribute] = this.viewModel.z.originalValue + this.viewModel.z.css.units;
        }

        return this._css;
    };

    return Widget;
});