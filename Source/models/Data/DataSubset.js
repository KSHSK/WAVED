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
        DataSet.call(this, state);

        // TODO: Validation, etc
        this._query = state.query; // Query

        this._parent = state.parent; // DataSet

        // By default, use all of the parent's data.
        this._data = this.parent.data;

        ko.track(this);
    };

    DataSubset.prototype = Object.create(DataSet.prototype);

    DataSubset.prototype.executeQuery = function() {

    };

    Object.defineProperties(DataSubset.prototype, {
        parent: {
            get: function() {
                return this._parent;
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