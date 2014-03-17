define([], function(){
    'use strict';

    var EventType = {
        CLICK: 'Mouse click',
        MOUSEOVER: 'Mouse move'
        // TODO: Figure out hover. jQuery hover binds handlers for both mouseenter and mouseout
    };

    return EventType;
});