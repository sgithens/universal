/*!
Copyright 2019 Raising The Floor - US

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://github.com/GPII/universal/blob/master/LICENSE.txt
*/
"use strict";

var fluid = require("infusion");

var gpii = fluid.registerNamespace("gpii");
fluid.registerNamespace("gpii.migrations.migrationGPII3717");

fluid.require("%gpii-universal");
gpii.loadTestingSupport();

require("../../gpii/node_modules/gpii-migrations/index.js");

/**
 * GPII-3717 Migration Part 1
 *
 * First part of the GPII-3717 which updates `clientCredential`s at `schemaVersion` 0.1 to
 * 0.2 and adds four new fields `allowedIPBlocks`, `allowedPrefsToWrite`, `isCreateGpiiKeyAllowed`,
 * `isCreatePrefsSafeAllowed`.
 *
 * @typedef {Infusion} gpii.migrations.migrationGPII3717
 */
fluid.defaults("gpii.migrations.migrationGPII3717", {
    gradeNames: ["gpii.migrations.couchDBmigration"],
    testFixtures: {
        beforeMigration: "%gpii-universal/scripts/migrations/data/gpii-3717-before-fixture.json",
        afterMigration: "@expand:fluid.module.resolvePath(%gpii-universal/scripts/migrations/data/gpii-3717-after-fixture.json)"
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

/**
 * GPII-3717 Migration Part 2
 *
 * Second part of GPII-3717 migrations which updates all remaining documents to
 * `schemaVersion` 0.2.
 *
 * @typedef {Infusion} gpii.migrations.migrationGPII3717part2
 */
fluid.defaults("gpii.migrations.migrationGPII3717part2", {
    gradeNames: ["gpii.migrations.couchDBmigration"],
    testFixtures: {
        beforeMigration: "%gpii-universal/scripts/migrations/data/gpii-3717-before2-fixture.json",
        afterMigration: "@expand:fluid.module.resolvePath(%gpii-universal/scripts/migrations/data/gpii-3717-after2-fixture.json)"
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
