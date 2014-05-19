define([
        'models/ComponentViewModel',
        'models/Property/StringProperty',
        'models/Property/NumberProperty',
        'modules/UniqueTracker',
        'util/createValidator',
        'util/defined',
        'util/defaultValue',
        'knockout'
    ], function(
        ComponentViewModel,
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
    var DEFAULT_COLOR = 'White';

    var WorkspaceViewModel = function(state) {
        ComponentViewModel.call(this, state);
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

        UniqueTracker.addValueIfUnique(ComponentViewModel.getUniqueNameNamespace(), this.name.value, this);
        this.color = new StringProperty({
            displayName: 'Color',
            value: DEFAULT_COLOR
        });

        // Override so workspace is always on the bottom
        this.z.originalValue = 0;

        this.setState(state);

        ko.track(this);

        window.wavedWorkspace = this;
    };

    WorkspaceViewModel.prototype = Object.create(ComponentViewModel.prototype);

    WorkspaceViewModel.prototype.resetWorkspace = function() {
        this.width.originalValue = DEFAULT_WIDTH;
        this.height.originalValue = DEFAULT_HEIGHT;
        this.color.originalValue = DEFAULT_COLOR;
    };

    WorkspaceViewModel.prototype.getState = function() {
        var state = ComponentViewModel.prototype.getState.call(this);
        state.width = this.width.getState();
        state.height = this.height.getState();
        state.color = this.color.getState();

        return state;
    };

    WorkspaceViewModel.prototype.setState = function(state) {
        if (defined(state.width)) {
            this.width.setState(state.width);
        }

        if (defined(state.height)) {
            this.height.setState(state.height);
        }

        if (defined(state.color)) {
            this.color.setState(state.color);
        }
    };

    WorkspaceViewModel.prototype.getCss = function() {
        return '#waved-container {\n' +
            '\tposition: relative;\n' +
            '\twidth: ' + this.width.value + 'px;\n' +
            '\theight: ' + this.height.value + 'px;\n' +
            '\tbackground-color: ' + this.color.value + ';\n' +
        '}';
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
                return [this.width, this.height, this.color];
            }
        }
    });

    return WorkspaceViewModel;
});