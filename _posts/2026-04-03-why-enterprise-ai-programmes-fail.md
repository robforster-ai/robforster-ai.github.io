---
title: "Why enterprise AI programmes fail"
date: 2026-04-03
category: essay
tags: [delivery, governance, ops]
read_time: "8 min"
featured: true
excerpt: "The bug is rarely in the model. It's in the org-chart — ownership, sponsorship, and the gap between strategy decks and the delivery teams who have to make it real on Monday morning."
---

The bug is rarely in the model. It's in the org-chart.

I've spent the last three years walking into enterprises whose AI programmes had stalled. The pattern is almost boringly consistent: a sponsor at the top who can describe the strategy in five slides, a delivery team at the bottom who can describe the integration problem in ten Jira tickets, and nobody in the middle who owns both.

## The failure isn't technical

Vendors love to tell you the failure is technical — wrong model, wrong RAG strategy, wrong eval harness. Sometimes it is. Most of the time, the team would be delivering fine if anyone had given them a decision-rights map, a clear escalation path, and an exec who'd sat through a whole sprint review.

I keep a list of the things that actually kill programmes:

1. **No named accountable owner.** "The CDO" or "the AI council" is not an owner. An owner is one person whose calendar reflects the programme.
2. **The pilot was a demo.** A pilot has a path to production on day one. A demo has a slide-deck on day ninety.
3. **Measurement was an afterthought.** If you can't see what the model is doing in production, you don't have a model in production. You have an exposure.
4. **Change management was nobody's job.** The model can be perfect; if the people whose work it changes weren't consulted, it won't be used.

## What actually works

Programmes that scale share three things, and none of them are about the model.

> The first is a single accountable owner who can say no. Not a steering group. Not a council. One person.

The second is a measurement spine that goes live before the model does — synthetic eval in CI, shadow-mode in pre-prod, structured logging in prod, and a human review queue from week one.

The third is honest scoping. The use cases that ship are the ones where you can write the post-deployment ops runbook *before* you've trained anything. If you can't write the runbook, you don't understand the work well enough to automate it.

## Where to start, if you're stuck

If you're a year in and nothing's in production, the answer is almost never "more pilots." It's:

- Pick the one use case where the workflow is best understood by a single team.
- Get them to write the production runbook first.
- Backfill the model to the runbook.
- Ship it to one branch / region / cohort.
- Measure for ninety days before you scale anything.

It's slower than it sounds. It's also the only path I've seen actually work.

---

*Update, July 2026.* The numbers caught up with the argument. MIT's NANDA study now puts [around 95% of generative AI pilots at no measurable return on the P&L](https://fortune.com/2025/08/18/mit-report-95-percent-generative-ai-pilots-at-companies-failing-cfo/), and S&P Global has the share of firms [abandoning most initiatives before production climbing from 17% to 42%](https://www.ciodive.com/news/AI-project-fail-data-SPGlobal/742590/) in a single year. "The failure is organisational, not technical" has gone from contrarian take to consensus finding. The fix, annoyingly, hasn't changed.
