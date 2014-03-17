define([
        'jquery',
        'knockout',
        'models/Property/StringProperty',
        'util/defined',
        'util/createValidator',
        'util/getNamePropertyInstance'
    ], function(
        $,
        ko,
        StringProperty,
        defined,
        createValidator,
        getNamePropertyInstance) {
    'use strict';

    var SuperComponentViewModel = function(state) {
        // Set name
        this.name = getNamePropertyInstance('Name', {
            namespace: SuperComponentViewModel.getUniqueNameNamespace(),
            item: this
        });

        ko.track(this);
    };

    SuperComponentViewModel.getUniqueNameNamespace = function() {
        return 'component-name';
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

    SuperComponentViewModel.prototype.subscriptions = [];

    SuperComponentViewModel.prototype.subscribeChanges = function(setDirty) {
        var self = this;

        this.properties.forEach(function(prop) {
            var subscription = ko.getObservable(prop, '_value').subscribe(function(newValue) {
                setDirty();
            });

            self.subscriptions.push(subscription);
        });
    };

    return SuperComponentViewModel;
});