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
        this.value = state.value; // QueryNodeValue
        this.left = state.left; // QueryNode
        this.right = state.right; // QueryNode

    };

    return QueryNode;
});