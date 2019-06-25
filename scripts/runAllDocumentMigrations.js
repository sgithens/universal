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

fluid.require("%gpii-universal");
gpii.loadTestingSupport();

require("./migrations/gpii-2966-migrations.js");
require("./migrations/gpii-3717-migrations.js");

fluid.each([
    gpii.migrations.migrationGPII2966(),
    gpii.migrations.migrationGPII2966part2(),
    gpii.migrations.migrationGPII3717(),
    gpii.migrations.migrationGPII3717part2()
], function (item) {
    fluid.promise.fireTransformEvent(item.events.continueMigration);
});
