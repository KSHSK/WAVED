define([
        'jquery',
        'knockout',
        'models/Property/StringProperty',
        'modules/UniqueTracker',
        'util/defined',
        'util/createValidator',
        'util/getNamePropertyInstance'
    ], function(
        $,
        ko,
        StringProperty,
        UniqueTracker,
        defined,
        createValidator,
        getNamePropertyInstance) {
    'use strict';

    var SuperComponentViewModel = function(state) {
        // Set name
        this._name = getNamePropertyInstance('Name', {
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
        },
        name: {
            get: function() {
                return this._name;
            },
            set: function(value) {
                var success = UniqueTracker.addValueIfUnique(SuperComponentViewModel.getUniqueNameNamespace(), value,
                    this);
                if (success) {
                    this._name = value;
                }
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