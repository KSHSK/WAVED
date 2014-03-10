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
        // Set name
        this.name = new StringProperty({
            displayName: 'Name',
            value: 'Workspace'
        });

        // Set width
        var widthValue = 750;
        if (defined(state.width)) {
            widthValue = state.width.value;
        }

        this.width = new NumberProperty({
            displayName: 'Width',
            value: widthValue,
            validValue: createValidator({
                min: 1
            }),
            errorMessage: 'Value must be greater than 0'
        });

        // Set height
        var heightValue = 600;
        if (defined(state.height)) {
            heightValue = state.height.value;
        }

        this.height = new NumberProperty({
            displayName: 'Height',
            value: heightValue,
            validValue: createValidator({
                min: 1
            }),
            errorMessage: 'Value must be greater than 0'
        });
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