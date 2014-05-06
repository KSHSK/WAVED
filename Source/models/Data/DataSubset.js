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

        // The resultant data after running the query.
        this._queryData = [];

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

    DataSubset.prototype.skipSubscribe = DataSet.prototype.skipSubscribe.concat(['_queryData']);

    DataSubset.prototype.getState = function() {
        var state = DataSet.prototype.getState.call(this);

        state.type = DataSubset.getType();
        state.parent = this.parent.name;
        state.query = this.query.getState();

        return state;
    };

    DataSubset.prototype.setState = function(state) {
        DataSet.prototype.setState.call(this, state);

        if (defined(state.parent)) {
            this.parent = state.parent;
            this.executeQuery();
        }

        if (defined(state.query)) {
            this.query.setState(state.query);
            this.executeQuery();
        }
    };

    DataSubset.prototype.executeQuery = function() {
        var self = this;

        if (!(self.parent instanceof DataSet)) {
            // When loaded from state, the parent will initially be a String, for the name of the parent.
            return;
        }

        // Function to run the query.
        var localExecuteQuery = function() {
            var data = self.parent.data;

            // TODO: Run query
            self._queryData = data;
        };

        // Run the query or set interval if needed.
        if (self.parent.dataLoaded) {
            localExecuteQuery();
        }
        else {
            var interval = setInterval(function() {
                if (self.parent.dataLoaded) {
                    localExecuteQuery();
                }

                clearInterval(interval);
            }, 100);
        }

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
        data: {
            get: function() {
                return this._queryData;
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
        }
    });

    return DataSubset;
});