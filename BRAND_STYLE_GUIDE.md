# Kredit.my Branding Guide (Cursor AI Ready)

## 🌍 Brand Identity

* **Primary Brand Color:** Purple (`#7C3AED`) – trusted, premium
* **Tertiary Accent Color:** Blue-400 (`#38BDF8`) – modern, vibrant
* **Background Base:** Soft Off-White (`#F7F4EF`) – bright, clean, easy on eyes

---

## 🌈 Tailwind Color Tokens

| Purpose               | Tailwind Class        | HEX       | Usage                                                   |
| --------------------- | --------------------- | --------- | ------------------------------------------------------- |
| **Background**        | `bg-offwhite`         | `#F7F4EF` | Main page and card backgrounds for a soft, premium feel |
| **Primary (Brand)**   | `text-purple-primary` | `#7C3AED` | Headlines, logo, strong brand moments                   |
|                       | `bg-purple-primary`   | `#7C3AED` | For primary buttons, highlighted sections               |
| **Tertiary (Accent)** | `text-blue-tertiary`  | `#38BDF8` | CTAs, hyperlinks, gradients, highlights                 |
|                       | `bg-blue-tertiary`    | `#38BDF8` | Hover states, CTA background, UI accents                |
| **Body Text**         | `text-gray-700`       | `#374151` | Comfortable, neutral paragraph text                     |
| **Subtext**           | `text-gray-500`       | `#6B7280` | Muted tone for metadata, footnotes, helper descriptions |

---

## 🧹 Component Design Patterns

### General Styling

* **Rounded Corners:** `rounded-xl` or `rounded-2xl`
* **Padding:** `px-6 py-4` or `p-6`
* **Spacing:** `space-y-6`, `gap-6`

### Section Spacing for Info Pages

* **Main Section Spacing:** `py-12 sm:py-16 lg:py-20 xl:py-24`
* **Section Header Spacing:** `mb-8 lg:mb-12`
* **Content Grid Spacing:** `mb-8 lg:mb-12`

```jsx
// Standard section structure
<section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-offwhite w-full">
  <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
    <div className="text-center mb-8 lg:mb-12">
      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 sm:mb-6 text-gray-700 px-4">
        Section Title
      </h2>
      <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-500 mx-auto font-body px-4 max-w-none lg:max-w-5xl">
        Section description
      </p>
    </div>
    <div className="grid gap-6 lg:gap-8 mb-8 lg:mb-12">
      {/* Content */}
    </div>
  </div>
</section>
```

### Card Layout Patterns

```jsx
// 1/3 + 2/3 layout
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <div className="col-span-1 bg-offwhite rounded-xl p-6">...</div>
  <div className="col-span-2 bg-offwhite rounded-xl p-6">...</div>
</div>

// 1/2 + 1/2 layout
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div className="bg-offwhite rounded-xl p-6">...</div>
  <div className="bg-offwhite rounded-xl p-6">...</div>
</div>

// 1/4 + 3/4 layout
<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
  <div className="col-span-1 bg-offwhite rounded-xl p-6">...</div>
  <div className="col-span-3 bg-offwhite rounded-xl p-6">...</div>
</div>

// Full-width layout
<div className="bg-offwhite rounded-xl p-6 w-full">...</div>
```

---

## 🔘 Buttons

```jsx
// Primary button
<button className="bg-purple-primary text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition">
  Get Started
</button>

// CTA / Accent button
<button className="bg-blue-tertiary text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition">
  Learn More
</button>
```

---

## ✍️ Typography

| Usage     | Font      | Class          | Style           |
| --------- | --------- | -------------- | --------------- |
| Headings  | `Manrope` | `font-heading` | `font-semibold` |
| Body Text | `Inter`   | `font-body`    | `font-normal`   |
| Logo Text | `Manrope` | `font-logo`    | `font-bold`     |

### Standardized Text Sizes for Website Info Pages

#### Main Section Headings (H2)
```jsx
<h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 sm:mb-6 text-gray-700 px-4">
  Section Title
</h2>
```

#### Main Section Descriptions
```jsx
<p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-500 mx-auto font-body leading-relaxed px-4 max-w-none lg:max-w-5xl">
  Section description text that provides context and explanation.
</p>
```

#### Section Badge/Labels
```jsx
<span className="text-xs sm:text-sm font-semibold text-purple-primary">
  Badge Text
</span>
```

#### Card Headings (H3)
```jsx
<h3 className="text-2xl lg:text-3xl font-heading font-bold mb-3 lg:mb-4 text-gray-700">
  Card Title
</h3>
```

#### Card Descriptions
```jsx
<p className="text-lg lg:text-xl text-gray-500 mb-4 lg:mb-6 font-body">
  Card description text.
</p>
```

#### Usage Example
```jsx
<h1 className="text-4xl font-heading text-purple-primary">Welcome to Kredit.my</h1>
<p className="text-base font-body text-gray-700">
  Empowering modern Malaysian businesses with trusted financial tools.
</p>
```

---

## 🎈 Gradient Accent (Optional)

```jsx
<div className="bg-gradient-to-r from-purple-primary to-blue-tertiary text-white px-6 py-4 rounded-xl">
  <h3 className="font-heading text-xl">Smart Financing for Your Business</h3>
</div>
```

---

## 🧠 Prompt Summary for Cursor AI

> Use a soft off-white background (`#F7F4EF`) with primary brand color in purple (`#7C3AED`) and a complementary blue accent (`#38BDF8`). Layout cards in visually interesting proportions (1/3 + 2/3, 1/4 + 3/4, etc.) with consistent spacing and rounded corners (`rounded-xl`). Use Manrope for headings and Inter for body text. Buttons should have hover states and fit the brand colors. Ensure layout is responsive and easy to read.
