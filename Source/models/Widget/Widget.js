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
        this._css.display.position = (this.viewModel.visible.value ? 'block' : 'none');
        this._css.left = this.viewModel.x.originalValue + '%';
        this._css.top = this.viewModel.y.originalValue + '%';
        this._css.height = this.viewModel.height.originalValue + '%';
        this._css.width = this.viewModel.width.originalValue + '%';
        this._css['z-index'] = this.viewModel.z.originalValue;

        return this._css;
    };

    return Widget;
});