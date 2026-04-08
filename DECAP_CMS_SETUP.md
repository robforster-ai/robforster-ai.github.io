# Decap CMS Setup Guide

Decap CMS uses GitHub as its backend but requires an OAuth proxy to handle authentication.
The free option is Netlify's identity service, which you can configure without deploying your
site there.

## Step 1 — Create a Netlify account

Go to https://netlify.com and sign up for a free account (use GitHub to sign in for simplicity).

## Step 2 — Create a blank Netlify site

1. In the Netlify dashboard, click **Add new site → Deploy manually**
2. Drag in any empty folder — Netlify just needs a site to attach OAuth to
3. Note the site URL (e.g. `https://quirky-site-name-123.netlify.app`)

## Step 3 — Configure GitHub OAuth on the Netlify site

1. Go to **Site configuration → Access & security → OAuth**
2. Click **Install provider → GitHub**
3. Follow the prompts — Netlify will guide you through creating a GitHub OAuth App
4. Once connected, you'll see GitHub listed as an enabled provider

## Step 4 — Add the Netlify base_url to your CMS config

Open `admin/config.yml` and uncomment / update the `base_url` line:

```yaml
backend:
  name: github
  repo: robforster-ai/robforster-ai.github.io
  branch: main
  base_url: https://YOUR-NETLIFY-SITE.netlify.app
```

Replace `YOUR-NETLIFY-SITE` with your actual Netlify subdomain.

## Step 5 — Push the change and test

1. Commit and push the updated `admin/config.yml`
2. Visit `https://robforster-ai.github.io/admin/`
3. Click **Login with GitHub** — you should be redirected to GitHub for authorisation
4. Once authorised, you'll land in the Decap CMS editor

## Troubleshooting

- **"Not Found" after OAuth redirect**: double-check the `base_url` exactly matches your Netlify site URL (no trailing slash)
- **Permission errors**: ensure the GitHub OAuth app has access to the `robforster-ai` organisation/user
- **Posts not appearing**: Decap CMS reads from the `_posts/` folder — check the collection `folder` in `admin/config.yml`
