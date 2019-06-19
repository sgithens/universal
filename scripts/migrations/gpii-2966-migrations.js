"use strict";

var fluid = require("infusion");

var gpii = fluid.registerNamespace("gpii");
gpii.migrations.migrationGPII2966 = fluid.registerNamespace("gpii.migrations.migrationGPII2966");

require("../../gpii/node_modules/gpii-migrations/index.js");

fluid.defaults("gpii.migrations.migrationGPII2966", {
    gradeNames: ["gpii.migrations.couchDBmigration"],
    testFixtureData: gpii.migrations.migrationGPII2966.fixtureData,
    mangoQuery: {
        "selector": {
            "schemaVersion": {
                "$eq": "0.1"
            },
            "type": "prefsSafe"
        }
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
