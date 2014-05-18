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

    Widget.prototype.exportCss = function() {
        var css = '#' + this.viewModel.name.value + ' {\n' +
            '\tposition: relative;\n' +
            '\tdisplay: ' + (this.viewModel.visible.value ? 'block' : 'none') + ';\n' +
            '\tleft: ' + this.viewModel.x.originalValue + '%;\n' +
            '\ttop: ' + this.viewModel.y.originalValue + '%;\n' +
            '\theight: ' + this.viewModel.height.originalValue + '%;\n' +
            '\twidth: ' + this.viewModel.width.originalValue + '%;\n' +
            '\tz-index: ' + this.viewModel.z.originalValue + ';\n' +
        '}';

        return css;
    };

    return Widget;
});