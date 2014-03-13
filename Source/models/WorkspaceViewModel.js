/*global define*/
define([
        'models/SuperComponentViewModel',
        'models/Property/StringProperty',
        'models/Property/NumberProperty',
        'util/createValidator',
        'util/defined',
        'util/defaultValue',
        'knockout'
    ], function(
        SuperComponentViewModel,
        StringProperty,
        NumberProperty,
        createValidator,
        defined,
        defaultValue,
        ko){
    'use strict';

    // TODO: The constructor takes in (Object state) in the DD
    var WorkspaceViewModel = function(state) {
        state = defined(state) ? state : {};

        // Set name
        this.name = new StringProperty({
            displayName: 'Name',
            value: 'Workspace'
        });

        // Set width
        this.width = new NumberProperty({
            displayName: 'Width',
            value: 750,
            validValue: createValidator({
                min: 1
            }),
            errorMessage: 'Value must be greater than 0'
        });

        // Set height
        this.height = new NumberProperty({
            displayName: 'Height',
            value: 600,
            validValue: createValidator({
                min: 1
            }),
            errorMessage: 'Value must be greater than 0'
        });

        this.setState(state);

        ko.track(this);
    };

    WorkspaceViewModel.prototype = Object.create(SuperComponentViewModel.prototype);

    WorkspaceViewModel.prototype.getState = function() {
        var state = SuperComponentViewModel.prototype.getState.call(this);
        state.width = this.width.getState();
        state.height = this.height.getState();

        return state;
    };

    WorkspaceViewModel.prototype.setState = function(state) {
        if (defined(state.width)) {
            this.width.value = state.width.value;
        }

        if (defined(state.height)) {
            this.height.value = state.height.value;
        }
    };

    // TODO: In the DD, add getProperties() and getViewModel() to be consistent here
    Object.defineProperties(WorkspaceViewModel.prototype, {
        viewModel: {
            get: function() {
                return this;
            }
        },
        properties: {
            get: function() {
                return [this.width, this.height];
            }
        }
    });

    return WorkspaceViewModel;
});