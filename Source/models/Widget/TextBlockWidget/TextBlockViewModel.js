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
            errorMessage: 'Value is required.',
            validValue: function(value) {
                if (value === undefined) {
                    return true;
                }

                if (defined(this._options) && this._options.length > 0) {
                    return (this.options.indexOf(value) !== -1);
                }

                return true;
            }
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

        // Italics
        this.textItalic = new BooleanProperty({
            displayName: 'Italicize Text',
            value: false
        });

        // Background Color
        this.backgroundColor = new StringProperty({
            displayName: 'Background Color',
            value: 'White'
        });

        // Border Size
        this.border = new NumberProperty({
            displayName: 'Border Size',
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

        // Background Color
        this.borderRadius = new NumberProperty({
            displayName: 'Border Radius (px)',
            value: 5,
            validValue: createValidator({
                min: 0
            }),
            errorMessage: 'Value must be a positive number'
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
        state.textItalic = this.textItalic.getState();
        state.backgroundColor = this.backgroundColor.getState();
        state.border = this.border.getState();
        state.borderColor = this.borderColor.getState();
        state.borderRadius = this.borderRadius.getState();

        return state;
    };

    TextBlockViewModel.prototype.setState = function(state) {
        WidgetViewModel.prototype.setState.call(this, state);

        if (defined(state.text)) {
            this.text.originalValue = state.text.value;
        }

        if (defined(state.textSize)) {
            this.textSize.originalValue = state.textSize.value;
        }

        if (defined(state.textAlign)) {
            this.textAlign.originalValue = state.textAlign.value;
        }

        if (defined(state.textColor)) {
            this.textColor.originalValue = state.textColor.value;
        }

        if (defined(state.textWeight)) {
            this.textWeight.originalValue = state.textWeight.value;
        }

        if (defined(state.textUnderline)) {
            this.textUnderline.originalValue = state.textUnderline.value;
        }

        if (defined(state.textItalic)) {
            this.textItalic.originalValue = state.textItalic.value;
        }

        if (defined(state.backgroundColor)) {
            this.backgroundColor.originalValue = state.backgroundColor.value;
        }

        if (defined(state.border)) {
            this.border.originalValue = state.border.value;
        }

        if (defined(state.borderColor)) {
            this.borderColor.originalValue = state.borderColor.value;
        }

        if (defined(state.borderRadius)) {
            this.borderRadius.originalValue = state.borderRadius.value;
        }
    };

    Object.defineProperties(TextBlockViewModel.prototype, {
        properties: {
            get: function() {
                return [this.name, this.text, this.textSize, this.x, this.y, this.width, this.height, this.textColor,
                this.textAlign, this.textWeight, this.textUnderline, this.textItalic, this.backgroundColor,
                this.border, this.borderColor, this.borderRadius, this.visible, this.logGoogleAnalytics, this.z,
                this.zIncrement, this.zDecrement];
            }
        }
    });

    return TextBlockViewModel;
});