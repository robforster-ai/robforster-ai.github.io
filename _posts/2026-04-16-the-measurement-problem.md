---
title: "The measurement problem"
date: 2026-04-16
category: memo
tags: [measurement, observability, ops]
read_time: "4 min"
excerpt: "If you can't see what your model is doing in production, you don't have a model in production. You have an exposure."
---

A short memo, because this comes up every week.

The single most reliable predictor of whether an AI programme survives its first year of production is whether the team built the measurement spine *before* they shipped the model.

## Three layers, all of them required

1. **Eval in CI.** Every change to prompt, model, or retrieval re-runs a fixed eval suite before merge. The suite is curated by the model owner and grows when production surfaces a new failure mode.
2. **Shadow mode in pre-prod.** Run the new version against live traffic without serving its outputs. Compare to the incumbent on the metrics that matter — accuracy, latency, cost — for at least two weeks before promoting.
3. **Structured logging in prod.** Every inference logs inputs, outputs, confidence, latency, and downstream user action. Sampled human review on a queue. Drift dashboards that the model owner actually opens.

If any of those three is missing, you don't have governance. You have a hope.

## What "measurement is governance" means

Compliance teams sometimes think governance is a quarterly review meeting. It isn't. Governance is the ability, at any point, to answer: *what is this model doing right now, and is that what we agreed it should be doing?*

If the answer requires a four-week analyst engagement, you don't have governance.
