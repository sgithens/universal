/*!
GPII Universal Personalization Framework Node.js Bootstrap

Copyright 2012 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

The research leading to these results has received funding from the European Union's
Seventh Framework Programme (FP7/2007-2013) under grant agreement no. 289016.

You may obtain a copy of the License at
https://github.com/GPII/universal/blob/master/LICENSE.txt
*/

"use strict";

var fluid = require("./index.js"),
    gpii = fluid.registerNamespace("gpii"),
    request = require("request"),
    fs = require("fs"),
    pg = require("pg");

fluid.require("%gpii-universal/scripts/shared/dbRequestUtils.js");

fluid.registerNamespace("gpii.postgre");

gpii.postgre.fetchAllCouchDocs = function () {
    var togo = fluid.promise();
    var couchURL = "http://localhost:25984/gpii/_all_docs";
    request({
        url: couchURL,
        json: true
    }, function (error, response, body) {
        togo.resolve(body);
    });
    return togo;
};

gpii.postgre.loadLocalAllCouchDocs = function () {
    var togo = fluid.promise();

    togo.resolve(JSON.parse(fs.readFileSync("./_all_docs.json")));

    return togo;
};

gpii.postgre.pool = new pg.Pool({
    database: "sgithens"
});

gpii.postgre.firstQuery = function () {
    gpii.postgre.pool.query("select * from all_docs", function (err, res) {
        console.log("All docs: ", JSON.stringify(res, null, 4));
        gpii.postgre.pool.end()
    });
};

gpii.postgre.importSingleCouchDoc = function (pool, doc) {
    var importQuery = "insert into all_docs(doc_id, type, doc, docb) values ($1, $2, $3, $4) returning ID";
    var importValues = [doc._id, doc.type, doc, doc];
    pool.query(importQuery, importValues, function (err, res) {
        console.log("Just imported: ", err, res);
    });
};

gpii.postgre.importAllCouchDocs = function () {
    gpii.postgre.loadLocalAllCouchDocs().then(function (data) {
        fluid.each(data.rows, function (item) {
            gpii.postgre.importSingleCouchDoc(gpii.postgre.pool, item.doc);
        });
    });
};

gpii.postgre.importAllCouchDocs();
