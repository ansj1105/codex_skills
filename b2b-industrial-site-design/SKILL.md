---
name: b2b-industrial-site-design
description: Use when designing or refactoring manufacturing, optical, industrial equipment, or enterprise B2B websites that must feel credible, restrained, and non-generic. Prefer full-width sections, low-radius controls, disciplined typography, and information-first layouts over card-heavy, playful, or "AI-generated" styling.
---

# B2B Industrial Site Design

Apply this skill for corporate product sites where trust, precision, and technical credibility matter more than novelty.

## Core rules

1. Prefer structure over decoration.
- Use full-width sections with inner containers.
- Use borders, spacing, and background tone shifts to separate content.
- Do not default to floating cards for major layout blocks.
- Align subpage hero copy with the effective start line of body content. Do not leave hero copy glued to the viewport edge or visibly offset from the page body rhythm.
- Default page wrapper can be a light gray, while the actual reading surfaces stay white.
- When a page has local navigation, place that sub nav directly under the sub hero rather than floating it mid-content.

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
- Avoid flat pure-white page stacks. Use a controlled off-white or gray wrapper for page separation.
- Use white content blocks and thin borders over that wrapper to maintain readability.

5. Header and footer must be architectural.
- Full-width bars.
- Clean navigation rhythm.
- Dropdowns should read as information layers, not toy popovers.
- Footer should feel like a company information band, not a floating widget.
- Top-nav hover indicators should sit on the header baseline, not float under the text.
- If CSS hover keeps dropdowns open after client-side navigation, add a click-to-suppress pattern until the pointer leaves the nav region.
- On desktop dropdowns, prefer text-color hover changes over background-fill hover when the target brand tone is restrained.
- On mobile, 2depth items must stay collapsed until explicitly opened.
- If horizontal sub navigation is used on mobile, add left/right controls that only appear when scrolling in that direction is actually possible.

6. Product and application pages should read like solution pages.
- Use page headers, index anchors, technical summaries, and vertical content flow.
- Prefer image/diagram zones plus concise bullet points.
- Keep content density professional.
- Mirror the site map in navigation depth. If a section has meaningful child pages, expose them as 2depth items instead of hiding them in body content only.
- Product detail pages should share a common structure:
  sub hero -> product sub nav -> main hero/detail visual -> technical sections.
- Application pages can use a one-page vertical showcase with an anchor index rather than disconnected cards.
- Resources pages should prefer list/table patterns over promo-card patterns.
- Contact-related pages should be unified around a single inquiry flow and consistent sub navigation.

7. Avoid obvious AI-site signals.
- Do not stack multiple oversized rounded boxes.
- Do not overuse glassmorphism, soft shadows, gradients, or generic feature chips.
- Do not put implementation metadata on customer-facing pages.
- Remove customer-visible text that explains CMS, SEO, DB, SMTP, deployment, or admin capabilities unless the page is explicitly for operators.
- Preserve brand assets. If the provided logo is raster-only, keep it for site branding and create separate OG/social compositions around it rather than redrawing the logo arbitrarily.
- Do not leave placeholder copy like "Section 1", "Section 2", "Overview", or implementation-oriented labels unless they serve a real user-facing purpose.
- Rewrite software or product explanatory images into real text/table markup when those structures are likely to recur across pages.

8. Handle sub hero backgrounds carefully.
- If sub hero imagery is strong, lower the image opacity instead of lowering text opacity.
- Never set opacity on the copy container itself.
- Improve readability with overlays and light text-edge treatment rather than blurring or fading the text.
- Use a shared sub hero system so pages can change eyebrow, title, lead, image, and opacity independently.

9. Treat image performance as a design requirement.
- Large above-the-fold images should not be attached only as raw CSS backgrounds when framework image optimization is available.
- Prefer framework image components for hero and sub hero backgrounds when possible.
- Add explicit `sizes` for responsive images.
- Mark only true above-the-fold visuals as priority.
- Audit the largest assets first before tuning layout details.

## Working method

1. Audit current UI for trust-breaking patterns.
2. Flatten the layout first: sections, bars, spacing, borders.
3. Reduce radius and decorative effects globally.
4. Rewrite hero and navigation to be product-first.
5. Check desktop, tablet, and mobile separately.
6. Verify hover, click-through, submenu dismissal, and horizontal sub-nav controls after navigation.
7. Audit customer-facing copy for implementation metadata and remove it.
8. Audit large imagery and confirm it is optimized for first render.

## Output contract

When applying this skill, always state:
- Which components were flattened or de-carded.
- Radius and visual-language decisions.
- Remaining places that still look too soft, playful, or generic.
- Whether sub hero/navigation patterns are consistent across related pages.
- Whether any large image assets still need re-encoding or size reduction.
