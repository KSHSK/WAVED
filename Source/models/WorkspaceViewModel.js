define([
        'models/SuperComponentViewModel',
        'models/Property/StringProperty',
        'models/Property/NumberProperty',
        'modules/UniqueTracker',
        'util/createValidator',
        'util/defined',
        'util/defaultValue',
        'knockout'
    ], function(
        SuperComponentViewModel,
        StringProperty,
        NumberProperty,
        UniqueTracker,
        createValidator,
        defined,
        defaultValue,
        ko){
    'use strict';

    var DEFAULT_WIDTH = 750;
    var DEFAULT_HEIGHT = 600;

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
            value: DEFAULT_WIDTH,
            validValue: createValidator({
                min: 1
            }),
            errorMessage: 'Value must be greater than 0'
        });

        // Set height
        this.height = new NumberProperty({
            displayName: 'Height',
            value: DEFAULT_HEIGHT,
            validValue: createValidator({
                min: 1
            }),
            errorMessage: 'Value must be greater than 0'
        });

        UniqueTracker.addValueIfUnique(SuperComponentViewModel.getUniqueNameNamespace(), this.name.value, this);

        this.setState(state);

        ko.track(this);

        window.wavedWorkspace = this;
    };

    WorkspaceViewModel.prototype = Object.create(SuperComponentViewModel.prototype);

    WorkspaceViewModel.prototype.resetWorkspace = function() {
        this.width.value = DEFAULT_WIDTH;
        this.height.value = DEFAULT_HEIGHT;
    };

    WorkspaceViewModel.prototype.getState = function() {
        var state = SuperComponentViewModel.prototype.getState.call(this);
        state.width = this.width.getState();
        state.height = this.height.getState();

        return state;
    };

    WorkspaceViewModel.prototype.setState = function(state) {
        if (defined(state.width)) {
            this.width.originalValue = state.width.value;
        }

        if (defined(state.height)) {
            this.height.originalValue = state.height.value;
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