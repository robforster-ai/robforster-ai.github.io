---
title: "AI governance: roles & responsibilities"
date: 2026-04-16
category: essay
tags: [governance, raci, delivery]
read_time: "6 min"
excerpt: "A working RACI for production AI. Who owns the model, who owns the data, who owns the outcome — and what to do when those answers aren't the same person."
---

Most "AI governance frameworks" I see on consultancy decks are committee structures, not RACI. A committee reviewing a model once a quarter is not governance. Governance is knowing, on a Tuesday afternoon when something goes wrong, exactly which named human gets paged.

## The four roles

For any production AI use case I run, four roles have to be filled and named:

- **Use-case owner** — accountable for the business outcome. Has the budget. Signs off on go-live.
- **Model owner** — accountable for the model in production. Owns the eval suite, the threshold, the rollback.
- **Data owner** — accountable for the upstream data. Owns the schema, the lineage, the SLAs.
- **Operator** — runs the day-to-day. First line of triage. Owns the runbook.

These can be different people in different teams. They can't be the same role. If you've combined "model owner" and "use-case owner" into one person, you've built a single point of failure with no checks against optimism.

## What gets escalated

A clean governance design tells you, before launch, what each role is allowed to decide alone and what gets escalated:

| Decision | Operator | Model owner | Use-case owner | Exec sponsor |
|---|---|---|---|---|
| Daily triage | ✅ | | | |
| Threshold tweak (<10%) | | ✅ | | |
| Threshold tweak (>10%) | | propose | ✅ | |
| Model swap | | propose | ✅ | inform |
| Pause production | ✅ (auto) | ✅ | ✅ | inform |
| Permanent rollback | | propose | ✅ | ✅ |

The point is not the table. The point is that the table exists, on the wiki, before the model goes live. If you can't fill it in, you're not ready to launch.

## The failure mode

The most common governance failure I see isn't malice or negligence. It's that the model owner has been given accountability without authority. They can see a problem, but they can't pause production without convening a steering group that meets next Thursday.

Fix that one thing — operator + model owner can pause without asking — and you've removed the single biggest cause of "AI in the news for the wrong reasons."

---

*Update, July 2026.* Two things moved since I wrote this. First, the EU pushed the high-risk (Annex III) obligations of the AI Act back under its "Digital Omnibus" package, [from 2 August 2026 to 2 December 2027](https://www.insideglobaltech.com/2026/05/28/eu-ai-act-update-timeline-relief-targeted-simplification-and-new-prohibitions/). That's real breathing room, and a bad excuse to let your own governance slip with the deadline. Second, Gartner now warns that [applying one uniform governance model across all your AI agents will itself cause failure](https://www.gartner.com/en/newsroom/press-releases/2026-05-26-gartner-says-applying-uniform-governance-across-ai-agents-will-lead-to-enterprise-ai-agent-failure). The four roles above still hold, but agents need a per-agent version of the table, scaled to blast radius. I wrote up what that looks like in [the year of the agent]({% post_url 2026-07-08-year-of-the-agent %}).
