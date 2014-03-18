define([], function(){
    'use strict';

    var EventType = {
        CLICK: 'click',
        MOUSEOVER: 'mouseover'
        // TODO: Figure out hover. jQuery hover binds handlers for both mouseenter and mouseout
    };

    return EventType;
});