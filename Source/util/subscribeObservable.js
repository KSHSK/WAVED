define(['knockout'], function(ko) {
    'use strict';

    /**
     * Returns a subscription to a Knockout observable
     */
    var subscribeObservable = function(container, observableName, action, target, event) {
        try{
            return ko.getObservable(container, observableName).subscribe(function(newValue){
                return action(newValue);
            }, target, event);
        }
        catch(err){
            return null;
        }
    };

    return subscribeObservable;
});