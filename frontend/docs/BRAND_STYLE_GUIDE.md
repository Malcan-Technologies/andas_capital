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

## 🎯 Product-Specific Color Themes

Each product/solution has its own distinctive color theme for consistency across all pages, components, and marketing materials:

### Business & Personal Loans
* **Primary Color:** Blue-600 (`#2563EB`)
* **Background:** Blue-50 (`#EFF6FF`)
* **Icon Background:** Blue-600/10 with border-blue-600/20
* **Usage:** All loan-related products, SME Term Loans, Personal Loans

```jsx
// Example usage
<div className="bg-blue-600 text-white">Primary CTA</div>
<div className="bg-blue-50 border-blue-200">Card background</div>
<div className="text-blue-600">Text elements</div>
```

### Earned Wage Access (PayAdvance™)
* **Primary Color:** Emerald-600 (`#059669`)
* **Background:** Emerald-50 (`#ECFDF5`)
* **Icon Background:** Emerald-600/10 with border-emerald-600/20
* **Usage:** All earned wage access features, employee benefits

```jsx
// Example usage
<div className="bg-emerald-600 text-white">Primary CTA</div>
<div className="bg-emerald-50 border-emerald-200">Card background</div>
<div className="text-emerald-600">Text elements</div>
```

### Private Credit Investments
* **Primary Color:** Gray-800 (`#1F2937`)
* **Background:** Gray-50 (`#F9FAFB`)
* **Icon Background:** Gray-800/10 with border-gray-800/20
* **Usage:** All investment products, private credit, wealth management

```jsx
// Example usage
<div className="bg-gray-800 text-white">Primary CTA</div>
<div className="bg-gray-50 border-gray-200">Card background</div>
<div className="text-gray-800">Text elements</div>
```

### Credit Analytics
* **Primary Color:** Purple-Primary (`#7C3AED`)
* **Background:** Purple-50 (`#FAF5FF`)
* **Icon Background:** Purple-primary/10 with border-purple-primary/20
* **Usage:** CTOS reports, credit monitoring, business verification

```jsx
// Example usage
<div className="bg-purple-primary text-white">Primary CTA</div>
<div className="bg-purple-50 border-purple-200">Card background</div>
<div className="text-purple-primary">Text elements</div>
```

### Credit Builder
* **Primary Color:** Yellow-500 (`#EAB308`)
* **Background:** Yellow-50 (`#FEFCE8`)
* **Icon Background:** Yellow-500/10 with border-yellow-500/20
* **Usage:** Credit building programs, score improvement, financial education

```jsx
// Example usage
<div className="bg-yellow-500 text-white">Primary CTA</div>
<div className="bg-yellow-50 border-yellow-200">Card background</div>
<div className="text-yellow-600">Text elements</div>
```

### Product Theme Implementation Guidelines
1. **Primary CTA buttons** should use the product's primary color
2. **Secondary buttons** should use the product's background color with primary color text
3. **Card backgrounds** should use the product's light background color
4. **Icons and accents** should use the product's primary color
5. **Hover states** should darken the primary color (e.g., `hover:bg-blue-700` for blue-600)

---

## 📊 Chart & Data Visualization Colors

For charts, graphs, and data visualizations in dashboard pages, use these subtle color versions that match the homepage product card overlay style for better visual harmony and reduced eye strain:

### Subtle Chart Color Palette
| Purpose | Tailwind Class | HEX | Usage |
|---------|---------------|-----|-------|
| **Outstanding/Upcoming** | `bg-blue-400` | `#60A5FA` | Bar charts, progress indicators, upcoming payments |
| **Paid/Completed** | `bg-green-400` | `#4ADE80` | Success states, completed payments, progress bars |
| **Current Month/Warning** | `bg-orange-400` | `#FB923C` | Due this month, warnings, attention items |
| **Overdue/Errors** | `bg-red-400` | `#F87171` | Overdue payments, errors, critical alerts |

### Implementation Guidelines
- Use these 400-level colors instead of harsh primary colors (600-700 levels)
- Apply consistently across bar charts, donut charts, progress indicators
- Maintain visual hierarchy while providing better readability
- Colors should match the soft overlay style used in homepage product cards

```jsx
// Example bar chart implementation
<Bar dataKey="outstanding" fill="#60A5FA" />
<Bar dataKey="paid" fill="#4ADE80" />
<Bar dataKey="currentMonth" fill="#FB923C" />
<Bar dataKey="overdue" fill="#F87171" />
```

---

## 🏠 Dashboard Page Design Standards

### Dashboard Layout Structure
All dashboard pages should follow this consistent responsive structure:

```jsx
// Standard dashboard page structure
<div className="min-h-screen bg-offwhite w-full">
  <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8">
    <div className="space-y-6">
      {/* Page content */}
    </div>
  </div>
</div>
```

**Responsive Padding Scale:**
- **Mobile:** 16px (`px-4`)
- **Small:** 24px (`sm:px-6`) 
- **Large:** 32px (`lg:px-8`)
- **XL:** 48px (`xl:px-12`)
- **2XL:** 64px (`2xl:px-16`)
- **Vertical:** 32px (`py-8`)

### Dashboard Card Standards

#### Card Structure
```jsx
// Standard dashboard card (white background, clean design, fully responsive)
<div className="bg-white rounded-xl lg:rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden">
  <div className="p-4 sm:p-6 lg:p-8">
    {/* Header - Mobile: Stack, Desktop: Side by side */}
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
      <div className="flex items-center">
        <div className="w-12 h-12 lg:w-14 lg:h-14 bg-[product-color]/10 rounded-xl flex items-center justify-center mr-3 flex-shrink-0">
          <Icon className="h-6 w-6 lg:h-7 lg:w-7 text-[product-color]" />
        </div>
        <div className="min-w-0">
          <h3 className="text-lg lg:text-xl font-heading font-bold text-gray-700 mb-1">
            Card Title
          </h3>
          <p className="text-sm lg:text-base text-[product-color] font-semibold">
            Subtitle or Status
          </p>
        </div>
      </div>
      {/* Desktop Action Button */}
      <Link
        href="/dashboard/[page]"
        className="hidden lg:inline-flex bg-[product-color] hover:bg-[product-color-700] text-white px-6 py-3 rounded-xl font-medium font-body text-base transition-all duration-200 shadow-sm hover:shadow-md items-center"
      >
        Action Text
        <ArrowRightIcon className="ml-1 h-4 w-4" />
      </Link>
    </div>

    {/* Main Content */}
    <div className="text-center lg:text-left mb-6">
      <p className="text-gray-500 text-sm mb-2 font-body">
        Content Label
      </p>
      <p className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-gray-700 mb-3">
        Main Value/Number
      </p>
      <p className="text-sm sm:text-base lg:text-lg text-gray-600 font-body leading-relaxed">
        Supporting description
      </p>
    </div>

    {/* Subtle separator line */}
    <div className="border-t border-gray-100 mb-6"></div>

    {/* Stats Grid - Responsive: 2x2 mobile, centered tablet, left-aligned desktop */}
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 justify-items-center lg:justify-items-start mb-6">
      <div className="space-y-2 text-center lg:text-left w-full">
        <div className="flex items-center space-x-2 justify-center lg:justify-start">
          <Icon className="h-4 w-4 text-[product-color]" />
          <span className="text-xs sm:text-sm font-medium text-gray-500 font-body">
            Stat Label
          </span>
        </div>
        <p className="text-xl sm:text-2xl lg:text-3xl font-heading font-bold text-[product-color]">
          Stat Value
        </p>
      </div>
      {/* Repeat for additional stats */}
    </div>

    {/* Mobile Action Button */}
    <div className="border-t border-gray-100 pt-4 lg:hidden">
      <Link
        href="/dashboard/[page]"
        className="w-full bg-[product-color] hover:bg-[product-color-700] text-white px-6 py-3 rounded-xl font-medium font-body text-base transition-all duration-200 shadow-sm hover:shadow-md inline-flex items-center justify-center"
      >
        Action Text
        <ArrowRightIcon className="ml-1 h-4 w-4" />
      </Link>
    </div>
  </div>
</div>
```

#### Dashboard Text Sizing Guidelines

| Element | Mobile Size | Desktop Size | Classes | Usage |
|---------|-------------|--------------|---------|-------|
| **Page Titles** | `text-2xl` | `text-3xl` | `text-2xl lg:text-3xl font-heading font-bold text-gray-700` | Main page headings |
| **Card Titles** | `text-lg` | `text-xl` | `text-lg lg:text-xl font-heading font-bold text-gray-700 mb-1` | Primary card titles |
| **Card Subtitles** | `text-sm` | `text-base` | `text-sm lg:text-base text-[product-color] font-semibold` | Card descriptions/status |
| **Stat Numbers** | `text-xl` | `text-2xl` | `text-xl xl:text-2xl font-heading font-bold` | Key metrics, amounts |
| **Stat Labels** | `text-sm` | `text-sm` | `text-sm text-gray-500 font-body` | Metric descriptions |
| **Body Text** | `text-sm` | `text-base` | `text-sm lg:text-base text-gray-600 font-body` | General content |
| **Small Text** | `text-xs` | `text-sm` | `text-xs lg:text-sm text-gray-500 font-body` | Helper text, metadata |

#### Icon Sizing Standards
- **Dashboard Card Icons:** `w-12 h-12 lg:w-14 lg:h-14` (main card icons in header)
- **Large Card Icons:** `w-16 h-16 lg:w-20 lg:h-20` (special emphasis cards only)
- **Inline Icons:** `h-6 w-6 lg:h-7 lg:w-7` (icons within card headers)
- **Small Icons:** `h-5 w-5 lg:h-6 lg:w-6` (text inline icons)
- **Action Icons:** `h-4 w-4` (buttons, small actions)

#### Card Spacing Standards
- **Card Padding:** `p-4 sm:p-6 lg:p-8` (responsive padding)
- **Content Spacing:** `space-y-4 lg:space-y-6`
- **Grid Gaps:** `gap-4 lg:gap-6`
- **Icon Margins:** `mr-3` (icon to text spacing)
- **Mobile Button Spacing:** `pt-4` (top padding for mobile buttons)
- **Header Spacing:** `mb-6 space-y-4 lg:space-y-0` (responsive header spacing)

#### Implementation Example
```jsx
// Example dashboard overview card with full responsive design
<div className="bg-white rounded-xl lg:rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden">
  <div className="p-4 sm:p-6 lg:p-8">
    {/* Header - Mobile: Stack, Desktop: Side by side */}
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
      <div className="flex items-center">
        <div className="w-12 h-12 lg:w-14 lg:h-14 bg-blue-600/10 rounded-xl flex items-center justify-center mr-3 flex-shrink-0">
          <CreditCardIcon className="h-6 w-6 lg:h-7 lg:w-7 text-blue-600" />
        </div>
        <div className="min-w-0">
          <h3 className="text-lg lg:text-xl font-heading font-bold text-gray-700 mb-1">
            Active Loans
          </h3>
          <p className="text-sm lg:text-base text-blue-600 font-semibold">
            2 loans • RM 50,000 outstanding
          </p>
        </div>
      </div>
      {/* Desktop Action Button */}
      <Link
        href="/dashboard/loans"
        className="hidden lg:inline-flex bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium font-body text-base transition-all duration-200 shadow-sm hover:shadow-md items-center"
      >
        View All
        <ArrowRightIcon className="ml-1 h-4 w-4" />
      </Link>
    </div>

    {/* Main Content */}
    <div className="text-center lg:text-left mb-6">
      <p className="text-gray-500 text-sm mb-2 font-body">
        Total Outstanding
      </p>
      <p className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-gray-700 mb-3">
        RM 50,000
      </p>
      <p className="text-sm sm:text-base lg:text-lg text-gray-600 font-body leading-relaxed">
        Next payment due in 5 days
      </p>
    </div>

    {/* Subtle separator line */}
    <div className="border-t border-gray-100 mb-6"></div>

    {/* Stats Grid */}
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 justify-items-center lg:justify-items-start mb-6">
      <div className="space-y-2 text-center lg:text-left w-full">
        <div className="flex items-center space-x-2 justify-center lg:justify-start">
          <span className="text-xs sm:text-sm font-medium text-gray-500 font-body">
            Next Payment
          </span>
        </div>
        <p className="text-xl sm:text-2xl lg:text-3xl font-heading font-bold text-blue-600">
          RM 2,500
        </p>
      </div>
    </div>

    {/* Mobile Action Button */}
    <div className="border-t border-gray-100 pt-4 lg:hidden">
      <Link
        href="/dashboard/loans"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium font-body text-base transition-all duration-200 shadow-sm hover:shadow-md inline-flex items-center justify-center"
      >
        View All
        <ArrowRightIcon className="ml-1 h-4 w-4" />
      </Link>
    </div>
  </div>
</div>
```

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

// Product-specific button (example for loans)
<button className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition">
  Apply for Loan
</button>

// Product-specific button (example for credit builder)
<button className="bg-yellow-500 text-white px-6 py-3 rounded-xl hover:bg-yellow-600 transition">
  Start Building Credit
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

> Use a soft off-white background (`#F7F4EF`) with primary brand color in purple (`#7C3AED`) and a complementary blue accent (`#38BDF8`). Each product has its own color theme: Business Loans (Blue-600), Earned Wage Access (Emerald-600), Private Credit Investments (Gray-800), Credit Analytics (Purple-Primary), and Credit Builder (Yellow-500). Layout cards in visually interesting proportions (1/3 + 2/3, 1/4 + 3/4, etc.) with consistent spacing and rounded corners (`rounded-xl`). Use Manrope for headings and Inter for body text. Buttons should have hover states and fit the brand colors. Ensure layout is responsive and easy to read.
