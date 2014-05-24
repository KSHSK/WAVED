define([
        './Property',
        'util/defined',
        'util/defaultValue',
        'models/Constants/PropertyTemplateName',
        'knockout',
        'jqueryUI'
    ],function(
        Property,
        defined,
        defaultValue,
        PropertyTemplateName,
        ko,
        $
    ){
    'use strict';

    var ListProperty = function(opts) {
        opts = defined(opts) ? opts : {};
        Property.call(this, opts);

        this._templateName = PropertyTemplateName.LIST;

        this._options = [];
        this._value = '';

        this.add = opts.add;
        this.edit = opts.edit;
        this.remove = opts.remove;

        // Set a default isValidValue function if necessary.
        if (!defined(opts.validValue)) {
            this.isValidValue = function(value) {
                if (!defined(value)) {
                    return true;
                }

                if (defined(this._options) && this._options.length > 0) {
                    return (this._options.indexOf(value) !== -1);
                }

                return true;
            };
        }

        if(!defined(opts.getOptionText)) {
            this.getOptionText = function(value){
                return value;
            };
        }

        this.setState(opts);

        this.updateUI = function() {
            $('.add-icon-button').button({
                text: false,
                icons: {
                    primary: 'ui-icon-plus'
                }
            });

            $('.edit-icon-button').button({
                text: false,
                icons: {
                    primary: 'ui-icon-pencil'
                }
            });

            $('.delete-icon-button').button({
                text: false,
                icons: {
                    primary: 'ui-icon-trash'
                }
            });
        };

        ko.track(this);
    };

    ListProperty.prototype = Object.create(Property.prototype);

    Object.defineProperties(ListProperty.prototype, {
        options: {
            get: function() {
                return this._options;
            },
            set: function(options) {
                if (Array.isArray(options)) {
                    this._options = options;
                    if (options.indexOf(this._value) === -1) {
                        this._value = undefined;
                    }
                }
            }
        },
        value: {
            get: function() {
                return this._value;
            },
            set: function(value) {
                if (this.isValidValue(value)) {
                    this.error = false;
                    this.message = '';
                    this._value = value;
                }
                else {
                    this.error = true;
                    this.message = this.errorMessage;
                }
            }
        }
    });

    ListProperty.prototype.getState = function() {
        var state = Property.prototype.getState.call(this);
        state.options = this.options;
        return state;
    };

    ListProperty.prototype.getDisplayState = function() {
        var displayState = Property.prototype.getDisplayState.call(this);
        displayState.options = this.options;
        return displayState;
    };

    ListProperty.prototype.setState = function(state) {
        this._options = defaultValue(state.options, []);
        this.getOptionText = state.getOptionText;

        // Need to call this after this._options is set, so the isValidValue function works.
        Property.prototype.setState.call(this, state);
    };

    return ListProperty;
});