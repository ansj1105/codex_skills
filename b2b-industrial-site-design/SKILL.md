---
name: b2b-industrial-site-design
description: Use when designing or refactoring manufacturing, optical, industrial equipment, or enterprise B2B websites that must feel credible, restrained, and non-generic. Prefer full-width sections, low-radius controls, disciplined typography, and information-first layouts over card-heavy, playful, or AI-looking styling.
---

# B2B Industrial Site Design

Apply this skill for corporate product sites where trust, precision, and technical credibility matter more than novelty.

## Core rules

1. Prefer structure over decoration.
- Use full-width sections with inner containers.
- Use borders, spacing, and background tone shifts to separate content.
- Do not default to floating cards for major layout blocks.
- Align subpage hero copy with the effective start line of body content.

2. Keep shape language restrained.
- Buttons: 8px to 12px radius.
- Panels: 0px to 12px radius unless there is a clear visual reason.
- Avoid pill buttons unless the brand already uses them.

3. Design for credibility.
- Typography should feel engineered, not playful.
- Use strong hierarchy, moderate weight contrast, and tight spacing control.
- Avoid marketing fluff, product-irrelevant slogans, and UI meta copy.

4. Use color conservatively.
- Base palette: white, blue, gray, steel tones.
- Avoid loud gradients, glowing accents, and decorative blobs unless they express product technology directly.
- Interactive blue should feel corporate, not candy-like.

5. Header and footer must be architectural.
- Full-width bars.
- Clean navigation rhythm.
- Dropdowns should read as information layers, not toy popovers.
- Footer should feel like a company information band, not a floating widget.
- Top-nav hover indicators should sit on the header baseline, not float under the text.
- If CSS hover keeps dropdowns open after client-side navigation, add a click-to-suppress pattern until the pointer leaves the nav region.

6. Product and application pages should read like solution pages.
- Use page headers, index anchors, technical summaries, and vertical content flow.
- Prefer image or diagram zones plus concise bullet points.
- Keep content density professional.
- Mirror the site map in navigation depth when child pages have real value.

7. Avoid obvious AI-site signals.
- Do not stack multiple oversized rounded boxes.
- Do not overuse glassmorphism, soft shadows, gradients, or generic feature chips.
- Do not put implementation metadata on customer-facing pages.
- Remove copy that explains CMS, SEO, DB, SMTP, deployment, or admin capabilities unless the page is explicitly operator-facing.
- Preserve brand assets. If the supplied logo is raster-only, keep it for site branding and create separate OG compositions around it rather than redrawing the logo arbitrarily.

## Working method

1. Audit the current UI for trust-breaking patterns.
2. Flatten the layout first: sections, bars, spacing, borders.
3. Reduce radius and decorative effects globally.
4. Rewrite hero and navigation to be product-first.
5. Check desktop, tablet, and mobile separately.
6. Verify hover, click-through, and submenu dismissal behaviors after navigation.

## Output contract

When applying this skill, always state:
- Which components were flattened or de-carded.
- Radius and visual-language decisions.
- Remaining places that still look too soft, playful, or generic.
