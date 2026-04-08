# Plausible Analytics Setup Guide

The site already has the Plausible script embedded in `_includes/head.html`, pointed at
`robforster-ai.github.io`. You just need to create the free Plausible account and register
your domain.

## Step 1 — Create a Plausible account

Go to https://plausible.io and click **Get started** — choose the free trial (30 days),
which converts to a paid plan. Alternatively, for a fully free option, consider
self-hosting Plausible CE (see https://plausible.io/self-hosted-web-analytics).

## Step 2 — Add your site

1. After signing in, click **Add a website**
2. Enter `robforster-ai.github.io` as the domain
3. Leave timezone as your local timezone

## Step 3 — Verify the script is installed

The tracking script is already in `_includes/head.html`:

```html
<script defer data-domain="robforster-ai.github.io" src="https://plausible.io/js/script.js"></script>
```

Plausible will automatically confirm tracking is working once it receives its first
pageview after your site goes live.

## Step 4 — View your dashboard

Your analytics dashboard will be at:
`https://plausible.io/robforster-ai.github.io`

(Only visible to logged-in Plausible account holders — not public by default.)

## Notes

- Plausible is GDPR-compliant and cookie-free — no consent banner needed
- Data is typically visible within a few minutes of first pageview
- The `robots.txt` currently blocks crawlers, so analytics will only show real visitor traffic
