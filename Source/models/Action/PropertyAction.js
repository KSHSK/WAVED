define([
        'models/Action/Action',
        'models/Data/DataSet',
        'models/Constants/ActionType',
        'modules/HistoryMonitor',
        'util/defined',
        'knockout',
        'jquery'
    ],function(
        Action,
        DataSet,
        ActionType,
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
        this._target = undefined;

        this.apply = function(data) {
            var historyMonitor = HistoryMonitor.getInstance();

            var executeChange = function(data) {

                function getTemplateMatches(str) {
                    var index = 1;
                    var matches = [];
                    var templateRegex = /{{([ _.\w]+)}}/g;
                    var match;
                    while ((match = templateRegex.exec(str)) !== null) {
                        matches.push(match[index]);
                    }
                    return matches;
                }

                for (var key in self._newValues) {
                    var templates = getTemplateMatches(self._newValues[key].value);
                    if (templates.length > 0) {
                        var temp = self._newValues[key].value;
                        if (typeof self._target.viewModel[key].value === 'number') {
                            temp = self._newValues[key].value.toString();
                        }

                        for (var i = 0; i < templates.length; i++) {
                            if (defined(data.trigger) && defined(data.trigger[templates[i]])) {
                                temp = temp.replace('{{' + templates[i]+ '}}', data.trigger[templates[i]]);
                            }
                            else {
                                var index = templates[i].indexOf('.');
                                if (index > -1) {
                                    var dataName = templates[i].slice(0, index);
                                    var fieldName = templates[i].slice(index + 1);
                                    if (defined(data[dataName]) && defined(data[dataName][fieldName])) {
                                        temp = temp.replace('{{' + templates[i] + '}}', data[dataName][fieldName]);
                                    }
                                }
                            }
                        }

                        if (typeof self._target.viewModel[key].value === 'number') {
                            self._target.viewModel[key].value = parseFloat(temp);
                        }
                        else {
                            self._target.viewModel[key].value = temp;
                        }
                    }
                    else {
                        // For values that have nested props, properly set them here (e.g. ArrayProperty)
                        if(defined(self._target.viewModel[key].getSubscribableNestedProperties())) {
                            self._target.viewModel[key].getSubscribableNestedProperties().forEach(function(prop) {
                                if(prop.getType() === self._newValues[key].value.type) {
                                    // Set the value to the proper property
                                    self._target.viewModel[key].value = prop;

                                    // Iterate through the nested properties and set them appropriately
                                    for(var nestKey in self._newValues[key].value) {
                                        if(nestKey === 'type'){
                                            // Don't look at type, it's just an identifier, not a real property
                                            continue;
                                        }

                                        if(self._newValues[key].value[nestKey].value.type === 'DataSet' || self._newValues[key].value[nestKey] === 'DataSubset') {
                                            self._target.viewModel[key].value[nestKey].displayOptions.forEach(function(displayOption) {
                                                if(displayOption.name === self._newValues[key].value[nestKey].value.name) {
                                                    self._target.viewModel[key].value[nestKey].value = displayOption;
                                                }
                                            });
                                        }
                                        else {
                                            self._target.viewModel[key].value[nestKey].value = self._newValues[key].value[nestKey].value;
                                        }
                                    }
                                }
                            });
                        }
                        else {
                            self._target.viewModel[key].value = self._newValues[key].value;
                        }
                    }
                }
            };

            // TODO: Is this necessary?
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
        return ActionType.PROPERTY_ACTION;
    };

    PropertyAction.prototype = Object.create(Action.prototype);

    PropertyAction.prototype.getType = function() {
        return PropertyAction.getType();
    };

    Object.defineProperties(PropertyAction.prototype, {
        target: {
            get: function() {
                return this._target;
            },
            set: function(target) {
                this._target = target;
            }
        },
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

        if (defined(state.target)) {
            this._target = state.target;
        }

        if (defined(state.newValues)) {
            this.newValues = state.newValues;
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
