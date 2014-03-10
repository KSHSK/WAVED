/*global define*/
/**
 * A module for Google Analytics integration
 */
define([
        'models/Property/StringProperty',
        'util/createValidator',
        'util/defined',
        'knockout',
        'jquery'
    ], function(
        StringProperty,
        createValidator,
        defined,
        ko,
        $) {
    'use strict';

    var self;
    var GoogleAnalytics = function(state) {
        self = this;
        state = defined(state) ? state : {};
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
        };
    };

    // TODO: Add to DD.
    GoogleAnalytics.prototype.setState = function(state) {
        var uaCodeValue = '';
        if (defined(state.uaCode)) {
            uaCodeValue = state.uaCode.value;
        }

        this.uaCode = new StringProperty({
            displayName: 'UA Code: ',
            value: uaCodeValue,
            validValue: createValidator({
                minLength: 1,
                regex: new RegExp('^((UA)(-)(\\d+)(-)(\\d+)){1}$', 'i')
            }),
            errorMessage: 'UA code is not in the correct format. It should look like UA-####-##.'
        });

        var eventCategoryValue = '';
        if (defined(state.eventCategory)) {
            eventCategoryValue = state.eventCategory.value;
        }

        this.eventCategory = new StringProperty({
            displayName: 'UA Code: ',
            value: eventCategoryValue,
            validValue: createValidator({
                minLength: 1,
                regex: new RegExp('^[a-zA-Z0-9_\\- ]+$', 'i')
            }),
            errorMessage: 'May only contain alphanumerics, hypens (-), underscores(_) and spaces.'
        });

        this._bound = false;
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