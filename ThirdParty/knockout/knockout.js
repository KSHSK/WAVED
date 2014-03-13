define([
        '../ThirdParty/knockout/knockout-3.0.0',
        '../ThirdParty/knockout/knockout-es5'
    ], function(
        knockout,
        knockout_es5) {
    "use strict";

    // install the Knockout-ES5 plugin
    knockout_es5.attachToKo(knockout);

    return knockout;
});