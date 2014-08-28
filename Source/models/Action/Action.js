define(['jquery',
        'knockout',
        'models/Property/StringProperty',
        'modules/UniqueTracker',
        'modules/PropertyChangeSubscriber',
        'util/createValidator',
        'util/defined',
        'util/subscribeObservable'
    ],function(
        $,
        ko,
        StringProperty,
        UniqueTracker,
        PropertyChangeSubscriber,
        createValidator,
        defined,
        subscribeObservable
    ){
    'use strict';

    var Action = function(state) {
        state = defined(state) ? state : {};

        this._name = '';
        this._applyAutomatically  = false;

        ko.track(this);
    };

    Action.getUniqueNameNamespace = function() {
        return 'action-name';
    };

    Object.defineProperties(Action.prototype, {
        name: {
            get: function() {
                return this._name;
            },
            set: function(value) {
                var success = UniqueTracker.addValueIfUnique(Action.getUniqueNameNamespace(), value, this);
                if (success) {
                    this._name = value;
                }
            }
        },
        applyAutomatically: {
            get: function() {
                return this._applyAutomatically;
            },
            set: function(value) {
                this._applyAutomatically = value;
            }
        }
    });

    Action.prototype.setState = function(state) {
        if (defined(state.name)) {
            this.name = state.name;
        }

        if (defined(state.applyAutomatically)) {
            this._applyAutomatically = state.applyAutomatically;
        }
    };

    Action.prototype.getState = function() {
        return {
            'name': this._name,
            'applyAutomatically': this._applyAutomatically
        };
    };

    Action.prototype.subscribed = false;

    Action.prototype.subscribeChanges = function() {
        var self = this;
        var propertyChangeSubscriber = PropertyChangeSubscriber.getInstance();

        var properties = [];
        for (var prop in this) {
            if (this.hasOwnProperty(prop)) {
                properties.push(prop);
            }
        }

        properties.forEach(function(prop) {
            // Subscribe undo change.
            propertyChangeSubscriber.subscribeBeforeChange(self, prop);

            // Subscribe redo change.
            propertyChangeSubscriber.subscribeChange(self, prop);
        });

        this.subscribed = true;
    };

    Action.getHelperFunctionsJs = function() {
        var js = '';

        js += '// Template Helper Functions\n';
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
        js += '};\n\n';

        js += 'function replaceTemplates(triggerName, actionValue) {\n';
        js += '\tif (!defined(triggerName) || !defined(widgets[triggerName])) {\n';
        js += '\t\treturn actionValue;\n';
        js += '\t}\n';
        js += '\tvar templates = getTemplateMatches(actionValue);\n';
        js += '\tif (templates.length === 0) {\n';
        js += '\t\treturn actionValue;\n';
        js += '\t}\n';
        js += '\tvar temp = actionValue;\n';
        js += '\tif (typeof actionValue === \'number\') {\n';
        js += '\t\ttemp = actionValue.toString();\n';
        js += '\t}\n';
        js += '\n';
        js += '\tfor (var i = 0; i < templates.length; i++) {\n';
        js += '\t\tif (defined(widgets[triggerName].triggerData[templates[i]])) {\n';
        js += '\t\t\ttemp = temp.replace(\'{{\' + templates[i]+ \'}}\', widgets[triggerName].triggerData[templates[i]]);\n';
        js += '\t\t}\n';
        js += '\t\telse {\n';
        js += '\t\t\tvar index = templates[i].indexOf(\'.\');\n';
        js += '\t\t\tif (index > -1) {\n';
        js += '\t\t\t\tvar dataName = templates[i].slice(0, index);\n';
        js += '\t\t\t\tvar fieldName = templates[i].slice(index + 1);\n';
        js += '\t\t\t\tvar triggerData = widgets[triggerName].triggerData[dataName];\n';
        js += '\t\t\t\tif (defined(triggerData) && defined(triggerData[fieldName])) {\n';
        js += '\t\t\t\t\ttemp = temp.replace(\'{{\' + templates[i] + \'}}\', triggerData[fieldName]);\n';
        js += '\t\t\t\t}\n';
        js += '\t\t\t}\n';
        js += '\t\t}\n';
        js += '\t}\n';
        js += '\n\n';
        js += '\tvar returnValue;\n';
        js += '\tif (typeof actionValue === \'number\') {\n';
        js += '\t\treturnValue = parseFloat(temp);\n';
        js += '\t}\n';
        js += '\telse {\n';
        js += '\t\treturnValue = temp;\n';
        js += '\t}\n\n';
        js += '\treturn returnValue;\n';
        js += '}\n\n';

        return js;
    };

    return Action;
});
