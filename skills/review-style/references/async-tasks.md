# Async tasks, queues, and idempotency

Read this for queue consumers, task handlers, workflow engines, webhooks, fan-out, and idempotency keys. Raise a finding only when the code in front of you shows the problem. Local examples for this area, when present, are in the matching file of the local store (see `SKILL.md`).

## Every handler is idempotent

A queue does not promise one delivery. Ask where the de-dupe lives: in the dispatch layer or in each handler.

## Use the cheapest de-dupe that works

A short-lived cache key is cheaper than a durable store, and much cheaper than running a workflow again.

## Fix retries and de-dupe once, in a shared wrapper

Put the fix at the task handler level, in one higher-order function, not in each handler.

## Let the queue retry

A handler that throws, or that times out, gets retried by the queue. Do not build a retry loop in the handler, and never enqueue the same task from its own handler. Alerts fire on the dead-letter queue, not on each retry.

## Pick the runtime by the shape of the work

Work that polls or waits for minutes goes to the workflow engine, not to a queue worker. A long task holds a worker and cuts the throughput of the whole queue. Work that a user waits on goes to the highest-priority queue.

## Removing a workflow activity can break a running workflow

A workflow that started before the deploy still references the old activity. Ask how in-flight workflows finish.

## One side effect per task

Ask to split bundled side effects into separate tasks.

## Coalesce bursts of the same work

When many events trigger the same expensive job, put the job on its own queue. De-dupe the queue by entity, and batch the work over a window. When the idea is larger than the PR, say it is out of scope and ask for a ticket.

## Wait with a bounded loop and the simplest signal

When one caller waits for another, loop over a fixed interval. Prefer polling a shared key to a heavy connection per call. Measure a heavier option before you choose it.
