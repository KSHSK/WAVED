define(['knockout'], function(ko) {
    'use strict';

    /**
     * Returns a subscription to a Knockout observable
     */
    var subscribeObservable = function(container, observableName, action, target, event) {
        var observable = ko.getObservable(container, observableName);
        if(observable === null){
            return null;
        }
        else{
            return ko.getObservable(container, observableName).subscribe(function(newValue){
                return action(newValue);
            }, target, event);
        }
    };

    return subscribeObservable;
});