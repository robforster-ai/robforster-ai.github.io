#!/usr/bin/env python3
"""
Generate Open Graph images for robforster-ai.github.io.

Usage (from repository root):
    python scripts/generate-og-images.py

Outputs:
    assets/img/og-default.png        — Default OG image for pages without a specific one
    assets/img/og/<slug>.png         — Per-post OG images (one per file in _posts/)

Requires:
    pip install Pillow python-frontmatter
"""

import os
import re
import glob
import sys
from pathlib import Path


# ── Auto-install dependencies ──────────────────────────────────────────────────
def require(package, import_name=None):
    import_name = import_name or package
    try:
        return __import__(import_name)
    except ImportError:
        import subprocess
        print(f"Installing {package}...")
        subprocess.run([sys.executable, '-m', 'pip', 'install', package, '--quiet'], check=True)
        return __import__(import_name)


PIL_Image      = require('Pillow', 'PIL')
from PIL import Image, ImageDraw, ImageFont
frontmatter    = require('python-frontmatter', 'frontmatter')


# ── Palette ────────────────────────────────────────────────────────────────────
GOLD  = (176, 141, 87)
NAVY  = (42,  74,  127)
INK   = (17,  18,  16)
PAGE  = (253, 252, 249)
SOFT  = (122, 121, 116)
WHITE = (255, 255, 255)

# ── Font discovery ─────────────────────────────────────────────────────────────
_FONT_DIRS = [
    '/System/Library/Fonts/Supplemental',
    '/System/Library/Fonts',
    '/Library/Fonts',
    '/usr/share/fonts/truetype',
    '/usr/share/fonts/truetype/dejavu',
]

_BOLD_NAMES   = ['Arial Bold.ttf', 'Helvetica-Bold.ttf', 'DejaVuSans-Bold.ttf',
                  'Trebuchet MS Bold.ttf', 'Arial Black.ttf']
_REGULAR_NAMES = ['Arial.ttf', 'Helvetica.ttf', 'DejaVuSans.ttf', 'Trebuchet MS.ttf',
                   'Georgia.ttf']
_ITALIC_NAMES  = ['Georgia Italic.ttf', 'Arial Italic.ttf', 'DejaVuSans-Oblique.ttf',
                   'Trebuchet MS Italic.ttf']


def load_font(size, bold=False, italic=False):
    names = _BOLD_NAMES if bold else (_ITALIC_NAMES if italic else _REGULAR_NAMES)
    for d in _FONT_DIRS:
        for name in names:
            path = os.path.join(d, name)
            if os.path.exists(path):
                try:
                    return ImageFont.truetype(path, size)
                except Exception:
                    pass
    # Last resort: pillow bundled font (tiny bitmap, but won't crash)
    return ImageFont.load_default()


# ── Drawing helpers ────────────────────────────────────────────────────────────
def draw_gradient_bar(draw, w, y=0, h=6):
    """Render a pixel-perfect gold→navy gradient bar."""
    for x in range(w):
        t = x / max(w - 1, 1)
        r = int(GOLD[0] + (NAVY[0] - GOLD[0]) * t)
        g = int(GOLD[1] + (NAVY[1] - GOLD[1]) * t)
        b = int(GOLD[2] + (NAVY[2] - GOLD[2]) * t)
        draw.line([(x, y), (x, y + h - 1)], fill=(r, g, b))


def blend_over(bg, fg, alpha):
    """Alpha-composite fg (RGB) over bg (RGB), returning a blended RGB tuple."""
    return tuple(int(bg[i] * (1 - alpha) + fg[i] * alpha) for i in range(3))


def text_width(draw, text, font):
    """Return pixel width of text (compatible across Pillow versions)."""
    try:
        bbox = draw.textbbox((0, 0), text, font=font)
        return bbox[2] - bbox[0]
    except AttributeError:
        w, _ = draw.textsize(text, font=font)
        return w


def draw_wrapped(draw, text, font, x, y, max_w, fill, line_h, max_lines=99):
    """Word-wrap and draw text. Returns total pixel height used."""
    words = text.split()
    lines, cur = [], []
    for word in words:
        test = ' '.join(cur + [word])
        if text_width(draw, test, font) > max_w and cur:
            lines.append(' '.join(cur))
            cur = [word]
        else:
            cur.append(word)
    if cur:
        lines.append(' '.join(cur))
    lines = lines[:max_lines]
    for i, line in enumerate(lines):
        draw.text((x, y + i * line_h), line, font=font, fill=fill)
    return len(lines) * line_h


def add_overlay_text(img, text, font, pos, fill_rgba):
    """Composite RGBA text onto an RGB image (enables per-pixel alpha)."""
    overlay = Image.new('RGBA', img.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.text(pos, text, font=font, fill=fill_rgba)
    base = img.convert('RGBA')
    out  = Image.alpha_composite(base, overlay)
    return out.convert('RGB')


# ── Image generators ───────────────────────────────────────────────────────────
def generate_default(path):
    """
    Default OG image — warm ivory background, split layout.

    Left 62%: eyebrow, name, subtitle, rule, URL
    Right 38%: navy panel with decorative quote mark + italic tagline
    """
    W, H = 1200, 630
    img  = Image.new('RGB', (W, H), PAGE)
    draw = ImageDraw.Draw(img)

    # Gradient top bar
    draw_gradient_bar(draw, W)

    # Right navy panel
    panel_x = int(W * 0.62)
    draw.rectangle([panel_x, 0, W, H], fill=NAVY)

    # Decorative " at low opacity on navy panel
    q_font = load_font(300, bold=True)
    gold_dim = GOLD + (int(255 * 0.15),)
    img = add_overlay_text(img, '\u201c', q_font, (panel_x + 18, 50), gold_dim)
    draw = ImageDraw.Draw(img)

    # Right-panel centred italic tagline
    it_font = load_font(27, italic=True)
    panel_lines = ['Practitioner insights on', 'enterprise AI delivery']
    cx = panel_x + (W - panel_x) // 2
    total_h = len(panel_lines) * 44
    ty = (H - total_h) // 2
    for i, line in enumerate(panel_lines):
        lw = text_width(draw, line, it_font)
        draw.text((cx - lw // 2, ty + i * 44), line, font=it_font, fill=WHITE)

    # Left content
    lp = 72

    # Eyebrow
    ey_font = load_font(17)
    draw.text((lp, 76), 'ENTERPRISE AI · PROGRAMME DELIVERY', font=ey_font, fill=GOLD)

    # Name
    nm_font = load_font(72, bold=True)
    draw.text((lp, 122), 'Rob Forster', font=nm_font, fill=NAVY)

    # Subtitle
    sb_font = load_font(30)
    draw.text((lp, 226), 'Enterprise AI Transformation Lead', font=sb_font, fill=SOFT)

    # Gold rule beneath subtitle
    draw.rectangle([lp, 276, lp + 60, 279], fill=GOLD)

    # Site URL at bottom-left
    url_font = load_font(20)
    draw.text((lp, H - 66), 'robforster-ai.github.io', font=url_font, fill=SOFT)

    img.save(str(path), 'PNG')
    print(f'  ✓  {path}')


def generate_post(title, category, date_str, path):
    """
    Per-post OG image — dark ink background, gold category pill, wrapped title.

    Left 65%: category pill, title, author line, date
    Right 35%: semi-transparent navy panel with RF monogram texture
    """
    W, H = 1200, 630

    img  = Image.new('RGB', (W, H), INK)
    draw = ImageDraw.Draw(img)

    # Gradient top bar
    draw_gradient_bar(draw, W)

    # Right navy panel at 40% opacity (pre-blended with ink background)
    panel_x  = int(W * 0.65)
    panel_col = blend_over(INK, NAVY, 0.40)
    draw.rectangle([panel_x, 0, W, H], fill=panel_col)

    # RF monogram at low opacity on right panel
    rf_font  = load_font(220, bold=True)
    gold_dim = GOLD + (int(255 * 0.14),)
    img  = add_overlay_text(img, 'RF', rf_font, (panel_x + 50, 150), gold_dim)
    draw = ImageDraw.Draw(img)

    lp         = 72
    right_edge = panel_x - 56

    # Category pill (rounded border, no fill)
    pill_font = load_font(17)
    cat_upper = category.upper()
    cat_w     = text_width(draw, cat_upper, pill_font)
    pp, ph    = 14, 30
    pill_y    = 58
    try:
        draw.rounded_rectangle(
            [lp - 1, pill_y, lp + cat_w + pp * 2 + 1, pill_y + ph],
            radius=4, outline=GOLD, width=1
        )
    except AttributeError:
        # Pillow < 8.2 fallback
        draw.rectangle(
            [lp - 1, pill_y, lp + cat_w + pp * 2 + 1, pill_y + ph],
            outline=GOLD, width=1
        )
    draw.text((lp + pp, pill_y + 7), cat_upper, font=pill_font, fill=GOLD)

    # Post title (wrapped, white, bold)
    t_font   = load_font(52, bold=True)
    title_y  = 128
    used_h   = draw_wrapped(draw, title, t_font, lp, title_y,
                            right_edge - lp, WHITE, 68, max_lines=3)

    # Author line
    auth_font = load_font(23)
    auth_y    = title_y + used_h + 22
    draw.text((lp, auth_y), 'Rob Forster · robforster-ai.github.io',
              font=auth_font, fill=SOFT)

    # Date (bottom-left)
    date_font = load_font(21)
    draw.text((lp, H - 66), date_str, font=date_font, fill=SOFT)

    # Gold rule at y=580
    draw.rectangle([0, 580, W, 582], fill=GOLD)

    img.save(str(path), 'PNG')
    print(f'  ✓  {path}')


# ── Main ───────────────────────────────────────────────────────────────────────
def slug_from_filename(filename):
    """Extract slug from YYYY-MM-DD-slug.md filename."""
    m = re.match(r'^\d{4}-\d{2}-\d{2}-(.+)\.md$', os.path.basename(filename))
    return m.group(1) if m else Path(filename).stem


def main():
    root      = Path(__file__).resolve().parent.parent
    posts_dir = root / '_posts'
    og_dir    = root / 'assets' / 'img' / 'og'
    default   = root / 'assets' / 'img' / 'og-default.png'

    og_dir.mkdir(parents=True, exist_ok=True)

    print('Generating OG images...\n')

    # Default image (always regenerate to pick up design changes)
    print('Default OG image:')
    generate_default(default)
    print()

    # Per-post images (skip existing to avoid needless regeneration)
    post_files = sorted(posts_dir.glob('*.md'))
    count = 0
    print(f'Post images ({len(post_files)} post(s) found):')

    for pf in post_files:
        slug = slug_from_filename(str(pf))
        out  = og_dir / f'{slug}.png'

        if out.exists():
            print(f'  –  {slug}.png (already exists, skipping)')
            continue

        post     = frontmatter.load(str(pf))
        title    = post.get('title', 'Rob Forster')
        category = post.get('category', 'Enterprise AI')
        date     = post.get('date', '')

        if hasattr(date, 'strftime'):
            try:
                date_str = date.strftime('%-d %B %Y')
            except ValueError:
                date_str = date.strftime('%d %B %Y').lstrip('0')
        else:
            date_str = str(date)[:10]

        generate_post(title, category, date_str, out)
        count += 1

    print(f'\nGenerated {count} OG image(s) in assets/img/og/')


if __name__ == '__main__':
    main()
