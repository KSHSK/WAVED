/*global define*/
/**
 * A module for Google Analytics integration
 */
define([
        'models/Property/StringProperty',
        'util/createValidator',
        'util/defined',
        'util/defaultValue',
        'knockout',
        'jquery'
    ], function(
        StringProperty,
        createValidator,
        defined,
        defaultValue,
        ko,
        $) {
    'use strict';

    var self;
    var GoogleAnalytics = function(state) {
        self = this;
        state = defined(state) ? state : {};

        this.uaCode = new StringProperty({
            displayName: 'UA Code: ',
            value: '',
            validValue: createValidator({
                minLength: 1,
                regex: new RegExp('^((UA)(-)(\\d+)(-)(\\d+)){1}$', 'i')
            }),
            errorMessage: 'UA code is not in the correct format. It should look like UA-####-##.'
        });

        this.eventCategory = new StringProperty({
            displayName: 'UA Code: ',
            value: '',
            validValue: createValidator({
                minLength: 1,
                regex: new RegExp('^[a-zA-Z0-9_\\- ]+$', 'i')
            }),
            errorMessage: 'May only contain alphanumerics, hypens (-), underscores(_) and spaces.'
        });

        this._bound = false;

        this.setState(state);

        ko.track(this);
    };

    Object.defineProperties(GoogleAnalytics.prototype, {
        bound: {
            get: function() {
                return this._bound;
            }
        }
    });

    // TODO: Add to DD.
    GoogleAnalytics.prototype.getState = function() {
        return {
            'uaCode': this.uaCode.getState(),
            'eventCategory': this.eventCategory.getState(),
            'bound': this.bound
        };
    };

    // TODO: Add to DD.
    GoogleAnalytics.prototype.setState = function(state) {
        if (defined(state.uaCode)) {
            this.uaCode.value = state.uaCode.value;
        }

        if (defined(state.eventCategory)) {
            this.eventCategory.value = state.eventCategory.value;
        }

        if (defined(state.bound)) {
            this._bound = state.bound;
        }
    };

    GoogleAnalytics.prototype.set = function() {
        if (!self.uaCode.error && !self.eventCategory.error) {
            self._bound = true;
        }
        else {
            if (self.uaCode.error) {
                self.uaCode.message = self.uaCode.errorMessage;
            }
            if (self.eventCategory.error) {
                self.eventCategory.message = self.eventCategory.errorMessage;
            }
        }
    };

    GoogleAnalytics.prototype.unset = function() {
        self._bound = false;
    };

    GoogleAnalytics.prototype.clear = function() {
        if (self.uaCode._value === '') {
            // needed to force knockout to update UI input
            self.uaCode._value = ' ';
        }
        self.uaCode._value = '';
        self.uaCode.error = true;
        self.uaCode.message = '';

        if (self.eventCategory._value === '') {
            // needed to force knockout to update UI input
            self.eventCategory._value = ' ';
        }
        self.eventCategory._value = '';
        self.eventCategory.error = true;
        self.eventCategory.message = '';
    };

    return GoogleAnalytics;
});