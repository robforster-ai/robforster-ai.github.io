---
title: "The year of the agent, and the governance gap"
date: 2026-07-08
category: essay
tags: [agents, governance, delivery]
read_time: "6 min"
excerpt: "Everyone rebadged last year's chatbot as an 'agent'. The org-chart problem didn't go away — it got an API. What a working governance model for autonomous agents actually looks like."
---

Sometime around January, every stalled 2025 chatbot pilot quietly got renamed. It was an "agent" now.

Some of them genuinely were. Most were the same retrieval bot with a scheduler bolted on and a bigger budget line. Either way, the interesting question isn't whether your agents are real. It's whether anyone in the building could tell you, on a Tuesday afternoon, exactly what one of them is allowed to do unattended.

## The failure mode is familiar

Gartner reckons [over 40% of agentic AI projects will be cancelled by the end of 2027](https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-predicts-over-40-percent-of-agentic-ai-projects-will-be-canceled-by-end-of-2027), and the reasons they give — escalating cost, unclear business value, inadequate risk controls — should sound tediously familiar to anyone who read my last three posts. These are not new failure modes. They're the same ones that killed the pilots. Autonomy just raises the stakes on getting them wrong.

Here's the reframe I give sponsors: an agent is a new joiner you gave production access to before the background check cleared. It doesn't get tired, which is good. It also doesn't get nervous, which is the problem. A junior who's about to do something irreversible usually hesitates. An agent commits.

## The org-chart problem, now with an API

The four roles I insist on for any production use case — use-case owner, model owner, data owner, operator — still apply. Agents don't replace that structure. They stress-test it. Three questions get added:

1. **Who owns the authority envelope?** Not "what can the agent technically do" — what is it *permitted* to do without a human in the loop? Written down, before launch.
2. **Who holds the kill switch, and can they pull it alone?** If pausing a misbehaving agent requires convening a steering group that meets next Thursday, you don't have a kill switch. You have a suggestion.
3. **Who reads the audit trail — daily?** Not after the incident. An audit log nobody opens is just storage costs.

## Don't govern every agent the same way

The other trap is over-correcting into one big policy. Gartner published a warning in May that [applying uniform governance across all AI agents will itself cause failure](https://www.gartner.com/en/newsroom/press-releases/2026-05-26-gartner-says-applying-uniform-governance-across-ai-agents-will-lead-to-enterprise-ai-agent-failure), and they're right. A read-only agent that summarises tickets and an agent that can move money cannot share a control model. Govern by blast radius, not by org tidiness.

In practice that means the escalation table from my governance post grows one row:

> When an agent is about to take an irreversible action outside its envelope — pause automatically, and require a named human to sign off. Not a committee. One person, on call.

## Same answer as last year

None of this is about the model. The agent programmes that reach production in 2026 will not be the ones with the cleverest orchestration. They'll be the ones that gave every agent a named human owner, a defined authority envelope, and a runbook — before anyone switched it on.

The technology changed. The bug is still in the org-chart.
