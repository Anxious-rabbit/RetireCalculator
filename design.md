# Design system: calm, focused reading

## Purpose and scope

The reference direction is a personal poetry reader: spacious, typographically thoughtful, quiet, and comfortable for sustained reading. The interface should help people understand the content without competing for their attention. Typography, useful hierarchy, and generous whitespace carry the visual character.

This document defines a reusable system for future design work. It does not describe every feature as already implemented or authorize application changes. Durable principles and starting tokens appear first; the final project section explains their application to the Federal Public Service Pension Estimator. Reader-specific patterns apply when the content calls for them.

## Durable design principles

### Visual character and color

Use a restrained, nearly monochrome palette with subtle cool or green undertones. Assign colors by meaning so appearance modes retain the same hierarchy.

| Semantic role | Light | Dark | Purpose |
| --- | --- | --- | --- |
| Page | `#F5F6F4` | `#1C211E` | Quiet background around the reading column |
| Panel | `#FFFFFF` | `#252B27` | Necessary grouping or an expanded answer |
| Primary text | `#232723` | `#E1E6DF` | Reading content, titles, and important values |
| Secondary text | `#626A63` | `#A6B0A7` | Helpers, references, and metadata that remain readable |
| Quiet emphasis | `#E7EAE5` | `#313A33` | Meaningful contextual emphasis |
| Selected surface | `#DCE2DA` | `#3C493F` | Selected controls or the current item |

These are starting tokens, not permission to skip contrast checks. Check actual foreground/background pairs in every mode and state, including secondary text on selected surfaces. Normal and secondary text must reach at least 4.5:1. Use primary text or adjust a token when a pairing fails; never make essential text faint to make it feel quiet.

In both suggested palettes, secondary text on the selected surface is approximately 4.24:1 and fails this requirement. Use the primary-text token on selected surfaces, or verify an adjusted secondary-text color before using that pairing.

Let unfilled sections and spacing do most grouping. Reserve filled surfaces for meaningful emphasis, selected controls, and expandable answers. Avoid decorative gradients, excessive cards, heavy shadows, unnecessary dividing lines, oversized dashboard compositions, and effects unrelated to reading. Use a divider only when spacing and a heading cannot explain the boundary. Modest corner radii may clarify a control or disclosure without enclosing every paragraph.

Selection must also have a visible label, marker, or semantic state. Links remain recognizable through an underline or another persistent non-color cue. Validation and caution messages use explicit words and accessible semantics; a restrained status accent may supplement them if it meets contrast requirements.

### Typography and reading rhythm

Pair restrained serif titles and English quotations with a highly readable sans-serif body. Prefer local system fonts so reading starts promptly and works offline:

```css
--font-serif: "Iowan Old Style", Baskerville, "Songti SC", STSong, Georgia, serif;
--font-sans: system-ui, -apple-system, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
```

Use the sans-serif stack for prose, controls, helpers, and numerical results. Use the serif stack for reading titles and English quotations, without ornamental styling. Preserve intentional poetry line breaks, but allow long lines to wrap on narrow screens. Identify the document language and language changes with appropriate HTML attributes.

| Reading token | Desktop starting value | Mobile starting value |
| --- | --- | --- |
| Default body size | 19px | 18px |
| Large body size | 22px | 21px |
| Extra-large body size | 25px | 24px |
| Chinese and mixed-language prose line height | 1.75–1.85 | 1.75–1.85 |
| English prose and quotation line height | About 1.6 | About 1.6 |
| Usable prose width | About 640px maximum | Available width inside side padding |
| Page side padding | Generous, fluid whitespace | About 24px |

Implement text sizes with relative units and a reader-size token so browser zoom and user preferences remain effective. Larger sizes must reflow naturally without fixed-height containers. Labels and supporting text must remain comfortable to read; they must not become an excuse for tiny disclosures or disclaimers.

Keep one clear page title and a logical heading hierarchy. As a starting point, use roughly 1.8–2.1 times the body size for the title, 1.35–1.5 for section headings, and 1.1–1.2 for subheadings, with smaller title ratios where mobile wrapping requires them. Avoid oversized hero titles that displace the content.

Use a simple spacing rhythm based on 8px, with 4px for small adjustments. Start with about one line of space between paragraphs and 32–48px between major sections; let content relationships guide the final spacing. Give analysis labels their own line before the explanation. Use bold selectively for concepts, evidence, and key values, rather than making whole paragraphs heavy.

Never truncate meaningful reading content: no line clamping, ellipses, or clipping of titles, prose, explanations, references, or answer text. Preserve text selection and copy behavior. Render authored Markdown into semantic elements when Markdown is the source; raw formatting markers must not leak into the rendered page. Literal code or syntax examples may show markers intentionally.

### Reading layout and navigation

Use one comfortable reading column, approximately 640px of usable text width on desktop, with generous surrounding whitespace. A navigation rail may sit outside this column; it must not crowd the prose. On mobile, start with approximately 24px side padding and adjust only where narrow widths or enlarged text require it.

Avoid horizontal scrolling and wide tables. Present comparisons as compact labeled rows or stacked records at narrow widths, preserving the same values and relationships. Allow long titles, URLs, and numbers to wrap safely. Use spacing and headings before adding a card grid.

For chapter-based material, show one chapter at a time. Provide a quiet desktop sidebar and an accessible mobile directory, with the current chapter identifiable by text or a marker as well as `aria-current`. Place clearly labeled previous and next chapter links at the chapter's end. At the first and last chapters, represent the boundary clearly instead of offering dead links. Navigation should retain access to the directory and establish a predictable reading start and focus location.

Place extensive metadata, references, and technical explanations behind clearly labeled secondary entrances such as “References” or “How this estimate was calculated.” Keep context needed to interpret the main content visible. Progressive disclosure must reduce visual load without concealing essential qualifications or making sources hard to find.

### Focus, settings, and interaction

Offer a focus mode in sustained-reading views. It hides secondary navigation while keeping a clearly named, keyboard-accessible way to reopen the directory or exit focus mode. Hide inactive navigation from both keyboard traversal and the accessibility tree. Never leave focus inside a hidden region.

Provide text-size controls and System, Light, and Dark appearance options. System follows the operating system preference; an explicit choice overrides it. Expose selected values through text and accessible state, not color alone. Settings should be quiet and discoverable, rather than permanently occupying a large toolbar.

Preserve the current paragraph when changing text size. Anchor restoration to a stable paragraph identifier and its relative viewport position, rather than just a pixel scroll offset, since text reflow changes document height. Keep keyboard focus on the activating control unless the interaction intentionally changes reading context. Respect browser zoom as an independent control.

Where appropriate, remember the last reading position locally and offer an explicit “Continue reading” action naming the chapter or section. Do not unexpectedly jump the reader on page load. Save a stable content identifier, paragraph anchor, and content version; handle missing or revised anchors gracefully. Provide a way to clear the position. Scroll depth represents location only and must never be described as comprehension, mastery, or a score.

For self-tests, keep answers collapsed until requested. Use a clear disclosure label such as “Show answer,” and keep the explanation complete when expanded. Opening an answer must not imply that the reader has mastered the content.

Favor native links for navigation, buttons for actions, `details`/`summary` for disclosures, and native dialogs for modal settings or directories when needed. Keep interaction behavior consistent. Optional controls must not obstruct the content when scripting or preferences are unavailable.

### Accessibility and motion

- Maintain at least 4.5:1 contrast for normal and secondary text in every supported appearance and surface. Required control boundaries and state indicators should meet at least 3:1 against adjacent colors.
- Give links and controls a visible keyboard focus indicator that remains distinguishable on all surfaces. Never remove the browser outline without an adequate replacement.
- Provide accessible names, visible form labels, semantic landmarks, logical heading order, and predictable keyboard order. Keep focus visible and clear of sticky controls.
- Aim for at least 44px by 44px touch targets for buttons and disclosure controls. Give inline links sufficient spacing without distorting prose rhythm.
- For modal dialogs, move focus to an appropriate control, keep focus within the open dialog, support Escape and a visible close action, and restore focus to the opener. A non-modal directory must not trap focus.
- Announce important dynamic results and errors without repeatedly announcing the entire reading text. Pair errors with the relevant field and an actionable explanation.
- Use only subtle, brief transitions, typically around 100–180ms, for control state changes. Respect `prefers-reduced-motion` by removing nonessential transitions and smooth scrolling. Never animate reading text continuously or use parallax, pulsing emphasis, or automatic scrolling.

### Content and implementation integrity

Maintain one canonical content source. Generate alternate reading formats, mobile/desktop representations, and exports from it rather than manually maintaining competing copies. Use stable content identifiers where reading position or cross-references depend on them. Preserve paragraph order, quotations, references, and intentional line breaks across formats.

Prefer lightweight, self-contained presentation: local fonts, semantic HTML, simple CSS, and only the JavaScript needed for behavior. Avoid unnecessary dependencies, remote fonts, trackers, and background requests. Follow links or fetch optional external material only through a clear user action when needed.

Reading must remain possible if optional settings or browser storage fail. Catch storage access and parsing failures, validate stored values, fall back to readable defaults, and keep focus, navigation, and text-size controls usable for the current session. Treat missing, stale, or corrupt preferences as optional state. A failed preference save must not blank the page or interrupt reading.

## Project-specific application: pension estimator

### Guidance to preserve

The current project is an English-language, static HTML/CSS/JavaScript calculator. Its primary task is to help visitors enter details and understand an estimate. Apply the reading system to form helpers, results, and explanations while retaining a direct path to calculation. Chapter navigation and self-tests are conditional patterns for future reading material; they are not required additions to this single-page calculator. The multilingual typography guidance supports reuse and verification without changing the current English-only product scope.

- Keep the prominent estimate-only notice, independent-tool identity, privacy statement, official sources, and rule-review date. Essential interpretation warnings must remain readable alongside results even when extended explanations are collapsed.
- Keep birth year, service start year, departure year, salary, and optional non-pensionable gap labels explicit. Preserve valid entries during validation and give actionable, associated errors.
- Preserve the distinction between leaving work and beginning pension payments. The earliest-payment view keeps service fixed after departure; nearby retirement-year comparisons change the departure year. Label these different assumptions clearly.
- Show reduced and unreduced start options as alternatives. Starting a reduced pension does not become the unreduced option at 65. Keep the lifetime portion, unreduced temporary bridge, total at start, and lifetime amount after 65 distinguishable, with annual/monthly units and disclosed rounding.
- Preserve “Not estimated” and “Not applicable” meanings; neither should silently become zero. Keep age, service, and eligibility context next to the relevant amount.
- Disclose whole-year approximation, current salary as a highest-five proxy, the estimated AMPE assumption, and exclusions such as indexing, CPP/QPP/OAS, and taxes. Detailed calculations and sources can use existing labeled disclosures.

Use the 640px measure for sustained prose. Structured inputs and short comparisons may need a modestly wider container when labels require it, but must stay subordinate to the reading hierarchy and reflow on mobile. Avoid expanding the result into an oversized dashboard. Use tabular numerals for amounts and comparisons, with selective emphasis on the value and readable units.

### Implementation boundaries and sources of truth

| File | Responsibility to retain |
| --- | --- |
| `index.html` | Page structure, form labels, estimate notice, assumptions, official links, and privacy copy |
| `styles.css` | Presentation and responsive behavior; future semantic tokens belong here |
| `js/config.js` | Canonical calculation constants and rule-review date |
| `js/pension-calculator.js` | Pure calculation and fixed-service payment-option logic |
| `js/validation.js` | Input parsing and validation |
| `js/ui.js` | Generated result content and alternate comparison layouts from shared result data |
| `js/app.js` | Form events, errors, and result updates |
| `tests/pension-calculator.test.js` | Calculation and validation regression coverage |
| `README.md` | Runtime instructions, calculation scope, and maintenance guidance |

Avoid hand-copying result values or business rules into separate reading templates. Generate alternate views from the same calculation data. When rules change, update configuration, displayed review date, source notes, and tests together, following the README. Future copy refactoring should give repeated explanations one canonical source; this document does not relocate existing content.

All pension calculations and personal inputs remain in browser memory. Do not upload or persist birth year, service years, salary, gap, or calculated results. No accounts, analytics collecting values, backend, or result-saving feature should be introduced. Reusable “Continue reading” behavior may save a non-sensitive content anchor only if appropriate to a future reading view; it must not restore calculator answers. Optional local appearance or text-size preferences must not include personal inputs.

Preserve operation by opening `index.html` directly without a build step or network connection for calculations. Official source links require internet access. Preference failures must not interrupt calculation or reading of its results.

## Practical acceptance checklist

Use this checklist for future implementations of the system. Record browser/version, operating system, viewport, input method, tested settings, and observed outcome. Mark conditional features “not applicable” with a reason; mark missing tests “not tested.” Do not treat a design rule or a Node test as proof of device behavior.

- [ ] Test realistic short and long titles, section labels, reference names, and multi-line quotations. Confirm natural wrapping and complete text selection.
- [ ] Test Chinese, English, and mixed-language paragraphs, punctuation, numbers, and deliberate poetry line breaks using local font fallbacks. Use fixtures for languages outside this project's English-only UI scope.
- [ ] Test narrow mobile widths (including 320px and 375px) and desktop widths (including 1024px and 1440px), portrait/landscape where applicable, and browser zoom up to 200%. Confirm comfortable measure and usable controls.
- [ ] Test every supported text size in every appearance mode: System with both OS schemes, Light, and Dark. Check actual text/surface contrast, selected states, links, errors, focus, and long values.
- [ ] Change text size partway through a long paragraph. Confirm the same paragraph stays in view and the active control retains focus. Confirm browser zoom still works independently.
- [ ] Navigate entirely by keyboard through links, controls, disclosures, and any directory or dialog. Check visible focus, heading order, accessible names, Escape, modal focus containment, and return focus.
- [ ] Test focus mode entry, directory reopening, and exit where implemented. Hidden navigation must have no remaining keyboard stops; essential interpretation context must stay available.
- [ ] Check for clipping and horizontal overflow at all tested sizes. Verify long URLs, amounts, table alternatives, and expanded answers; no meaningful content may be truncated.
- [ ] Verify content completeness and order against the canonical source. Check every internal anchor, previous/next link, official reference, and external link indication. Confirm expanded content is complete and rendered Markdown has no stray formatting markers.
- [ ] Enable reduced motion. Confirm nonessential motion and smooth scrolling are removed, with no continuous text animation or automatic reading scroll.
- [ ] Deny storage access; test missing, corrupt, and stale settings. Confirm readable defaults and working session controls. Where reading position exists, test explicit “Continue reading,” clearing it, and missing paragraph anchors.
- [ ] For this calculator, verify both payment-start alternatives, lifetime/bridge breakdowns, from-65 interpretation, mobile comparison labels, validation, and the absence of input persistence or automatic network requests. Run the existing Node regression suite when implementation or calculation changes warrant it.
- [ ] For real-device claims, test representative iOS/Safari and Android/Chrome devices and keyboard/screen-reader combinations. Record simulator or emulation checks as such; leave untested device behavior explicitly unverified.

### Verification status for this documentation update

This update establishes design guidance only. No application styles, features, calculation rules, or deployment were changed. New text-size, appearance, focus-mode, multilingual layout, storage-failure, and real-device behavior have not been implemented or tested as part of this update. The existing calculation tests do not establish compliance with the reading-system checklist.
