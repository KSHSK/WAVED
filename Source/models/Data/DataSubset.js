define([
        'models/Data/DataSet',
        'models/Data/QueryNode',
        'knockout',
        'util/defined'
    ],function(
        DataSet,
        QueryNode,
        ko,
        defined
    ){
    'use strict';

    var DataSubset = function(state) {
        DataSet.call(this, state);

        // TODO: Validation, etc
        this._query = state.query; // QueryNode

        ko.track(this);
    };

    DataSubset.prototype = Object.create(DataSet.prototype);

    Object.defineProperties(DataSubset.prototype, {
        data: {
            get: function() {
                return this._data;
            }
        },
        query: {
            get: function() {
                return this._query;
            },
            set: function(query) {
                this._query = query;
            }
        }
    });

    return DataSubset;
});