# Rob Forster | Enterprise AI — robforster-ai.github.io

Personal website for Rob Forster, Enterprise AI Transformation Lead. Built with Jekyll and
hosted on GitHub Pages. CMS powered by Decap CMS.

---

## Local Setup

### Prerequisites

- Ruby 2.7+ (check with `ruby --version`)
- Bundler (`gem install bundler`)

### Install dependencies

```bash
bundle install
```

### Run locally

```bash
bundle exec jekyll serve
```

The site will be available at `http://localhost:4000`.

### Build for production

```bash
bundle exec jekyll build
```

Output is written to `_site/`.

---

## Publishing Posts

### Option A — Decap CMS (recommended)

1. Complete the Netlify OAuth setup in `DECAP_CMS_SETUP.md`
2. Visit `https://robforster-ai.github.io/admin/`
3. Log in with GitHub
4. Click **New Post**, fill in the fields, and click **Publish**
5. Decap CMS commits the post directly to the `_posts/` folder on `main`
6. GitHub Pages rebuilds the site automatically (allow 1–2 minutes)

### Option B — Direct file creation

1. Create a new file in `_posts/` named `YYYY-MM-DD-your-post-slug.md`
2. Add the required front matter:

```markdown
---
layout: post
title: "Your Post Title"
date: YYYY-MM-DD
category: "Enterprise AI"   # or: Delivery | Knowledge | Governance | AI Strategy | Career
excerpt: "One or two sentence summary shown in post cards."
featured: false             # set to true to feature on homepage
read_time: "5 min read"
---

Your post content here in Markdown.
```

3. Commit and push to `main` — GitHub Pages rebuilds automatically

---

## Adding Use Cases

Edit `_data/use-cases.yml`. Each entry follows this structure:

```yaml
- name: "Use Case Name"
  business: "Finance"         # Finance | HR | Supply Chain | Customer Service | IT | Legal
  process: "Automation"       # Automation | Analytics | Knowledge | Agents | Generation
  description: "Two sentence description of the use case and its value."
  impact: "High"              # High | Medium
  impact_label: "High Impact"
```

---

## Adding News Items

Edit `_data/news.yml`. Each entry follows this structure:

```yaml
- title: "Article Title"
  source: "Publication Name"
  url: "https://example.com/article"
  date: "YYYY-MM-DD"
```

Items are sorted by date (newest first) automatically.

---

## Enabling SEO (when ready to go public)

1. **Remove noindex**: Open `_includes/head.html` and delete the line:
   ```html
   <meta name="robots" content="noindex, nofollow">
   ```

2. **Update robots.txt**: Replace the current contents with:
   ```
   User-agent: *
   Allow: /

   Sitemap: https://robforster-ai.github.io/sitemap.xml
   ```

3. **Submit to Google Search Console** at https://search.google.com/search-console

---

## Adding a Custom Domain

1. Register your domain with a DNS provider
2. Create a CNAME record pointing your domain to `robforster-ai.github.io`
3. Edit the `CNAME` file in the repository root — add your domain on a single line:
   ```
   www.yourdomain.com
   ```
4. In GitHub repository settings → Pages, set the custom domain
5. Update `url` in `_config.yml` to your new domain

---

## Adding a Profile Photo

1. Place your photo in `assets/img/` (e.g. `rob-forster.jpg`)
2. Open `about.html` and replace the `photo-placeholder` div with:
   ```html
   <img src="{{ '/assets/img/rob-forster.jpg' | relative_url }}" alt="Rob Forster" style="border-radius: 8px; width: 100%;">
   ```
3. Commit and push

---

## Site Structure

```
robforster-ai.github.io/
├── _config.yml          # Jekyll configuration
├── _data/
│   ├── use-cases.yml    # Use case library
│   └── news.yml         # Curated news items
├── _includes/
│   ├── head.html        # <head> meta, fonts, CSS
│   ├── nav.html         # Sticky navigation + mobile overlay
│   └── footer.html      # Site footer
├── _layouts/
│   ├── default.html     # Base layout
│   ├── page.html        # Static page layout
│   └── post.html        # Blog post layout
├── _posts/              # Blog posts (YYYY-MM-DD-slug.md)
├── assets/
│   ├── css/main.css     # Complete design system
│   ├── js/main.js       # Scroll reveal, filters, mobile menu
│   └── img/             # Images and favicons
├── admin/
│   ├── index.html       # Decap CMS loader
│   └── config.yml       # Decap CMS configuration
├── index.html           # Homepage
├── writing.html         # Blog archive
├── use-cases.html       # Use case library
├── news.html            # News archive
└── about.html           # Bio page
```
