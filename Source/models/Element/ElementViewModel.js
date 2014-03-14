define([
        'models/ComponentViewModel',
        'jquery',
        'util/defined',
        'util/defaultValue'
    ], function(
        ComponentViewModel,
        $,
        defined,
        defaultValue) {
    'use strict';

    var ElementViewModel = function(state) {
        ComponentViewModel.call(this, state);
    };

    // TODO: DD doesn't have this, but probably a good idea anyway?
    Object.defineProperties(ElementViewModel.prototype, {
        properties: {
            get: function() {
                return [this._name, this.visible, this.logGoogleAnalytics];
            }
        }
    });

    ElementViewModel.prototype = Object.create(ComponentViewModel.prototype);

    return ElementViewModel;
});