"use strict";

var fluid = require("infusion");

var gpii = fluid.registerNamespace("gpii");
fluid.registerNamespace("gpii.migrations.migrationGPII3717");

fluid.require("%gpii-universal");
gpii.loadTestingSupport();

require("../../gpii/node_modules/gpii-migrations/index.js");


fluid.defaults("gpii.migrations.migrationGPII3717", {
    gradeNames: ["gpii.migrations.couchDBmigration"],
    testFixtures: {
        beforeMigration: "%gpii-universal/scripts/migrations/gpii-3717-before-fixture.json",
        afterMigration: "@expand:fluid.module.resolvePath(%gpii-universal/scripts/migrations/gpii-3717-after-fixture.json)"
    },
    mangoQuery: {
        "selector": {
            "schemaVersion": {
                "$eq": "0.1"
            },
            "type": "clientCredential"
        }
    },
    invokers: {
        "processDocument": {
            funcName: "gpii.migrations.migrationGPII3717.processDocument",
            args: ["{arguments}.0"]
        }
    }
});

gpii.migrations.migrationGPII3717.processDocument = function (doc) {
    doc.schemaVersion = "0.2";
    doc.allowedIPBlocks = null;
    doc.allowedPrefsToWrite = null;
    doc.isCreateGpiiKeyAllowed = false;
    doc.isCreatePrefsSafeAllowed = false;
    return doc;
};

fluid.defaults("gpii.migrations.migrationGPII3717part2", {
    gradeNames: ["gpii.migrations.couchDBmigration"],
    testFixtures: {
        beforeMigration: "%gpii-universal/scripts/migrations/gpii-3717-before2-fixture.json",
        afterMigration: "@expand:fluid.module.resolvePath(%gpii-universal/scripts/migrations/gpii-3717-after2-fixture.json)"
    },
    mangoQuery: {
        "selector": {
            "schemaVersion": {
                "$eq": "0.1"
            },
            "type": {
                "$ne": "clientCredential"
            }
        }
    },
    invokers: {
        "processDocument": {
            funcName: "gpii.migrations.migrationGPII3717part2.processDocument",
            args: ["{arguments}.0"]
        }
    }
});

gpii.migrations.migrationGPII3717part2.processDocument = function (doc) {
    doc.schemaVersion = "0.2";
    return doc;
};
