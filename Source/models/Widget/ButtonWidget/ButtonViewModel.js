define([
        'models/Event/Trigger',
        'models/Property/StringProperty',
        'models/Widget/WidgetViewModel',
        'util/defined',
        'util/createValidator',
        'knockout',
        'models/Property/GlyphSize/GlyphSizeSelectionProperty',
        'models/Constants/GlyphSizeSchemeType'
    ],function(
        Trigger,
        StringProperty,
        WidgetViewModel,
        defined,
        createValidator,
        ko,
        GlyphSizeSelectionProperty,
        GlyphSizeSchemeType){
    'use strict';

    var ButtonViewModel = function(state) {
        state = (defined(state)) ? state : {};
        WidgetViewModel.call(this, state);

        // Set label
        this.label = new StringProperty({
            displayName: 'Label',
            value: '',
            validValue: createValidator({
                minLength: 1,
                maxLength: 50
            }),
            errorMessage: 'Must be between 1 and 50 characters'
        });

        this.height.value = 5;
        this.width.value = 10;

        var fooOptions = {
            displayName: 'GlyphSize',
            value: ''
        };
        this.foo = new GlyphSizeSelectionProperty(fooOptions, this);

        this.setState(state);

        // TODO: Figure out how Triggers should actually work.
        this._triggers.push(new Trigger({
            name: 'Button'
        }));

        ko.track(this);
    };

    /**
     * Static method that returns the type String for this class.
     */
    ButtonViewModel.getType = function() {
        return 'Button';
    };

    ButtonViewModel.prototype = Object.create(WidgetViewModel.prototype);

    ButtonViewModel.prototype.getState = function() {
        var state = WidgetViewModel.prototype.getState.call(this);
        state.type = ButtonViewModel.getType();
        state.label = this.label.getState();
        state.foo = this.foo.getState(); // TODO: Remove

        return state;
    };

    ButtonViewModel.prototype.setState = function(state) {
        WidgetViewModel.prototype.setState.call(this, state);

        if (defined(state.label)) {
            this.label.value = state.label.value;
        }

        // A new GlyphSizeSelectionProperty is created here because it requires state.foo.value to property
        // set the dropdown to the correct selection
        if (defined(state.foo)){
            this.foo.setSelectedFromState(state.foo, this);
        }
    };

    Object.defineProperties(ButtonViewModel.prototype, {
        properties: {
            get: function() {
                return [this.name, this.label, this.x, this.y, this.width, this.height, this.visible,
                this.logGoogleAnalytics, this.foo]; // TODO: Remove
            }
        }
    });

    return ButtonViewModel;
});