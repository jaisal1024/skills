# Database changes

Read this for migrations, SQL, query builders, transactions, locks, indexes, and jsonb columns. Raise a finding only when the code in front of you shows the problem. Local examples for this area, when present, are in the matching file of the local store (see `SKILL.md`).

## Read, check, and write in one transaction

A check that uses a row read outside the lock is a race. Ask for one transaction with a row lock (`FOR UPDATE`), or for the write to happen inside the existing lock. When the repository has a shared lock for the resource, use it.

## Thread one transaction through, do not open a second

A helper that opens its own transaction cannot join the caller's transaction. Every DB action takes the transaction as an argument. A handler with more than one write runs them in one transaction.

## Use database time for a timestamp compare

A JavaScript date and a database timestamp drift. Write and compare timestamps with the database clock.

## Bound jsonb growth

Ask how large a jsonb column can grow. Ask to move large payloads to object storage.

## Read from the source of truth

Read the row from the database instead of invalidating a cache and then reading through the cache.

## Know what happens when one item in a batch fails

Use the repository's batch helper. Ask how the code handles a failure inside a batch.

## Validate data you read back

Ask whether data read from a jsonb column or an external source goes through schema validation.

## A match key keeps different records apart

When code reuses, de-dupes, or upserts a record, make sure the match key keeps apart records that hold different content. A record that belongs to one caller must not match a request from another.
