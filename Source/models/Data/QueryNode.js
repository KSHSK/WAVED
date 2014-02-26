/*global define*/
define(['knockout',
        'util/defined'
    ],function(
        ko,
        defined
    ){
    'use strict';

    var QueryNode = function(state) {
        state = defined(state) ? state : {};

        // TODO: Get these for real, validate, etc.
        this._value = state.value; // QueryNodeValue
        this._left = state.left; // QueryNode
        this._right = state.right; // QueryNode

    };

    return QueryNode;
});