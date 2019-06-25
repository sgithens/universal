"use strict";

var fluid = require("infusion");

var gpii = fluid.registerNamespace("gpii");
fluid.registerNamespace("gpii.migrations.migrationGPII2966");

fluid.require("%gpii-universal");
gpii.loadTestingSupport();

require("../../gpii/node_modules/gpii-migrations/index.js");

/**
 * GPII-2966 Migration Part 1
 */
fluid.defaults("gpii.migrations.migrationGPII2966", {
    gradeNames: ["gpii.migrations.couchDBmigration"],
    testFixtures: {
        beforeMigration: "%gpii-universal/scripts/migrations/gpii-2966-before-fixture.json",
        afterMigration: "@expand:fluid.module.resolvePath(%gpii-universal/scripts/migrations/gpii-2966-after-fixture.json)"
    },
    mangoQuery: {
        "selector": {
            "schemaVersion": {
                "$eq": "0.2"
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
    doc.schemaVersion = "0.3";
    delete doc.password;
    return doc;
};

/**
 * GPII-2966 Migration Part 2
 */
fluid.defaults("gpii.migrations.migrationGPII2966part2", {
    gradeNames: ["gpii.migrations.couchDBmigration"],
    testFixtures: {
        beforeMigration: "%gpii-universal/scripts/migrations/gpii-2966-before2-fixture.json",
        afterMigration: "@expand:fluid.module.resolvePath(%gpii-universal/scripts/migrations/gpii-2966-after2-fixture.json)"
    },
    mangoQuery: {
        "selector": {
            "schemaVersion": {
                "$eq": "0.2"
            },
            "type": {
                "$ne": "prefsSafe"
            }
        }
    },
    invokers: {
        "processDocument": {
            funcName: "gpii.migrations.migrationGPII2966part2.processDocument",
            args: ["{arguments}.0"]
        }
    }
});

gpii.migrations.migrationGPII2966part2.processDocument = function (doc) {
    doc.schemaVersion = "0.3";
    return doc;
};
