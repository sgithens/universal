"use strict";

var fluid = require("infusion");

var gpii = fluid.registerNamespace("gpii");
fluid.registerNamespace("gpii.migrations.migrationGPII2966");

require("../../gpii/node_modules/gpii-migrations/index.js");

fluid.defaults("gpii.migrations.migrationGPII2966", {
    gradeNames: ["gpii.migrations.couchDBmigration"],
    mangoQuery: {
        "selector": {
            "schemaVersion": {
                "$eq": "0.1"
            },
            "type": "prefsSafe"
        },
        limit: 1000
    },
    invokers: {
        "processDocument": {
            funcName: "gpii.migrations.migrationGPII2966.processDocument",
            args: ["{arguments}.0"]
        }
    }
});

gpii.migrations.migrationGPII2966.processDocument = function (doc) {
    doc.schemaVersion = "0.2";
    delete doc.password;
    return doc;
};

var migrate = gpii.migrations.migrationGPII2966();
console.log("About to launch migration");
fluid.promise.fireTransformEvent(migrate.events.continueMigration);
