document.write('<div id="ember-testing-container"><div id="ember-testing"></div></div>');

App.rootElement = '#ember-testing';
App.setupForTesting();
App.injectTestHelpers();

function exists(selector) {
    return !!find(selector).length;
}

function missing(selector) {
    var error = "element " + selector + " found (should be missing)";
    var element = find(selector).length;
    equal(element, 0, error);
}

function stubEndpointForHttpRequest(url, json, verb, status) {
    if (verb == null) {
        verb = "GET";
    }
    if (status == null) {
        status = 200;
    }
    $.mockjax({
        type: verb,
        url: url,
        status: status,
        dataType: 'json',
        responseText: json
    });
}

$.mockjaxSettings.logging = false;
$.mockjaxSettings.responseTime = 0;
