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
fluid.registerNamespace("gpii.migrations.migrationGPII2966");

fluid.require("%gpii-universal");
gpii.loadTestingSupport();

require("../../gpii/node_modules/gpii-migrations/index.js");

/**
 * GPII-2966 Migration Part 1
 *
 * First part of the GPII-2966 which updates `prefsSafe`s at `schemaVersion` 0.2 to
 * 0.3 and removes their `password` field.
 *
 * @typedef {Infusion} gpii.migrations.migrationGPII2966
 */
fluid.defaults("gpii.migrations.migrationGPII2966", {
    gradeNames: ["gpii.migrations.couchDBmigration"],
    testFixtures: {
        beforeMigration: "%gpii-universal/scripts/migrations/data/gpii-2966-before-fixture.json",
        afterMigration: "@expand:fluid.module.resolvePath(%gpii-universal/scripts/migrations/data/gpii-2966-after-fixture.json)"
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
 *
 * Second part of GPII-2966 migrations which updates all remaining documents to
 * `schemaVersion` 0.3.
 *
 * @typedef {Infusion} gpii.migrations.migrationGPII2966part2
 */
fluid.defaults("gpii.migrations.migrationGPII2966part2", {
    gradeNames: ["gpii.migrations.couchDBmigration"],
    testFixtures: {
        beforeMigration: "%gpii-universal/scripts/migrations/data/gpii-2966-before2-fixture.json",
        afterMigration: "@expand:fluid.module.resolvePath(%gpii-universal/scripts/migrations/data/gpii-2966-after2-fixture.json)"
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
