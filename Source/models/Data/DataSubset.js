define([
        'knockout',
        './DataSet',
        './Query',
        'util/defined'
    ],function(
        ko,
        DataSet,
        Query,
        defined
    ){
    'use strict';

    var DataSubset = function(state) {
        this._query = new Query(); // Query
        this._parent = undefined; // DataSet

        // Call super after variables are defined, because DataSet will call setState.
        DataSet.call(this, state);

        ko.track(this);
    };

    /**
     * Static method that returns the type String for this class.
     */
    DataSubset.getType = function() {
        return 'DataSubset';
    };

    DataSubset.prototype = Object.create(DataSet.prototype);

    DataSubset.prototype.getState = function() {
        var state = DataSet.prototype.getState.call(this);

        state.type = DataSubset.getType();
        state.parent = this.parent.name;
        state.query = this.query.getState();

        return state;
    };

    DataSubset.prototype.setState = function(state) {
        DataSet.prototype.setState.call(this, state);

        var shouldExecute = false;

        if (defined(state.parent)) {
            this.parent = state.parent;
            shouldExecute = true;
        }

        if (defined(state.query)) {
            this.query.setState(state.query);
            shouldExecute = true;
        }

        if (shouldExecute) {
            this.executeQuery();
            this.executeCurrentQuery();
        }
    };

    DataSubset.prototype.getDataFunctionJs = function(tabs) {
        return Query.getDataFunctionJs('', this.query.conditions, tabs);
    };

    DataSubset.prototype.getLoadDataJs = function () {
        return 'dataSets[\'' + this.parent.name + '\'].dataIsLoaded.then(function () {\n' +
                '\tdataSets[\'' + this.name + '\'].loadedData = dataSets[\'' + this.parent.name + '\'].loadedData;\n' +
                '\tdataSets[\'' + this.name + '\'].updateData = ' + this.getDataFunctionJs('\t') +
                '\tdataSets[\'' + this.name + '\'].updateData();\n' +
                '\tdataSets[\'' + this.name + '\'].dataIsLoaded.resolve();\n' +
                '});\n\n';
    };

    DataSubset.prototype.getDisplayState = function() {
        var displayState = DataSet.prototype.getDisplayState.call(this);

        displayState.type = DataSubset.getType();

        return displayState;
    };

    DataSubset.prototype.reset = function() {
        this.query.reset();
        this.executeCurrentQuery();
    };

    var executeQuery = function(current) {
        var self = this;

        if (!(self.parent instanceof DataSet)) {
            // When loaded from state, the parent will initially be a String, for the name of the parent.
            return;
        }

        // Function to run the query.
        var localExecuteQuery = function() {
            var data = self.parent.data;

            // Run either the current or original query
            if (current) {
                self._data = self.query.executeCurrent(data);
            }
            else {
                self._originalData = self.query.execute(data);
            }

            self._dataLoaded.resolve();
        };

        self.parent.executeWhenDataLoaded(localExecuteQuery);
    };

    DataSubset.prototype.executeQuery = function() {
        executeQuery.call(this, false);
    };

    DataSubset.prototype.executeCurrentQuery = function() {
        executeQuery.call(this, true);
    };

    Object.defineProperties(DataSubset.prototype, {
        type: {
            get: function() {
                return DataSubset.getType();
            }
        },
        parent: {
            get: function() {
                return this._parent;
            },
            set: function(value) {
                this._parent = value;
            }
        },
        displayName: {
            get: function() {
                return this.name + ' : ' + this.parent.name;
            }
        },
        dataFields: {
            get: function() {
                return this.parent.dataFields;
            },
            set: function(){
                // Do nothing.
            }
        },
        query: {
            get: function() {
                return this._query;
            },
            set: function(query) {
                if (query instanceof Query) {
                    this._query = query;
                }
            }
        },
        originalData: {
            get: function() {
                return this._originalData;
            }
        }
    });

    return DataSubset;
});
