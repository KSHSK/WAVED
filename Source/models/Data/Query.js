define(['knockout',
        'util/defined'
    ],function(
        ko,
        defined
    ){
    'use strict';

    /**
     * Contains one or more conditions.
     */
    var Query = function(state) {
        state = defined(state) ? state : {};


    };

    return Query;
});