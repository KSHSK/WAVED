define([
        'models/Property/StringProperty',
        'jquery',
        'util/defined',
        'util/createValidator',
        'util/getNamePropertyInstance',
        'knockout'
    ], function(
        StringProperty,
        $,
        defined,
        createValidator,
        getNamePropertyInstance,
        ko) {
    'use strict';

    var SuperComponentViewModel = function(state) {
        // Set name
        this.name = getNamePropertyInstance('Name', {
            namespace: 'component-name',
            item: this
        });

        ko.track(this);
    };

    Object.defineProperties(SuperComponentViewModel.prototype, {
        properties: {
            get: function() {
                return [this.name];
            }
        }
    });

    SuperComponentViewModel.prototype.getState = function() {
        return {
            'name': this.name.getState()
        };
    };

    SuperComponentViewModel.prototype.setState = function(state) {
        if (defined(state.name)) {
            this.name.value = state.name.value;
        }
    };

    return SuperComponentViewModel;
});