define([
        'jquery'
    ],function(
        $){
    'use strict';

    var workspace = $('#waved-workspace');

    var Widget = function(state, getDataSet) {
        this._templateName = undefined; // Defined by subclasses.
        this.domElement = undefined; // Defined by subclasses.
        this.viewModel = undefined; // Defined by subclasses.
    };

    Widget.prototype.newWidgetContainer = function() {
        return $('<div>').addClass('widget-container');
    };

    Widget.prototype.addToWorkspace = function() {
        workspace.append(this.domElement);
    };

    Widget.prototype.removeFromWorkspace = function() {
        this.domElement.detach();
    };

    return Widget;
});