define([
        'models/Property/StringProperty',
        'jquery',
        'util/defined',
        'util/createValidator',
        'knockout'
    ], function(
        StringProperty,
        $,
        defined,
        createValidator,
        ko) {
    'use strict';

    var SuperComponentViewModel = function(state) {
        // Set name
        this.name = new StringProperty({
            displayName: 'Name',
            value: '',
            validValue: createValidator({
                regex: new RegExp('^[a-zA-Z0-9_\\- ]+$'),
                minLength: 1,
                maxLength: 50
            }),
            errorMessage: 'May only contain alphanumerics, hypens (-), underscores(_) and spaces.'
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