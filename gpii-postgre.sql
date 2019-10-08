/*
 * First Approach. Just create a table for all the docs, include the documents as
 * binary json so that query indexes can be created on specific dotted properties in
 * the json. When a postgre jsonb index tries to index an entry where the dotted path
 * does not exist, it merely indexes it as NULL. So, theoretically we should still be
 * able to perform all our regular queries by matching the `row.type` and then some jsonb
 * property that we've indexed in prepration for querying on that type.
 *
 */

/* NOTE: Trying out indexes, features, and performance of both json and jsonb types */
create table all_docs (
	ID serial NOT NULL PRIMARY KEY,
	doc_id VARCHAR (255) UNIQUE NOT NULL,
	type VARCHAR (255) NOT NULL,
	doc json NOT NULL,
    docb jsonb NOT NULL
);

/* "views": { */

/* We should make some indexes */
create index gpiiKeyPrefsSetId on all_docs (docb->'prefsSafeId');
create index oauth2ClientClientId on all_docs (docb->'clientId');
create index oauth2ClientRevoked on all_docs (docb->'revoked');
/* incase we want to look up anything by it's jsonb doc instead of the one I'm putting in doc_id on import */
create index prefsSafe_id on all_docs (docb->'_id')

/* Apparently there is a thing called a "GIN" index which will automatically index all the
 * columns/properties in a jsonb field?!?!? craZ
 *
 * http://postgresguide.com/cool/json.html
 */

CREATE INDEX idx_all_docs_docb ON all_docs USING GIN (docb);

/*    "findPrefsSafeByGpiiKey": {
        "map": {
            if (doc.type === 'gpiiKey') {
                var record = { gpiiKey: doc};
                if (doc.prefsSafeId) {
                    record._id = doc.prefsSafeId; };
                    emit(doc._id, record)
                    }
                }
            }
    },
*/
/* Inner join the all_docs table on itself */
select
    prefsSafe.docb
from
    all_docs prefsSafe
inner join
    all_docs gpiiKey on gpiiKey.docb->'prefsSafeId' = prefsSafe.doc_id
where
    gpiiKey.doc_id = $1
values ($1);
    /* or... all_docs gpiiKey on gpiiKey.docb->'prefsSafeId' = prefsSafe.docb->'_id' */

/*
    "findClientByOauth2ClientId": {
        "map": "function(doc) {
            if (doc.type === 'clientCredential' && doc.revoked === false) {
                var record = { clientCredential: doc };
                if (doc.clientId) {
                    record._id = doc.clientId;
                }
                emit(doc.oauth2ClientId, record);
            }
        }"
    },
*/
select *
from
    all_docs oauth2Client
where
    oauth2Client.type = 'clientCredential',
    oauth2Client.docb.revoked = false,
    oauth2Client.docb.clientId = $1
values ($1);

/*
    "findInfoByAccessToken": {
        "map": "function(doc) {
            if (doc.type === 'gpiiAppInstallationAuthorization' && doc.revoked === false) {
                var record = { authorization: doc };
                if (doc.clientCredentialId) {
                    record._id = doc.clientCredentialId;
                }
            emit(doc.accessToken, record);
            }"
    },
*/

    "findSnapsetPrefsSafes": {
        "map": "function(doc) {if (doc.type === 'prefsSafe' && doc.prefsSafeType === 'snapset') { emit(doc._id, doc); }}"
    },
    "findAllGpiiKeys": {
        "map": "function(doc) {if (doc.type === 'gpiiKey') { emit(doc._id, doc); }}"
    },
    "findAccessTokenByExpires": {
        "map": "function(doc) {if (doc.type === 'gpiiAppInstallationAuthorization') emit(Date.parse(doc.timestampExpires), doc); }"
    },
    "findDocsBySchemaVersion": {
        "map": "function(doc) {emit(doc.schemaVersion, doc); }"
    }
}

/*
 * Second approach. Just create regular tables, one for each of our existing `doc.type`s.
 List is from DbConst.js `gpii.dbOperation.docTypes`
 */

create table gpiiKey (

);

create table prefsSafe (

);

create table clientCredential (

);

create table gpiiAppInstallationClient (

);

create table gpiiAppInstallationAuthorization (

);
