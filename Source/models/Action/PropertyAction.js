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
                        if (typeof self._target[key].value === 'number') {
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

                        if (typeof self._target[key].value === 'number') {
                            self._target[key].value = parseFloat(temp);
                        }
                        else {
                            self._target[key].value = temp;
                        }
                    }
                    else {
                        // For values that have nested props, properly set them here (e.g. ArrayProperty)
                        if(defined(self._target[key].getSubscribableNestedProperties())) {
                            self._target[key].getSubscribableNestedProperties().forEach(function(prop) {
                                if(prop.getType() === self._newValues[key].value.type) {

                                    // Set the value to the proper property
                                    self._target[key].value = prop;

                                    // Iterate through the nested properties and set them appropriately
                                    for(var nestKey in self._newValues[key].value) {
                                        if(nestKey === 'type'){
                                            // Don't look at type, it's just an identifier, not a real property
                                            continue;
                                        }

                                        if(self._newValues[key].value[nestKey].value.type === 'DataSet' || self._newValues[key].value[nestKey].value.type === 'DataSubset') {
                                            self._target[key].value[nestKey].displayOptions.forEach(function(displayOption) {
                                                if(displayOption.name === self._newValues[key].value[nestKey].value.name) {
                                                    self._target[key].value[nestKey].value = displayOption;
                                                }
                                            });
                                        }
                                        else {
                                            self._target[key].value[nestKey].value = self._newValues[key].value[nestKey].value;
                                        }
                                    }

                                    /*
                                     * Set this AFTER setting all the properties due to glyph rendering issue
                                     * If set before setting the values of the properties, glyphs will render before the nested properties are set
                                     */
                                    self._target[key].value = prop; // Set the value to the proper property
                                }
                            });
                        }
                        else {
                            // This else-statement deals with non-nested properties

                            // Deal with ArrayProperties with DataSets/Subsets
                            var type = self._newValues[key].value.type;
                            if (defined(type) && (type === 'DataSet' || type === 'DataSubset')) {
                                self._target[key].displayOptions.forEach(function(displayOption) {
                                    if(displayOption.name === self._newValues[key].value.name) {
                                        self._target[key].value = displayOption;
                                    }
                                });
                            }
                            else {
                                self._target[key].value = self._newValues[key].value;
                            }
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

    Object.defineProperties(PropertyAction.prototype, {
        type : {
            get: function() {
                return PropertyAction.getType();
            }
        },
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
        state.target = this._target.name.value;
        state.newValues = this._newValues;

        return state;
    };

    PropertyAction.getType = function() {
        return 'PropertyAction';
    };

    PropertyAction.getHelperFunctionsJs = function() {
        var js = '';

        js += 'function getTemplateMatches(str) {\n';
        js += '\tvar index = 1;\n';
        js += '\tvar matches = [];\n';
        js += '\tvar templateRegex = /{{([ _.\\w]+)}}/g;\n';
        js += '\tvar match;\n';
        js += '\twhile ((match = templateRegex.exec(str)) !== null) {\n';
        js += '\t\tmatches.push(match[index]);\n';
        js += '\t}\n';
        js += '\treturn matches;\n';
        js += '}\n\n';

        js += 'var defined = function(value) {\n';
        js += '\treturn (typeof value !== \'undefined\');\n';
        js += '};\n';

        // TODO: Make sure USMap has 'state' as a root level attribute in triggerData.
        js += 'function replaceTemplates(triggerName, actionValue) {\n';
        js += '\tvar templates = getTemplateMatches(actionValue);\n';
        js += '\tif (templates.length > 0) {\n';
        js += '\t\tvar temp = actionValue;\n';
        js += '\t\tif (typeof actionValue === \'number\') {\n';
        js += '\t\t\ttemp = actionValue.toString();\n';
        js += '\t\t}\n';
        js += '\n';
        js += '\t\tfor (var i = 0; i < templates.length; i++) {\n';
        js += '\t\t\tif (defined(widgets[triggerName].triggerData[templates[i]])) {\n';
        js += '\t\t\t\ttemp = temp.replace(\'{{\' + templates[i]+ \'}}\', widgets[triggerName].triggerData[templates[i]]);\n';
        js += '\t\t\t}\n';
        js += '\t\t\telse {\n';
        js += '\t\t\t\tvar index = templates[i].indexOf(\'.\');\n';
        js += '\t\t\t\tif (index > -1) {\n';
        js += '\t\t\t\t\tvar dataName = templates[i].slice(0, index);\n';
        js += '\t\t\t\t\tvar fieldName = templates[i].slice(index + 1);\n';
        js += '\t\t\t\t\tvar triggerData = widgets[triggerName].triggerData[dataName];\n';
        js += '\t\t\t\t\tif (defined(triggerData) && defined(triggerData[fieldName])) {\n';
        js += '\t\t\t\t\t\ttemp = temp.replace(\'{{\' + templates[i] + \'}}\', triggerData[fieldName]);\n';
        js += '\t\t\t\t\t}\n';
        js += '\t\t\t\t}\n';
        js += '\t\t\t}\n';
        js += '\t\t}\n';
        js += '\n\n';
        js += '\t\tvar returnValue;\n';
        js += '\t\tif (typeof actionValue === \'number\') {\n';
        js += '\t\t\treturnValue = parseFloat(temp);\n';
        js += '\t\t}\n';
        js += '\t\telse {\n';
        js += '\t\t\treturnValue = temp;\n';
        js += '\t\t}\n\n';
        js += '\t\treturn returnValue;\n';
        js += '\t}\n';
        js += '}\n';

        return js;
    };

    return PropertyAction;
});
