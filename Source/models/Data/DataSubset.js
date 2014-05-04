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

        this.setState(state);

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

        if (defined(state.parent)) {
            this.parent = state.parent;
        }

        if (defined(state.query)) {
            this.query.setState(state.query);
            this.executeQuery();
        }
    };

    DataSubset.prototype.executeQuery = function() {
        var data = this.parent.data;
    };

    Object.defineProperties(DataSubset.prototype, {
        parent: {
            get: function() {
                return this._parent;
            },
            set: function(value) {
                this._parent = value;
            }
        },
        nameAndParentName: {
            get: function() {
                return this.name + ' : ' + this.parent.name;
            }
        },
        data: {
            get: function() {
                return this._queryData;
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