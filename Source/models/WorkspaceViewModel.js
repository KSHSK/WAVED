/*global define*/
define([
        'models/SuperComponentViewModel',
        'models/Property/StringProperty',
        'models/Property/NumberProperty',
        'util/defined',
        'knockout'
    ], function(
        SuperComponentViewModel,
        StringProperty,
        NumberProperty,
        defined,
        ko){
    'use strict';

    // TODO: The constructor takes in (Object state) in the DD
    var WorkspaceViewModel = function(width, height) {

        this.name = new StringProperty({
            displayName: 'Name',
            value: 'Workspace'
        });

        var widthOptions;
        if (defined(width)) {
            widthOptions = {
                displayName: width.displayName,
                value: width.value
            };
        }
        else {
            widthOptions = {
                displayName: 'Width',
                value: 750
            };
        }
        this.width = new NumberProperty(widthOptions);

        var heightOptions;
        if (defined(height)) {
            heightOptions = {
                displayName: height.displayName,
                value: height.value
            };
        }
        else {
            heightOptions = {
                displayName: 'Height',
                value: 600
            };
        }
        this.height = new NumberProperty(heightOptions);

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
        // TODO
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