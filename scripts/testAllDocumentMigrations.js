"use strict";

var fluid = require("infusion");

var gpii = fluid.registerNamespace("gpii");

fluid.require("%gpii-universal");
gpii.loadTestingSupport();

require("./migrations/gpii-2966-migrations.js");
require("./migrations/gpii-3717-migrations.js");

fluid.test.runTests([
    gpii.migrations.utils.createBeforeAfterTests(gpii.migrations.migrationGPII2966()),
    gpii.migrations.utils.createBeforeAfterTests(gpii.migrations.migrationGPII2966part2()),
    gpii.migrations.utils.createBeforeAfterTests(gpii.migrations.migrationGPII3717()),
    gpii.migrations.utils.createBeforeAfterTests(gpii.migrations.migrationGPII3717part2())
]);
