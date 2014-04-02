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

    return Widget;
});