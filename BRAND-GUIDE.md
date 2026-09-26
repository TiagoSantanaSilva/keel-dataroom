# Keel Brand Guide
## Minimalist, Modern, Investor-Focused

---

## 1. Brand Identity

**Name:** Keel  
**Tagline:** "Structured protection for aligned capital"  
**Visual Metaphor:** Sailboat / Leaf icon — representing navigation, growth, and forward motion

---

## 2. Color Palette

| Element | Hex | RGB | Usage |
|---------|-----|-----|-------|
| **Primary Black** | `#000000` | 0, 0, 0 | Primary text, icons, key UI elements |
| **Light Background** | `#EEEEEE` | 238, 238, 238 | Page background, secondary surfaces |
| **White** | `#FFFFFF` | 255, 255, 255 | Content areas, cards, overlays |
| **Accent Blue** | `#0066FF` | 0, 102, 255 | Links, CTAs, interactive elements |
| **Text Secondary** | `#666666` | 102, 102, 102 | Supporting text, descriptions |
| **Text Muted** | `#999999` | 153, 153, 153 | Captions, metadata, disabled states |
| **Border** | `#DDDDDD` | 221, 221, 221 | Card borders, dividers, subtle separation |

### Dark Mode Adjustments
- Background: `#1A1A1A`
- Surface: `#242424`
- Primary Text: `#FFFFFF`
- Secondary: `#CCCCCC`

---

## 3. Typography

### Font Stack
```
'Inter', -apple-system, BlinkMacSystemFont, sans-serif
```

**Why Inter?**
- Modern, geometric sans-serif
- Excellent readability at all sizes
- Professional, clean appearance
- Strong character differentiation for investor context

### Type Hierarchy

| Use | Size | Weight | Line-Height |
|-----|------|--------|-------------|
| **Hero Heading (H1)** | 48px (3rem) | 700 | 1.1 |
| **Section Heading (H2)** | 32px (2rem) | 700 | 1.2 |
| **Card Heading (H3)** | 20px (1.25rem) | 600 | 1.3 |
| **Body Text** | 16px (1rem) | 400 | 1.6 |
| **Small Text** | 14px (0.9rem) | 500 | 1.5 |
| **Caption** | 12px (0.75rem) | 400 | 1.4 |

---

## 4. Logo & Icon System

### Logo Usage
- **Horizontal Lock-up:** Sailboat icon (32×32px) + "KEEL" wordmark
- **Icon Only:** For favicon, avatars (minimum 24×24px)
- **Clear Space:** Minimum 8px padding on all sides
- **Minimum Size:** 24×24px on digital, 0.5" on print

### Sailboat Icon Specifications
```
Stroke Width: 4px
Color: Primary Black (#000000)
Style: Minimalist, geometric, single-line
Viewbox: 0 0 100 100
```

### Usage Rules
- **Never**: Colorize the icon (always black in light mode, white in dark)
- **Never**: Distort or rotate (maintain exact proportions)
- **Always**: Pair with "KEEL" wordmark in primary contexts
- **Always**: Ensure minimum contrast against background

---

## 5. Spacing System

```
xs: 0.5rem (8px)
sm: 1rem (16px)
md: 1.5rem (24px)
lg: 2rem (32px)
xl: 3rem (48px)
```

### Apply As:
- **Padding**: Inside containers, buttons, cards
- **Margin**: Between sections, between elements
- **Gap**: Between grid items, flex containers

**Grid System:** `repeat(auto-fit, minmax(300px, 1fr))`

---

## 6. Component Specifications

### Buttons

**Primary Button**
```
Background: #000000
Text: #FFFFFF
Padding: 1rem 1.5rem
Border-radius: 8px
Font-weight: 600
Hover: Lift 2px, shadow
```

**Secondary Button**
```
Background: transparent
Border: 2px solid #000000
Text: #000000
Padding: 1rem 1.5rem
Border-radius: 8px
Font-weight: 600
Hover: Inverse (black background, white text)
```

### Cards
```
Background: #FFFFFF
Border: 1px solid #DDDDDD
Padding: 2rem
Border-radius: 8px
Hover: Shadow lift, -4px Y transform
```

### Navigation
```
Background: #FFFFFF
Border-bottom: 1px solid #DDDDDD
Sticky positioning (top: 0)
Shadow: 0 1px 3px rgba(0, 0, 0, 0.08)
```

---

## 7. Photography & Imagery

### Principles
- **Clean & Minimal**: Avoid busy backgrounds
- **Black & White Priority**: Use B&W or monochrome when possible
- **High Contrast**: Ensure readability of overlaid text
- **Professional Context**: Founder photos, team shots, product demonstrations

### Image Overlay
When text appears over imagery:
```
Use semi-transparent dark overlay
Opacity: 40-60%
Color: #000000 or #1A1A1A
```

---

## 8. Voice & Messaging

### Tone
- **Professional yet approachable**
- **Direct and honest**
- **Contrarian but fair**
- **Empowering to founders**

### Key Message Pillars
1. **Structural Trust** — Move beyond blind faith
2. **Aligned Incentives** — Founder and investor success are linked
3. **Transparency** — No hidden terms, no gatekeepers
4. **Onchain Infrastructure** — Permanent, verifiable records
5. **Community First** — Enable smaller founders to raise aligned capital

### Tagline Usage
- Full: "Structured protection for aligned capital"
- Short: "Trust through structure"
- Internal: "Hold the line"

---

## 9. Copy Guidelines

### Headlines
- Active voice
- Contrarian stance when relevant
- 50-80 characters (mobile-optimized)
- Example: "Crypto fundraising has a transparency problem"

### Body Copy
- Short paragraphs (2-3 sentences max)
- One idea per sentence
- Avoid jargon unless context-appropriate
- Use power words: "structured," "aligned," "transparent," "verifiable"

### CTAs
- Action-oriented verbs: Request, Explore, Discover, Access
- Avoid passive language
- Examples:
  - "Request Access"
  - "View Documents"
  - "Learn More"

---

## 10. Application Examples

### Landing Page Header
```
Logo (icon + wordmark)
Nav: Documents | Team | Metrics | Contact

Hero Section:
Icon (48×48, in light blue background)
H1: "Keel Dataroom"
Body: "Secure, structured documentation for..."
CTAs: [Primary Button] [Secondary Button]
```

### Card Component
```
Icon (circle, 48×48)
H3: Title
Body: Description (2-3 lines)
Link: "View Documents →" (accent blue)
Hover: Shadow, lift transform
```

### Footer
```
Grid: 3 columns (Dataroom | Resources | Company)
Links in secondary text color
Bottom: Copyright + Policy links
```

---

## 11. Accessibility

### Color Contrast
- Primary text (#000000) on light (#EEEEEE): 16.5:1 ✓
- Secondary text (#666666) on light (#EEEEEE): 5.2:1 ✓
- Links (#0066FF) on light (#EEEEEE): 6.3:1 ✓

### Text Accessibility
- Minimum font size: 12px (captions)
- Minimum line-height: 1.4
- Maximum line-width: 80 characters
- Interactive elements: Minimum 44×44px touch target

### Readability
- Sans-serif only (no decorative fonts)
- Avoid all-caps except for small labels
- Use lists for multiple points
- Provide alt text for all icons/images

---

## 12. Dark Mode

### CSS Variables
```css
:root {
  --bg: #1A1A1A;
  --surface: #242424;
  --text-primary: #FFFFFF;
  --border: #333333;
  --accent-blue-light: #1a3a66;
}

@media (prefers-color-scheme: dark) {
  /* Apply dark tokens */
}
```

### Testing Checklist
- [ ] Text contrast meets WCAG AA (4.5:1 minimum)
- [ ] Images visible against dark background
- [ ] Cards readable with subtle borders
- [ ] Icons render correctly

---

## 13. Do's & Don'ts

### ✅ Do's
- Use consistent spacing (follow spacing system)
- Pair icons with text labels
- Keep layouts clean and uncluttered
- Use accent blue sparingly for emphasis
- Test on multiple devices

### ❌ Don'ts
- Don't colorize the sailboat icon (black only in light, white in dark)
- Don't use gradients (breaks minimalist aesthetic)
- Don't center all text (left-align body copy)
- Don't stack too many CTAs (primary + secondary max)
- Don't use decorative fonts or script typefaces
- Don't over-use accent color (reserve for interactive elements)

---

## 14. Implementation Checklist

- [ ] Update favicon with sailboat icon
- [ ] Set brand colors in design tokens/CSS variables
- [ ] Implement responsive grid system
- [ ] Add dark mode support
- [ ] Test all components in light and dark modes
- [ ] Validate color contrast (WCAG AA)
- [ ] Optimize images (WebP, lazy loading)
- [ ] Add loading states to buttons
- [ ] Implement hover and focus states
- [ ] Add accessibility attributes (aria-labels, alt-text)

---

## 15. Files & Assets

### Generate/Prepare
1. **Logo Files**
   - SVG (scalable)
   - PNG 256×256 (favicon)
   - PNG 1024×1024 (social media)

2. **Color Palette**
   - CSS variables file
   - Figma color library
   - Swatches for design tools

3. **Typography**
   - Font files (Inter hosted via Google Fonts)
   - Web font sizes spec

4. **Mockups**
   - Desktop layout (1440px width)
   - Mobile layout (375px width)
   - Tablet layout (768px width)

---

## Contact & Questions

For questions on brand implementation:
- **Design Contact**: [Your Design Lead]
- **Product Contact**: [Your Product Lead]
- **Brand Guidelines Version**: 1.0
- **Last Updated**: 2026-09-26
