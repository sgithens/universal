# GPII Schemas Change Log

This change log describes all changes made to the CouchDB document based data schemas for the
GPII. If applicable a ticket documenting the work done for each change is included. Additionally,
a git commit hash is listed, which can be used to checkout a version of the code at that schema
for reference.

## 0.3 2019-07-XX GPII-2966

- Ticket: [GPII-2966](https://issues.gpii.net/browse/GPII-2966)
- Git Commit: pending

This work increments the `schemaVersion` for all GPII documents to version `0.3`. For documents
of type `prefsSafe` it removes deprecated field `password` from the document.

This ticket also introduces a new document type `gpiiCloudSafeCredential`, however given it has
no previous occurances in our datastore and is not required for previously existing data, no
migrations are included for it.

## 0.2 2019-06-XX GPII-3717

- Ticket: [GPII-3717](https://issues.gpii.net/browse/GPII-3717)
- Git Commit: pending

This work increments the `schemaVersion` for all GPII documents to version `0.2`.  For documents
of type `clientCredential` it adds four new fields with the following defaults:

```json
{
"allowedIPBlocks": null,
"allowedPrefsToWrite": null,
"isCreateGpiiKeyAllowed": false,
"isCreatePrefsSafeAllowed": false
}
```

## 0.1 Pre June 2019

- Git Commit: 9bd021f95b3fe64a6a9d1fdcd18b8e8044007187

Previously throughout the project, and prior to production usage and datastores, the `schemaVersion`
field was kept at 1.0 for all changes and modifications.
