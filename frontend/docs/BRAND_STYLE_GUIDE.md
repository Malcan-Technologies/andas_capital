# Kredit.my Brand Style Guide (Frontend Only)

## 1. Overall Look

- **Light mode only**
- Clean, calm, comfortable
- No visual noise

---

## 2. Background Colors

| Purpose | Tailwind Class | HEX | Usage |
|---------|---------------|-----|-------|
| **App Background** | `bg-gray-50` | `#F9FAFB` | Main page background |
| **Cards / Sheets** | `bg-white` | `#FFFFFF` | Cards, modals, sheets |
| **Dividers / Borders** | `border-gray-200` | `#E5E7EB` | Separators, card borders |

```jsx
// Standard page background
<div className="min-h-screen bg-gray-50">
  {/* Page content */}
</div>

// Card component
<div className="bg-white rounded-xl border border-gray-200">
  {/* Card content */}
</div>
```

---

## 3. Text Colors

| Purpose | Tailwind Class | HEX | Usage |
|---------|---------------|-----|-------|
| **Main Text** | `text-slate-900` | `#0F172A` | Headings, primary content |
| **Secondary Text** | `text-slate-600` | `#475569` | Descriptions, labels |
| **Disabled / Helper** | `text-slate-400` | `#94A3B8` | Placeholders, hints, disabled |

**Never use pure black (`#000000`).**

```jsx
// Text hierarchy example
<h1 className="text-slate-900 font-heading font-bold">Main Heading</h1>
<p className="text-slate-600 font-body">Description text goes here.</p>
<span className="text-slate-400 text-sm">Helper or disabled text</span>
```

---

## 4. Accent Color (Actions)

| Purpose | Tailwind Class | HEX | Usage |
|---------|---------------|-----|-------|
| **Accent** | `bg-teal-400` / `text-teal-400` | `#2DD4BF` | Primary buttons, active icons, sliders, progress |

**Use accent color only for:**
- Primary buttons
- Active icons
- Sliders / progress indicators

**Do NOT use accent as background for large areas.**

```jsx
// Primary button
<button className="bg-teal-400 hover:bg-teal-500 text-white px-6 py-3 rounded-xl font-medium transition">
  Continue
</button>

// Active icon
<Icon className="h-6 w-6 text-teal-400" />

// Progress indicator
<div className="h-2 bg-gray-200 rounded-full">
  <div className="h-2 bg-teal-400 rounded-full" style={{ width: '60%' }} />
</div>
```

---

## 5. Signature Design Element (Brand Identity)

### **Black Floating Oval Bar**

| Property | Value |
|----------|-------|
| **Color** | `bg-slate-950` (`#020617`) |
| **Shape** | Fully rounded pill (`rounded-full`) |
| **Position** | Floating above bottom of screen |
| **Presence** | Appears on **all main screens** |

This is the **core brand identity**. 

**Never change its color or shape.**

```jsx
// Floating oval navigation bar
<nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-950 rounded-full px-6 py-3 flex items-center gap-6 shadow-lg">
  {/* Icons inside */}
</nav>
```

---

## 6. Icons Inside the Oval Bar

| State | Tailwind Class | HEX | Usage |
|-------|---------------|-----|-------|
| **Default** | `text-slate-400` | `#94A3B8` | Inactive icons |
| **Active** | `text-teal-400` | `#2DD4BF` | Currently selected |

**Rules:**
- Maximum 5 icons
- Icons only (no text labels)

```jsx
// Navigation icon (inactive)
<button className="p-2">
  <HomeIcon className="h-6 w-6 text-slate-400" />
</button>

// Navigation icon (active)
<button className="p-2">
  <HomeIcon className="h-6 w-6 text-teal-400" />
</button>
```

---

## 7. Status Colors (Minimal Use)

| Status | Tailwind Class | HEX | Usage |
|--------|---------------|-----|-------|
| **Success** | `text-green-500` / `bg-green-500` | `#22C55E` | Success messages, completed states |
| **Warning** | `text-amber-500` / `bg-amber-500` | `#F59E0B` | Warnings, pending states |
| **Error** | `text-red-500` / `bg-red-500` | `#EF4444` | Errors, failed states |

**Only for system feedback. Use sparingly.**

```jsx
// Success message
<div className="flex items-center gap-2 text-green-500">
  <CheckIcon className="h-5 w-5" />
  <span>Payment successful</span>
</div>

// Error message
<div className="flex items-center gap-2 text-red-500">
  <XCircleIcon className="h-5 w-5" />
  <span>Something went wrong</span>
</div>

// Warning badge
<span className="bg-amber-500/10 text-amber-500 px-2 py-1 rounded-full text-sm">
  Pending
</span>
```

---

## 8. Typography

| Usage | Font | Class | Style |
|-------|------|-------|-------|
| **Headings** | `Playfair Display` | `font-heading` | `font-semibold` or `font-bold` |
| **Body Text** | `Poppins` | `font-body` | `font-normal` |
| **Logo Text** | `Playfair Display` | `font-logo` | `font-bold` |

---

## 9. Component Patterns

### Dashboard Layout
```jsx
<div className="min-h-screen bg-gray-50 w-full pb-24">
  <div className="px-4 sm:px-6 lg:px-8 py-6">
    <div className="space-y-6">
      {/* Page content */}
    </div>
  </div>
  
  {/* Floating oval bar at bottom */}
  <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-950 rounded-full px-6 py-3 flex items-center gap-6 shadow-lg">
    {/* Nav icons */}
  </nav>
</div>
```

### Card Component
```jsx
<div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
  <h3 className="text-lg font-heading font-semibold text-slate-900 mb-2">
    Card Title
  </h3>
  <p className="text-slate-600 font-body">
    Card description text.
  </p>
</div>
```

### Primary Button
```jsx
<button className="bg-teal-400 hover:bg-teal-500 text-white px-6 py-3 rounded-xl font-medium font-body transition">
  Action Text
</button>
```

### Secondary Button
```jsx
<button className="bg-white border border-gray-200 hover:bg-gray-50 text-slate-900 px-6 py-3 rounded-xl font-medium font-body transition">
  Secondary Action
</button>
```

---

## 10. What NOT To Do

- ❌ No dark mode
- ❌ No neon colors
- ❌ No full-black screens
- ❌ No pure black text (`#000000`)
- ❌ No accent color as large backgrounds
- ❌ No changing the floating oval bar color/shape

---

## 11. Quick Reference

### Color Palette Summary

| Token | HEX | Tailwind |
|-------|-----|----------|
| App Background | `#F9FAFB` | `bg-gray-50` |
| Card Background | `#FFFFFF` | `bg-white` |
| Border | `#E5E7EB` | `border-gray-200` |
| Main Text | `#0F172A` | `text-slate-900` |
| Secondary Text | `#475569` | `text-slate-600` |
| Disabled Text | `#94A3B8` | `text-slate-400` |
| Accent | `#2DD4BF` | `bg-teal-400` / `text-teal-400` |
| Oval Bar | `#020617` | `bg-slate-950` |
| Success | `#22C55E` | `text-green-500` |
| Warning | `#F59E0B` | `text-amber-500` |
| Error | `#EF4444` | `text-red-500` |

---

## 12. Prompt Summary for Cursor AI

> Use a light gray background (`#F9FAFB`) with white cards. Text uses slate colors: main text (`#0F172A`), secondary (`#475569`), disabled (`#94A3B8`). Never use pure black. The accent color is teal (`#2DD4BF`) for primary buttons, active icons, and progress indicators only—never as a large background. The signature brand element is a black floating oval bar (`#020617`) at the bottom of main screens with icons in slate-400 (inactive) or teal-400 (active). Max 5 icons, no text. Keep the design clean, calm, and comfortable. Light mode only. No dark mode, neon colors, or full-black screens.
