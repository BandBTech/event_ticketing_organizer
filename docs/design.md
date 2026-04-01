# Card Component Design System

## Overview

This document describes the responsive card component design pattern used throughout the organizer dashboard. The pattern uses Tailwind CSS container queries (`@container`) to create truly responsive components that adapt to their parent container size rather than the viewport.

## Core Card Pattern

### Base Structure

```tsx
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

function StatCard({ icon, label, value, subValue, colorClass, isLoading, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ scale: 1.03 }}
      className="@container/card p-2.5 rounded-2xl glass-card-lowest transition-all"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${colorClass}`}>
          {icon}
        </div>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      {isLoading ? (
        <Skeleton className="h-8 w-24" />
      ) : (
        <>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
        </>
      )}
    </motion.div>
  );
}
```

### Key Classes Explained

| Class | Purpose |
|-------|---------|
| `@container/card` | Enables container query context for this element. The `/card` suffix is a unique identifier for this container. |
| `p-2.5` | Inner padding (10px) for content spacing. |
| `rounded-2xl` | Rounded corners (16px radius). |
| `glass-card-lowest` | Custom glass-morphism card style with subtle shadow and background. |
| `transition-all` | Smooth transitions for hover states. |

## Container Query Grid Pattern

### Responsive Grid Layout

```tsx
<div className="@container">
  <div className="grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-4 gap-4">
    {cards.map((card, i) => (
      <StatCard key={card.label} {...card} index={i} />
    ))}
  </div>
</div>
```

### Container Query Breakpoints

| Breakpoint | Min Container Width | Columns |
|------------|---------------------|---------|
| Default | 0px | 1 column |
| `@sm` | 384px | 2 columns |
| `@lg` | 640px | 4 columns |

### Why Container Queries?

Container queries allow components to respond to their parent container's size rather than the viewport. This is ideal for:
- Dashboard widgets that appear in different layouts
- Cards that need to adapt when placed in sidebars vs main content
- Reusable components that work in any context

## Animation Pattern

### Framer Motion Integration

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.08 }}
  whileHover={{ scale: 1.03 }}
>
  {/* Card content */}
</motion.div>
```

### Animation Properties

| Property | Value | Purpose |
|----------|-------|---------|
| `initial` | `{ opacity: 0, y: 20 }` | Start invisible, 20px below final position |
| `animate` | `{ opacity: 1, y: 0 }` | Fade in and slide up to final position |
| `transition.delay` | `index * 0.08` | Stagger animation (80ms per card) |
| `whileHover` | `{ scale: 1.03 }` | 3% scale up on hover for interactivity |

## Loading State Pattern

### Skeleton Loading

```tsx
{isLoading ? (
  <Skeleton className="h-8 w-24" />
) : (
  <p className="text-2xl font-bold text-gray-900">{value}</p>
)}
```

### Skeleton Sizing Guide

| Content Type | Skeleton Classes |
|--------------|------------------|
| Small text | `h-4 w-20` |
| Label text | `h-6 w-20 mb-1` |
| Value text | `h-7 w-24 mb-1` |
| Large value | `h-8 w-24` |

## Color System

### Icon Background Colors

Use consistent color classes for icon backgrounds:

```tsx
const colorClasses = {
  revenue: "bg-green-100 text-green-600",
  tickets: "bg-purple-100 text-purple-600",
  events: "bg-blue-100 text-blue-600",
  transactions: "bg-orange-100 text-orange-600",
  payouts: "bg-amber-100 text-amber-600",
  earnings: "bg-indigo-100 text-indigo-600",
  refunds: "bg-red-100 text-red-600",
  conversion: "bg-gray-100 text-gray-600",
};
```

### Alert States

For cards that need attention (e.g., pending payouts):

```tsx
className={`@container/card p-2.5 rounded-2xl glass-card-lowest transition-all ${
  alert ? "border-amber-200" : ""
}`}
```

## Financial Card Pattern

For cards with descriptions and optional alerts:

```tsx
function FinancialCard({ icon, label, value, description, alert, isLoading }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03 }}
      className={`@container/card p-2.5 rounded-2xl glass-card-lowest transition-all ${
        alert ? "border-amber-200" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${alert ? "bg-amber-100 text-amber-600" : "bg-indigo-100 text-indigo-600"}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <Skeleton className="h-6 w-20 mb-1" />
          ) : (
            <p className="text-sm text-gray-500 truncate">{label}</p>
          )}
          {isLoading ? (
            <Skeleton className="h-7 w-24 mb-1" />
          ) : (
            <p className="text-lg font-semibold text-gray-900">{value}</p>
          )}
          <p className="text-xs text-gray-400">{description}</p>
        </div>
        {alert && (
          <ClockIcon className="w-5 h-5 text-amber-500 flex-shrink-0" weight="duotone" />
        )}
      </div>
    </motion.div>
  );
}
```

## Section Container Pattern

For larger content sections (tables, charts, status breakdowns):

```tsx
<div className="glass-card-lowest rounded-2xl p-6">
  {/* Section content */}
</div>
```

### Section Variations

| Use Case | Classes |
|----------|---------|
| Table container | `glass-card-lowest rounded-2xl overflow-hidden` |
| Chart container | Use `ChartCard` component |
| Status breakdown | `glass-card-lowest rounded-2xl p-6` |
| Transaction list | `glass-card-lowest rounded-2xl overflow-hidden` |

## Empty State Pattern

```tsx
{!isLoading && !hasAnyData && (
  <div className="glass-card-lowest rounded-2xl p-8 text-center">
    <Icon className="w-16 h-16 mx-auto text-gray-300 mb-4" weight="duotone" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      {t("noDataTitle", "No Data Available Yet")}
    </h3>
    <p className="text-gray-500 max-w-md mx-auto">
      {t("noDataDescription", "Description text here.")}
    </p>
  </div>
)}
```

## Tailwind Container Query Setup

### Required Configuration

Ensure `@tailwindcss/container-queries` is installed and configured:

```js
// tailwind.config.js
module.exports = {
  plugins: [
    require('@tailwindcss/container-queries'),
  ],
}
```

### Container Query Syntax

```css
/* Available container query utilities */
@container           /* Sets up container query context */
@sm:                 /* Min container width: 384px */
@md:                 /* Min container width: 448px */
@lg:                 /* Min container width: 640px */
@xl:                 /* Min container width: 768px */
@2xl:                /* Min container width: 896px */
```

## Best Practices

1. **Always wrap grids in `@container`**: The parent grid needs `@container` to enable container queries for breakpoint classes.

2. **Use unique container names**: When nesting containers, use unique names like `@container/card` to avoid conflicts.

3. **Stagger animations by index**: Use `index * 0.08` for delay to create a cascading effect.

4. **Skeleton matches content size**: Size skeletons to match the final content dimensions.

5. **Consistent spacing**: Use `gap-4` for card grids, `gap-3` for internal card spacing.

6. **Hover effects on cards only**: Apply `whileHover` to the card wrapper, not internal elements.

7. **Truncate long labels**: Use `truncate` class on labels to prevent overflow.

## Example: Complete Stats Grid

```tsx
<div className="space-y-6">
  {/* Section Header */}
  <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h2>
  
  {/* Responsive Grid */}
  <div className="@container">
    <div className="grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <StatCard
          key={stat.label}
          icon={stat.icon}
          label={stat.label}
          value={stat.value}
          subValue={stat.subValue}
          colorClass={stat.colorClass}
          isLoading={isLoading}
          index={i}
        />
      ))}
    </div>
  </div>
</div>
```

## Glass Card Hierarchy

The design system provides three levels of glass-morphism cards with varying visual prominence. These classes are defined in `src/styles/globals.css`.

### Three-Level Glass Card System

| Class | Opacity | Shadow Intensity | Border | Use Case |
|-------|---------|------------------|--------|----------|
| `.glass-card` | `rgba(255, 255, 255, 0.6)` | High (20px blur, multiple shadows) | `rgba(255, 255, 255, 0.5)` | Hero sections, modals, login cards |
| `.glass-card-lower` | `rgba(255, 255, 255, 0.6)` | High (20px blur, multiple shadows) | `rgba(255, 255, 255, 0.5)` | Secondary containers, sidebars |
| `.glass-card-lowest` | `rgba(255, 255, 255, 0.7)` | Low (subtle shadows) | `rgba(105, 105, 105, 0.1)` | **Dashboard cards, stat cards, tables** |

### CSS Definitions

```css
/* Level 1: Standard Glass Card - Highest visual weight */
.glass-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow:
    0px 20px 20px 0px rgba(0, 0, 0, 0.1),
    0px 5px 10px 0px rgba(0, 0, 0, 0.05),
    0px 2px 4px 0px rgba(0, 0, 0, 0.05),
    inset 0px 30px 60px 0px rgba(255, 255, 255, 0.15);
}

/* Level 2: Lower Glass Card - Medium visual weight */
.glass-card-lower {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow:
    0px 20px 20px 0px rgba(0, 0, 0, 0.1),
    0px 5px 10px 0px rgba(0, 0, 0, 0.05),
    0px 2px 4px 0px rgba(0, 0, 0, 0.05),
    inset 0px 30px 60px 0px rgba(255, 255, 255, 0.15);
}

/* Level 3: Lowest Glass Card - Lowest visual weight (RECOMMENDED for dashboard) */
.glass-card-lowest {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(105, 105, 105, 0.1);
  box-shadow:
    0px 5px 12px 0px rgba(0, 0, 0, 0.05),
    0px 2px 4px 0px rgba(0, 0, 0, 0.06),
    inset 0px 30px 60px 0px rgba(255, 255, 255, 0.15);
}
```

### When to Use Each Level

#### `.glass-card-lowest` (Recommended for Dashboard)
- Stat cards and KPI cards
- Data tables
- Chart containers
- Transaction lists
- Status breakdowns
- **Default choice for most dashboard components**

```tsx
// Stat card example
<motion.div className="@container/card p-2.5 rounded-2xl glass-card-lowest transition-all">
  {/* Card content */}
</motion.div>

// Section container example
<div className="glass-card-lowest rounded-2xl p-6">
  {/* Section content */}
</div>
```

#### `.glass-card-lower` (Medium Emphasis)
- Sidebar panels
- Secondary content areas
- Collapsible sections
- Settings panels

```tsx
<aside className="glass-card-lower rounded-2xl p-4">
  {/* Sidebar content */}
</aside>
```

#### `.glass-card` (Highest Emphasis)
- Modal dialogs
- Login/authentication cards
- Hero sections
- Call-to-action banners
- Overlay panels

```tsx
<div className="glass-card rounded-3xl p-8">
  {/* Hero or modal content */}
</div>
```

### Visual Comparison

| Property | glass-card | glass-card-lower | glass-card-lowest |
|----------|------------|------------------|-------------------|
| Background opacity | 60% | 60% | 70% |
| Backdrop blur | 20px | 20px | 20px |
| Border color | White (50%) | White (50%) | Gray (10%) |
| Outer shadow Y-offset | 20px | 20px | 5px |
| Outer shadow blur | 20px | 20px | 12px |
| Inner shadow | Yes | Yes | Yes |
| Visual weight | Heavy | Medium | Light |

### Design Guidelines

1. **Default to `glass-card-lowest`** for dashboard cards and data displays
2. **Use `glass-card-lower`** for secondary UI elements that need subtle distinction
3. **Reserve `glass-card`** for high-emphasis elements like modals and hero sections
4. **Maintain consistency** - use the same level within a section unless hierarchy is intentional
5. **Consider background** - glass effects work best over the page background image (`/bg.avif`)

## File References

- **StatCard Component**: `src/components/organizerDashboard/reports/OverviewTab.tsx`
- **PayoutSummaryCards**: `src/components/organizerDashboard/payouts/PayoutSummaryCards.tsx`
- **Container Queries Plugin**: `@tailwindcss/container-queries`
- **Glass Card Styles**: `src/styles/globals.css`
