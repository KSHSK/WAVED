define([
        'knockout',
        'models/ComponentViewModel',
        'models/Widget/WidgetViewModel',
        'models/Property/StringProperty',
        'models/Property/NumberProperty',
        'models/Property/ArrayProperty',
        'models/Property/BooleanProperty',
        'modules/UniqueTracker',
        'util/defined',
        'util/createValidator'
    ],function(
        ko,
        ComponentViewModel,
        WidgetViewModel,
        StringProperty,
        NumberProperty,
        ArrayProperty,
        BooleanProperty,
        UniqueTracker,
        defined,
        createValidator){
    'use strict';

    var TextBlockViewModel = function(state, getDataSet) {
        state = (defined(state)) ? state : {};
        WidgetViewModel.call(this, state, getDataSet);

        if (!defined(state.name)) {
            var namespace = ComponentViewModel.getUniqueNameNamespace();
            this.name.originalValue = UniqueTracker.getDefaultUniqueValue(namespace, TextBlockViewModel.getType(), this);
        }

        // Text
        this.text = new StringProperty({
            displayName: 'Text',
            value: '',
            validValue: createValidator({
                minLength: 0,
                maxLength: 500
            }),
            textArea: true,
            errorMessage: 'Must be between 0 and 500 characters'
        });

        // Text Size
        this.textSize = new NumberProperty({
            displayName: 'Text Size (px)',
            value: 12,
            validValue: createValidator({
                min: 1
            }),
            errorMessage: 'Value must be greater than 0.'
        });

        // Text Align
        this.textAlign = new ArrayProperty({
            displayName: 'Text Align',
            value: 'Left',
            options: ['Left', 'Center', 'Right'],
            optionsCaption: null,
            errorMessage: 'Value is required.'
        });

        // Text Color
        this.textColor = new StringProperty({
            displayName: 'Text Color',
            value: 'Black'
        });

        // Bold
        this.textWeight = new BooleanProperty({
            displayName: 'Bold Text',
            value: false
        });

        // Underline
        this.textUnderline = new BooleanProperty({
            displayName: 'Underline Text',
            value: false
        });

        // Background Color
        this.backgroundColor = new StringProperty({
            displayName: 'Background Color',
            value: 'White'
        });

        // Border Size
        this.border = new NumberProperty({
            displayName: 'Border Size (px)',
            value: 1,
            validValue: createValidator({
                min: 0
            }),
            errorMessage: 'Value must be a positive number'
        });

        // Border Color
        this.borderColor = new StringProperty({
            displayName: 'Border Color',
            value: 'Black'
        });

        this.height.originalValue = 5;
        this.width.originalValue = 15;

        this.setState(state);

        ko.track(this);
    };

    /**
     * Static method that returns the type String for this class.
     */
    TextBlockViewModel.getType = function() {
        return 'TextBlock';
    };

    TextBlockViewModel.prototype = Object.create(WidgetViewModel.prototype);

    TextBlockViewModel.prototype.getState = function() {
        var state = WidgetViewModel.prototype.getState.call(this);
        state.type = TextBlockViewModel.getType();
        state.text = this.text.getState();
        state.textSize = this.textSize.getState();
        state.textAlign = this.textAlign.getState();
        state.textColor = this.textColor.getState();
        state.textWeight = this.textWeight.getState();
        state.textUnderline = this.textUnderline.getState();
        state.backgroundColor = this.backgroundColor.getState();
        state.border = this.border.getState();
        state.borderColor = this.borderColor.getState();

        return state;
    };

    TextBlockViewModel.prototype.setState = function(state) {
        WidgetViewModel.prototype.setState.call(this, state);

        if (defined(state.text)) {
            this.text.setState(state.text);
        }

        if (defined(state.textSize)) {
            this.textSize.setState(state.textSize);
        }

        if (defined(state.textAlign)) {
            this.textAlign.setState(state.textAlign);
        }

        if (defined(state.textColor)) {
            this.textColor.setState(state.textColor);
        }

        if (defined(state.textWeight)) {
            this.textWeight.setState(state.textWeight);
        }

        if (defined(state.textUnderline)) {
            this.textUnderline.setState(state.textUnderline);
        }

        if (defined(state.backgroundColor)) {
            this.backgroundColor.setState(state.backgroundColor);
        }

        if (defined(state.border)) {
            this.border.setState(state.border);
        }

        if (defined(state.borderColor)) {
            this.borderColor.setState(state.borderColor);
        }
    };

    Object.defineProperties(TextBlockViewModel.prototype, {
        properties: {
            get: function() {
                return [this.name, this.text, this.textSize, this.textColor, this.textAlign, this.textWeight,
                this.textUnderline, this.x, this.y, this.width, this.height, this.backgroundColor, this.border,
                this.borderColor, this.visible, this.logGoogleAnalytics, this.z, this.zIncrement, this.zDecrement];
            }
        }
    });

    return TextBlockViewModel;
});