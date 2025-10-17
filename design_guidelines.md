# Handyman Marketplace Design Guidelines

## Design Approach: Hybrid System with Marketplace Reference

**Selected Approach:** Design system foundation inspired by successful marketplace platforms (Airbnb, TaskRabbit, Thumbtack)

**Justification:** This is a utility-focused marketplace requiring trust-building, efficient browsing, and clear transaction flows. Users need to quickly find services, compare providers, and book with confidence.

**Core Principles:**
- Trust through transparency (clear pricing, reviews, provider credentials)
- Efficiency in service discovery and booking
- Dual-interface optimization (customer vs. provider workflows)
- Mobile-first responsive design

## Color Palette

**Light Mode:**
- Primary: 210 100% 50% (Trustworthy blue for CTAs, active states)
- Surface: 0 0% 100% (White backgrounds)
- Surface Secondary: 210 20% 98% (Card backgrounds)
- Text Primary: 220 20% 20%
- Text Secondary: 220 10% 50%
- Border: 210 15% 90%
- Success: 142 76% 36% (Completed jobs)
- Warning: 38 92% 50% (Pending actions)

**Dark Mode:**
- Primary: 210 100% 55%
- Surface: 220 20% 10%
- Surface Secondary: 220 18% 14%
- Text Primary: 210 20% 98%
- Text Secondary: 210 10% 70%
- Border: 210 15% 25%
- Success: 142 70% 45%
- Warning: 38 85% 55%

## Typography

**Font Stack:** System fonts via CDN (Inter for UI, SF Pro for iOS-like polish)

- **Headings:** 
  - H1: text-4xl font-bold (Provider names, page titles)
  - H2: text-2xl font-semibold (Section headers)
  - H3: text-xl font-semibold (Card titles)

- **Body:**
  - Large: text-base (Service descriptions)
  - Regular: text-sm (Lists, details)
  - Small: text-xs (Metadata, timestamps)

- **Special:**
  - Pricing: text-2xl font-bold (Rate display)
  - Labels: text-xs font-medium uppercase tracking-wide

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 8, 12, 16 (p-2, m-4, gap-8, py-12, mt-16)

**Container Widths:**
- Full layout: max-w-7xl mx-auto px-4
- Content sections: max-w-6xl
- Forms/Details: max-w-2xl
- Cards grid: grid gap-6

**Breakpoints Strategy:**
- Mobile: Single column, full-width cards
- Tablet (md:): 2-column grids
- Desktop (lg:): 3-column service grids, 2-column dashboard

## Component Library

**Navigation:**
- Top navbar: Logo left, category pills center, user avatar right
- Mobile: Hamburger menu with overlay drawer
- Provider/Customer mode toggle in header

**Service Discovery:**
- Search bar: Prominent with category dropdown and location input
- Filter sidebar: Collapsible (mobile drawer), price range, ratings, availability
- Service cards: Image, provider avatar, title, rating stars, price per hour, quick book button
- Grid layout: 3 columns desktop, 2 tablet, 1 mobile

**Booking Flow:**
- Date/time picker: Calendar component with available slots highlighted
- Service summary: Sticky sidebar with price calculation
- Provider profile modal: Ratings, reviews, service list, portfolio images

**Dashboards:**
- Customer: Upcoming bookings, past services, saved providers
- Provider: Job requests (accept/decline), active jobs, earnings summary
- Job cards: Status badge, customer info, service details, action buttons

**Forms & Inputs:**
- Input fields: Consistent h-12 with rounded-lg borders
- Select dropdowns: Native with custom styling
- File upload: Drag-drop for provider portfolio images
- Checkboxes/Radio: Custom styled with primary color

**Data Display:**
- Rating component: Gold stars (45 100% 50%) with count
- Status badges: Rounded-full px-3 py-1 with semantic colors
- Price display: Bold with /hour suffix
- Availability calendar: Grid with color-coded availability

**Modals & Overlays:**
- Booking confirmation: Centered modal with service summary
- Image gallery: Full-screen lightbox for portfolio
- Review submission: Modal with star rating and text input

## Images Strategy

**Hero Section:** Large hero image showcasing handyman at work (authentic, professional quality)
- Height: min-h-[500px] on desktop, min-h-[400px] mobile
- Overlay: Dark gradient for text legibility
- CTA: Prominent search bar overlaid on hero

**Service Cards:** Square thumbnails (aspect-square) for each service type
**Provider Profiles:** Circular avatar (rounded-full w-16 h-16) and portfolio gallery grid
**Trust Signals:** Before/after job images in completed job listings

**Icons:** Heroicons (outline for navigation, solid for actions)

## Interaction Patterns

- Hover states: Subtle scale-105 on cards, color transitions
- Loading states: Skeleton screens for service grids
- Empty states: Friendly illustrations with actionable CTAs
- Micro-animations: Minimal - rating stars fill, success checkmarks only