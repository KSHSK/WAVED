/*global define*/
define([
        'models/Data/DataSet',
        'knockout',
        'util/defined'
    ],function(
        DataSet,
        ko,
        defined
    ){
    'use strict';

    var DataSubset = function(state) {
        state = defined(state) ? state : {};

        // TODO:
        this._queryNode = state.queryNode; // QueryNode

        ko.track(this);
    };

    DataSubset.prototype = Object.create(DataSet.prototype);

    Object.defineProperties(DataSubset.prototype, {
        data: {
            get: function() {
                return this._data;
            }
        },
        queryNode: {
            get: function() {
                return this._queryNode;
            }
        }
    });

    return DataSubset;
});