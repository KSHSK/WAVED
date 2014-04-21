define([
        'models/Action/Action',
        'models/Data/DataSet',
        'modules/HistoryMonitor',
        'util/defined',
        'knockout',
        'jquery'
    ],function(
        Action,
        DataSet,
        HistoryMonitor,
        defined,
        ko,
        $
    ){
    'use strict';

    var PropertyAction = function(state) {
        var self = this;
        Action.call(this, state);

        this._newValues = {};

        this.apply = function(data) {
            var historyMonitor = HistoryMonitor.getInstance();

            var executeChange = function(data) {

                function getTemplateMatches(str) {
                    var index = 1;
                    var matches = [];
                    var templateRegex = /{{([\w]+)}}/g;
                    var match;
                    while ((match = templateRegex.exec(str)) !== null) {
                        matches.push(match[index]);
                    }
                    return matches;
                }

                for (var key in self._newValues) {
                   // TODO: Figure out work around to prevent error message
                   // for when a template is used in a NumberProperty.
                   var templates = getTemplateMatches(self._newValues[key]);
                    if (templates.length > 0) {
                        var temp = self._newValues[key];
                        if (typeof self._target.viewModel[key].value === 'number') {
                            temp = self._newValues[key].toString();
                        }

                        for (var i = 0; i < templates.length; i++) {
                            if (defined(data.data[templates[i]])) {
                                temp = temp.replace('{{' + templates[i]+ '}}', data.data[templates[i]]);
                            } else {
                                temp = temp.replace('{{' + templates[i]+ '}}', data[templates[i]]);
                            }
                        }

                        if (typeof self._target.viewModel[key].value === 'number') {
                            self._target.viewModel[key].value = parseFloat(temp);
                        } else {
                            self._target.viewModel[key].value = temp;
                        }
                    } else {
                        self._target.viewModel[key].value = self._newValues[key];
                    }
                }
            };

            // Don't add individual changes to the history.
            historyMonitor.executeIgnoreHistory(executeChange, data);
        };

        this.setState(state);
        // TODO: Validation, etc
        // TODO: target visibility conflicts with Action _target visibility, issue?
        // TODO: Make private in order to do type checking, validation, etc? Update DD with decision
        this.target = state.target;

        // TODO: Should this be private _dataSet? Update DD if changed.
        this.dataSet = state.dataSet;

        ko.track(this);
    };

    /**
     * Static method that returns the type String for this class.
     */
    PropertyAction.getType = function() {
        return 'PropertyAction';
    };

    PropertyAction.prototype = Object.create(Action.prototype);

    Object.defineProperties(PropertyAction.prototype, {
        newValues: {
            get: function() {
                return this._newValues;
            },
            set: function(newValues) {
                this._newValues = newValues;
            }
        }
    });

    PropertyAction.prototype.setState = function(state) {
        Action.prototype.setState.call(this, state);

        if (defined(state.newValues)) {
            this._newValues = state.newValues;
        }

        if (this._applyAutomatically) {
            this.apply();
        }
    };

    PropertyAction.prototype.getState = function() {
        var state = Action.prototype.getState.call(this);
        state.type = PropertyAction.getType();
        state.target = this._target.viewModel.name.value;
        state.newValues = this._newValues;
        return state;
    };

    PropertyAction.getType = function() {
        return 'PropertyAction';
    };

    return PropertyAction;
});