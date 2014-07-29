define(['knockout',
        'models/Property/StringProperty',
        'modules/ReadData',
        'modules/UniqueTracker',
        'modules/PropertyChangeSubscriber',
        'util/defined',
        'util/createValidator',
        'util/subscribeObservable',
        'd3',
        'jquery'
    ],function(
        ko,
        StringProperty,
        ReadData,
        UniqueTracker,
        PropertyChangeSubscriber,
        defined,
        createValidator,
        subscribeObservable,
        d3,
        $
    ){
    'use strict';

    // Constant for marked for deletion.
    var MARKED_FOR_DELETION = -1;

    var DataSet = function(state) {
        state = defined(state) ? state : {};

        this._name = '';
        this._filename = '';
        this._referenceCount = 0;
        this._data = [];
        this._dataFields = [];
        this._dataLoaded = new $.Deferred();

        this.setState(state);

        ko.track(this);
    };

    /**
     * Static method that returns the type String for this class.
     */
    DataSet.getType = function() {
        return 'DataSet';
    };

    DataSet.getUniqueNameNamespace = function() {
        return 'dataset-name';
    };

    DataSet.prototype.incrementReferenceCount = function() {
        // Don't change if marked for deletion.
        if (this._referenceCount !== MARKED_FOR_DELETION) {
            this._referenceCount++;
        }
    };

    DataSet.prototype.decrementReferenceCount = function() {
        // Don't change if marked for deletion. Don't decrement below 0.
        if (this._referenceCount !== MARKED_FOR_DELETION && this._referenceCount > 0) {
            this._referenceCount--;
        }
    };

    DataSet.prototype.markForDeletion = function() {
        this._referenceCount = MARKED_FOR_DELETION;
    };

    DataSet.prototype.resetReferenceCount = function() {
        // Can only be used when the DataSet is marked for deletion.
        if (this._referenceCount === MARKED_FOR_DELETION) {
            this._referenceCount = 0;
        }
    };

    DataSet.prototype.isMarkedForDeletion = function() {
        return (this._referenceCount === MARKED_FOR_DELETION);
    };

    /**
     * Runs the given function when the data has been loaded.
     *
     * @param whenLoadedFunction
     *            The function to run when this.dataLoaded is resolved.
     */
    DataSet.prototype.executeWhenDataLoaded = function(whenLoadedFunction) {
        // Runs the given function directly if dataLoaded is resolved, so that when changes are made by the user,
        // they will be properly added to history. $.when is needed so that the given function is run on load.
        if (this.dataLoaded.state() === 'resolved') {
            whenLoadedFunction();
        }
        else {
            $.when(this.dataLoaded).done(whenLoadedFunction);
        }
    };

    DataSet.prototype.getState = function() {
        return {
            type: DataSet.getType(),
            name: this.name,
            filename: this.filename,
            referenceCount: this.referenceCount
        };
    };

    DataSet.prototype.setState = function(state) {
        var self = this;
        if (defined(state.name)) {
            this._name = state.name;
        }

        if (defined(state.referenceCount)) {
            this._referenceCount = state.referenceCount;
        }

        if (defined(state.filename)) {
            this._filename = state.filename;

            if (!this.isMarkedForDeletion()) {
                ReadData.readData(this);
            }
        }
    };

    DataSet.prototype.getDisplayState = function() {
        return {
            type: DataSet.getType(),
            name: this.name
        };
    };

    DataSet.prototype.subscribed = false;

    DataSet.prototype.skipSubscribe = ['_data', '_dataFields', '_dataLoaded'];

    DataSet.prototype.subscribeChanges = function() {
        var self = this;
        var propertyChangeSubscriber = PropertyChangeSubscriber.getInstance();

        var properties = [];
        for (var prop in this) {
            if (this.hasOwnProperty(prop)) {
                if(this.skipSubscribe.indexOf(prop) === -1){
                    properties.push(prop);
                }
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

    DataSet.getHelperFunctionsJs = function() {
        return '/*\n' +
            ' * Subscribe to changes in dataset using the given key with a callback function.\n' +
            ' * Using an existing key overwrites the existing callback function,\n' +
            ' */\n' +
            'var dataSubscribe = function(dataSetName, key, callbackFunction) {\n' +
            '\tdataSets[dataSetName].onChange[key] = callbackFunction;\n' +
            '};\n\n' +
            '/*\n' +
            ' * Unsubscribe the given keys callback function to the dataset\n' +
            ' */\n' +
            'var transferDataSubscription = function(oldDataSetName, newDataSetName, key) {\n' +
            '\tvar callbackFunction = dataSets[oldDataSetName].onChange[key];\n' +
            '\tdelete dataSets[oldDataSetName].onChange[key];\n' +
            '\tif (typeof callbackFunction !== \'undefined\') {\n' +
            '\t\tdataSubscribe(newDataSetName, key, callbackFunction);\n' +
            '\t}\n' +
            '};\n\n';
    };

    DataSet.prototype.getLoadDataJs = function () {
        return 'd3.csv(\'data/' + this.filename + '\', function (loadedData) { \n' +
                '\tdataSets[\'' + this.name + '\'].loadedData = loadedData;\n' +
                '\tdataSets[\'' + this.name + '\'].data = loadedData;\n' +
                '\tdataSets[\'' + this.name + '\'].dataIsLoaded.resolve();\n' +
                '});\n\n';
    };

    DataSet.prototype.getSetupJs = function() {
        return 'dataSets[\'' + this.name + '\'] = {\n' +
                '\t\'dataIsLoaded\' : $.Deferred()' + ',\n' +
                '\t\'loadedData\': []' + ',\n' +
                '\t\'data\': []' + ',\n' +
                '\t\'onChange\': {}' + ',\n' +
                '\t\'updateData\': $.noop\n' +
                '};\n\n';
    };

    Object.defineProperties(DataSet.prototype, {
        type: {
            get: function() {
                return DataSet.getType();
            }
        },
        name: {
            get: function() {
                return this._name;
            },
            set: function(value) {
                var success = UniqueTracker.addValueIfUnique(DataSet.getUniqueNameNamespace(), value, this);
                if (success) {
                    this._name = value;
                }
            }
        },
        filename: {
            get: function() {
                return this._filename;
            },
            set: function(value) {
                this._filename = value;
            }
        },
        displayName: {
            get: function() {
                return this._name + ' : ' + this._filename;
            }
        },
        data: {
            get: function() {
                return this._data;
            },
            set: function(data) {
                if (typeof data === 'object') {
                    this._data = data;

                    // Set dataFields.
                    var values = d3.values(data)[0];
                    if(defined(values)){
                        this._dataFields = Object.keys(values);
                    }
                }
            }
        },
        originalData: {
            get: function() {
                return this._data;
            }
        },
        referenceCount: {
            get: function() {
                return this._referenceCount;
            }
        },
        dataFields: {
            get: function() {
                return this._dataFields;
            }
        },
        dataLoaded: {
            get: function() {
                return this._dataLoaded.promise();
            }
        }
    });

    return DataSet;
});
