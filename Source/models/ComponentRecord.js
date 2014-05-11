define(['knockout',
        'util/defined'
    ],function(
        ko,
        defined
    ){
    'use strict';

    var ComponentRecord = function(record) {
        record = defined(record) ? record : {};
        this.name = record.displayName;
        this.icon = record.icon;
        this.component = record.component;

        ko.track(this);
    };

    return ComponentRecord;
});