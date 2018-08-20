/*
 * User Logon State Change Test Definitions
 *
 * Copyright 2013-2018 OCAD University
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this License.
 *
 * The research leading to these results has received funding from the European Union's
 * Seventh Framework Programme (FP7/2007-2013)
 * under grant agreement no. 289016.
 *
 * You may obtain a copy of the License at
 * https://github.com/GPII/universal/blob/master/LICENSE.txt
 */

"use strict";

var fluid = require("infusion"),
    jqUnit = fluid.require("node-jqunit", require, "jqUnit"),
    gpii = fluid.registerNamespace("gpii");

fluid.require("%gpii-universal");

gpii.loadTestingSupport();

fluid.registerNamespace("gpii.tests.userLogonHandling");

fluid.defaults("gpii.tests.userLogonHandling.proximityTriggered", {
    gradeNames: "kettle.test.request.http",
    path: "/user/%gpiiKey/proximityTriggered",
    termMap: {
        gpiiKey: "{tests}.options.gpiiKey"
    }
});

fluid.defaults("gpii.tests.userLogonHandling.getGpiiKey", {
    gradeNames: "kettle.test.request.http",
    path: "/gpiiKey"
});

fluid.defaults("gpii.tests.userLogonHandling.testCaseHolder", {
    gradeNames: [ "gpii.test.common.lifecycleManagerReceiver", "gpii.test.common.testCaseHolder" ],
    components: {
        resetRequest: {
            type: "kettle.test.request.http",
            options: {
                path: "/user/reset/proximityTriggered"
            }
        },
        resetRequest2: {
            type: "kettle.test.request.http",
            options: {
                path: "/user/reset/proximityTriggered"
            }
        },
        proximityTriggeredRequest: {
            type: "gpii.tests.userLogonHandling.proximityTriggered"
        },
        proximityTriggeredRequest2: {
            type: "gpii.tests.userLogonHandling.proximityTriggered"
        },
        proximityTriggeredRequest3: {
            type: "gpii.tests.userLogonHandling.proximityTriggered"
        },
        proximityTriggeredRequestOther: {
            type: "kettle.test.request.http",
            options: {
                path: "/user/sammy/proximityTriggered"
            }
        },
        logoutSammyRequest: {
            type: "kettle.test.request.http",
            options: {
                path: "/user/sammy/logout"
            }
        },
        loginTestUser1Request: {
            type: "kettle.test.request.http",
            options: {
                path: "/user/testUser1/login"
            }
        },
        logoutTestUser1Request: {
            type: "kettle.test.request.http",
            options: {
                path: "/user/testUser1/logout"
            }
        },
        logoutNoUserRequest: {
            type: "kettle.test.request.http",
            options: {
                path: "/user/noUser/logout"
            }
        },
        getGpiiKeyRequest1: {
            type: "gpii.tests.userLogonHandling.getGpiiKey"
        },
        getGpiiKeyRequest2: {
            type: "gpii.tests.userLogonHandling.getGpiiKey"
        },
        getGpiiKeyRequest3: {
            type: "gpii.tests.userLogonHandling.getGpiiKey"
        }
    },
    events: {
        timeoutComplete: null
    }
});

gpii.tests.userLogonHandling.gpiiKey = "testUser1";

gpii.tests.userLogonHandling.testLoginResponse = function (data) {
    jqUnit.assertEquals("Response is correct", "User with GPII key " +
        gpii.tests.userLogonHandling.gpiiKey + " was successfully logged in.", data);
};

gpii.tests.userLogonHandling.testLogoutResponse = function (data, gpiiKey) {
    jqUnit.assertEquals("Response is correct", "User with GPII key " +
        gpiiKey + " was successfully logged out.", data);
};

gpii.tests.userLogonHandling.checkClearedLifecycleManager = function (lifecycleManager) {
    var model = lifecycleManager.model;
    jqUnit.assertTrue("LogonChange model exists", model && model.logonChange);
    jqUnit.assertTrue("Current GPII key should be noUser", model.logonChange.gpiiKey === "noUser");
};


gpii.tests.userLogonHandling.buildTestDefs = function (testDefs) {
    return fluid.transform(testDefs, function (testDef) {
        return fluid.extend(true, {
            config: {
                // The custom config file is to config the debounce time at /proximityTriggered endpoint to 3 seconds
                // rather than using the default 1.5 seconds. This is to work around an issue with testing a following
                // request that occurs < the debounce time. In this test, the following request was sent after waiting
                // for 1 second. However in the reality with all other running processes, CPU processing power etc,
                // this request is usually sent a bit more than after 1 second, occassionally even more than 1.5 seconds,
                // which causes the test to fail. Setting the debounce time to 3 seconds provides more buffering time
                // for the following request to send.
                configName: "gpii.tests.acceptance.userLogonStateChange.config",
                configPath: "%gpii-universal/tests/configs"
            },
            gradeNames: ["gpii.tests.userLogonHandling.testCaseHolder", "gpii.test.integration.testCaseHolder.linux"],
            gpiiKey: testDefs.gpiiKey || gpii.tests.userLogonHandling.gpiiKey
        }, testDef);
    });
};


gpii.tests.userLogonHandling.testDefs = [{
    name: "Testing standard proximityTriggered login and logout",
    expect: 5,
    sequence: [{
        func: "{getGpiiKeyRequest1}.send"
    }, {
        event: "{getGpiiKeyRequest1}.events.onComplete",
        listener: "jqUnit.assertEquals",
        args: ["\"noUser\" is logged in when GPII starts", "[\"noUser\"]", "{arguments}.0"]
    }, {
        // 1st /proximityTriggered request: standard login
        func: "{proximityTriggeredRequest}.send"
    }, {
        event: "{proximityTriggeredRequest}.events.onComplete",
        listener: "gpii.tests.userLogonHandling.testLoginResponse"
    }, {
        func: "{getGpiiKeyRequest2}.send"
    }, {
        event: "{getGpiiKeyRequest2}.events.onComplete",
        listener: "jqUnit.assertEquals",
        args: ["\"testUser1\" is logged in", "[\"testUser1\"]", "{arguments}.0"]
    }, {
        // wait for the debounce period to pass so that the following /proximityTriggered request is not rejected
        func: "setTimeout",
        args: [ "{tests}.events.timeoutComplete.fire", 3500 ]
    }, {
        event: "{tests}.events.timeoutComplete",
        listener: "fluid.identity"
    }, {
        // 2nd /proximityTriggered request: standard logout
        func: "{proximityTriggeredRequest2}.send"
    }, {
        event: "{proximityTriggeredRequest2}.events.onComplete",
        listener: "gpii.tests.userLogonHandling.testLogoutResponse",
        args: ["{arguments}.0", gpii.tests.userLogonHandling.gpiiKey]
    }, {
        func: "{getGpiiKeyRequest3}.send"
    }, {
        event: "{getGpiiKeyRequest3}.events.onComplete",
        listener: "jqUnit.assertEquals",
        args: ["\"noUser\" is logged in when no key is logged into GPII", "[\"noUser\"]", "{arguments}.0"]
    }]
}, {
    name: "Testing proximityTriggered login with debounce",
    expect: 4,
    sequence: [{
        // 1st /proximityTriggered request: standard login
        func: "{proximityTriggeredRequest}.send"
    }, {
        event: "{proximityTriggeredRequest}.events.onComplete",
        listener: "gpii.tests.userLogonHandling.testLoginResponse"
    }, {
        // wait within the debounce period to trigger the debounce logic so that the following /proximityTriggered request will be rejected
        func: "setTimeout",
        args: [ "{tests}.events.timeoutComplete.fire", 100 ]
    }, {
        event: "{tests}.events.timeoutComplete",
        listener: "fluid.identity"

    }, {
        // 2nd /proximityTriggered request: will be rejected
        func: "{proximityTriggeredRequest2}.send"
    }, {
        event: "{proximityTriggeredRequest2}.events.onComplete",
        listener: "kettle.test.assertErrorResponse",
        args: {
            message: "Received 429 error due to debounce rules",
            errorTexts: "Proximity trigger ignored due to bounce rules",
            statusCode: 429,
            string: "{arguments}.0",
            request: "{proximityTriggeredRequest2}"
        }
    }]
}, {
    name: "Testing proximityTriggered logout with debounce",
    expect: 5,
    sequence: [{
        // 1st /proximityTriggered request: standard login
        func: "{proximityTriggeredRequest}.send"
    }, {
        event: "{proximityTriggeredRequest}.events.onComplete",
        listener: "gpii.tests.userLogonHandling.testLoginResponse"
    }, {
        // wait for the debounce period to pass so that the following /proximityTriggered request is not rejected
        func: "setTimeout",
        args: [ "{tests}.events.timeoutComplete.fire", 3500 ]
    }, {
        event: "{tests}.events.timeoutComplete",
        listener: "fluid.identity"
    }, {
        // 2nd /proximityTriggered request: standard logout
        func: "{proximityTriggeredRequest2}.send"
    }, {
        event: "{proximityTriggeredRequest2}.events.onComplete",
        listener: "gpii.tests.userLogonHandling.testLogoutResponse",
        args: ["{arguments}.0", gpii.tests.userLogonHandling.gpiiKey]
    }, {
        // wait within the debounce period to trigger the debounce logic so that the following /proximityTriggered request with the same GPII key will be rejected
        func: "setTimeout",
        args: [ "{tests}.events.timeoutComplete.fire", 100 ]
    }, {
        event: "{tests}.events.timeoutComplete",
        listener: "fluid.identity"
    }, {
        // 3rd /proximityTriggered request with the same GPII key: will be rejected
        func: "{proximityTriggeredRequest3}.send"
    }, {
        event: "{proximityTriggeredRequest3}.events.onComplete",
        listener: "kettle.test.assertErrorResponse",
        args: {
            message: "Received 429 error due to debounce rules",
            errorTexts: "Proximity trigger ignored due to bounce rules",
            statusCode: 429,
            string: "{arguments}.0",
            request: "{proximityTriggeredRequest3}"
        }
    }]
}, {
    name: "Login with a different user with proximity trigger should log previous user out",
    expect: 4,
    sequence: [{
        // 1st /proximityTriggered request: standard login
        func: "{proximityTriggeredRequest}.send"
    }, {
        event: "{proximityTriggeredRequest}.events.onComplete",
        listener: "gpii.tests.userLogonHandling.testLoginResponse"
    }, {
        // wait for the debounce period to pass
        func: "setTimeout",
        args: [ "{tests}.events.timeoutComplete.fire", 3500 ]
    }, {
        event: "{tests}.events.timeoutComplete",
        listener: "fluid.identity"
    }, {
        func: "{getGpiiKeyRequest1}.send"
    }, {
        event: "{getGpiiKeyRequest1}.events.onComplete",
        listener: "jqUnit.assertEquals",
        args: ["\"testUser1\" is logged in", "[\"testUser1\"]", "{arguments}.0"]
    }, {
        // 2nd /proximityTriggered request to login with a different user
        func: "{proximityTriggeredRequestOther}.send"
    }, {
        event: "{proximityTriggeredRequestOther}.events.onComplete",
        listener: "jqUnit.assertEquals",
        args: [ "Response is correct", "User with GPII key sammy was successfully logged in.", "{arguments}.0" ]
    }, {
        func: "{getGpiiKeyRequest2}.send"
    }, {
        event: "{getGpiiKeyRequest2}.events.onComplete",
        listener: "jqUnit.assertEquals",
        args: ["\"sammy\" is logged in", "[\"sammy\"]", "{arguments}.0"]
    }]
}, {
    name: "Login with a different user with proximity trigger should ignore debounce",
    expect: 2,
    sequence: [{
        // 1st /proximityTriggered request: standard login
        func: "{proximityTriggeredRequest}.send"
    }, {
        event: "{proximityTriggeredRequest}.events.onComplete",
        listener: "gpii.tests.userLogonHandling.testLoginResponse"
    }, {
        // wait within the debounce period
        func: "setTimeout",
        args: [ "{tests}.events.timeoutComplete.fire", 100 ]
    }, {
        event: "{tests}.events.timeoutComplete",
        listener: "fluid.identity"
    }, {
        // 2nd /proximityTriggered request to login with a different user
        func: "{proximityTriggeredRequestOther}.send"
    }, {
        event: "{proximityTriggeredRequestOther}.events.onComplete",
        listener: "jqUnit.assertEquals",
        args: [ "Response is correct", "User with GPII key sammy was successfully logged in.", "{arguments}.0" ]
    }]
}, {
    name: "Testing proximityTriggered with 'reset' GPII key",
    expect: 6,
    sequence: [{
        // resetting with no user logged in
        func: "{resetRequest}.send"
    }, {
        event: "{resetRequest}.events.onComplete",
        listener: "kettle.test.assertErrorResponse",
        args: {
            message: "Received 409 error on reset with no users logged on",
            errorTexts: "No users currently logged in - nothing to reset",
            statusCode: 409,
            string: "{arguments}.0",
            request: "{resetRequest}"
        }
    }, {
        // resetting with user logged in (part 1: login)
        func: "{proximityTriggeredRequest}.send"
    }, {
        event: "{proximityTriggeredRequest}.events.onComplete",
        listener: "gpii.tests.userLogonHandling.testLoginResponse"
    }, {
        // resetting with user logged in (part 2: reset and check that user is logged out)
        func: "{resetRequest2}.send"
    }, {
        event: "{resetRequest2}.events.onComplete",
        listener: "gpii.tests.userLogonHandling.testLogoutResponse",
        args: ["{arguments}.0", gpii.tests.userLogonHandling.gpiiKey]
    }, {
        func: "{getGpiiKeyRequest1}.send"
    }, {
        event: "{getGpiiKeyRequest1}.events.onComplete",
        listener: "jqUnit.assertEquals",
        args: ["\"noUser\" is logged in after the reset", "[\"noUser\"]", "{arguments}.0"]
    }]
}, {
    name: "Testing standard user/<gpiiKey>/login and /user/<gpiiKey>/logout URLs",
    expect: 12,
    sequence: [{
        // standard login
        func: "{loginRequest}.send"
    }, {
        event: "{loginRequest}.events.onComplete",
        listener: "gpii.tests.userLogonHandling.testLoginResponse"
    }, {
        // standard login with an already logged in user:
        func: "{loginTestUser1Request}.send"
    }, {
        event: "{loginTestUser1Request}.events.onComplete",
        listener: "kettle.test.assertErrorResponse",
        args: {
            message: "Received 409 error when logging in user who is already logged in",
            errorTexts: "Got log in request from user testUser1, but the user testUser1 is already logged in. So ignoring login request.",
            statusCode: 409,
            string: "{arguments}.0",
            request: "{loginTestUser1Request}"
        }
    }, {
        // logout of different user
        func: "{logoutSammyRequest}.send"
    }, {
        event: "{logoutSammyRequest}.events.onComplete",
        listener: "kettle.test.assertErrorResponse",
        args: {
            message: "Received 409 error when logging out user who is not logged in",
            errorTexts: "Got logout request from user sammy, but the user testUser1 is logged in. So ignoring the request.",
            statusCode: 409,
            string: "{arguments}.0",
            request: "{logoutSammyRequest}"
        }
    }, {
        // logout of the correct user
        func: "{logoutRequest}.send"
    }, {
        event: "{logoutRequest}.events.onComplete",
        listener: "gpii.tests.userLogonHandling.testLogoutResponse",
        args: ["{arguments}.0", gpii.tests.userLogonHandling.gpiiKey]
    }, {
        func: "{getGpiiKeyRequest1}.send"
    }, {
        event: "{getGpiiKeyRequest1}.events.onComplete",
        listener: "jqUnit.assertEquals",
        args: ["\"noUser\" is logged in after the logged in user is logged out", "[\"noUser\"]", "{arguments}.0"]
    }, {
        // logout of user when none is logged in
        func: "{logoutTestUser1Request}.send"
    }, {
        event: "{logoutTestUser1Request}.events.onComplete",
        listener: "kettle.test.assertErrorResponse",
        args: {
            message: "Received 409 error when logging out user when no user is logged in",
            errorTexts: "Got logout request from user testUser1, but the user noUser is logged in. So ignoring the request.",
            statusCode: 409,
            string: "{arguments}.0",
            request: "{logoutTestUser1Request}"
        }
    }]
}, {
    name: "Testing standard error handling: invalid user URLs",
    expect: 6,
    gpiiKey: "bogusToken",
    untrustedExtras: {
        statusCode: 401,
        errorText: "server_error while executing HTTP POST on"
    },
    errorText: "Error when retrieving preferences: GPII key \"bogusToken\" does not exist",
    statusCode: 404,
    sequence: [{
        // login with a non-existing GPII key
        func: "{proximityTriggeredRequest}.send"
    }, {
        event: "{proximityTriggeredRequest}.events.onComplete",
        listener: "kettle.test.assertErrorResponse",
        args: {
            message: "Received error when logging in non-existing GPII key",
            errorTexts: "{testCaseHolder}.options.errorText",
            string: "{arguments}.0",
            request: "{proximityTriggeredRequest}",
            statusCode: "{testCaseHolder}.options.statusCode"
        }
    }, {
        func: "gpii.tests.userLogonHandling.checkClearedLifecycleManager",
        args: [ "{lifecycleManager}" ]
    }, {
        func: "{getGpiiKeyRequest1}.send"
    }, {
        event: "{getGpiiKeyRequest1}.events.onComplete",
        listener: "jqUnit.assertEquals",
        args: ["\"noUser\" is still logged in when a login request is rejected", "[\"noUser\"]", "{arguments}.0"]
    }]
}, {
    name: "noUser logs back in after an explicit request to logout noUser",
    expect: 3,
    sequence: [{
        func: "{getGpiiKeyRequest1}.send"
    }, {
        event: "{getGpiiKeyRequest1}.events.onComplete",
        listener: "jqUnit.assertEquals",
        args: ["\"noUser\" is logged in when GPII starts", "[\"noUser\"]", "{arguments}.0"]
    }, {
        // 1st /proximityTriggered request: standard login
        func: "{logoutNoUserRequest}.send"
    }, {
        event: "{logoutNoUserRequest}.events.onComplete",
        listener: "gpii.tests.userLogonHandling.testLogoutResponse",
        args: ["{arguments}.0", "noUser"]
    }, {
        func: "{getGpiiKeyRequest2}.send"
    }, {
        event: "{getGpiiKeyRequest2}.events.onComplete",
        listener: "jqUnit.assertEquals",
        args: ["\"noUser\" is logged in when no key is logged into GPII", "[\"noUser\"]", "{arguments}.0"]
    }]
}];
