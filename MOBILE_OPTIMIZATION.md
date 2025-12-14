# 📱 Mobilioji Optimizacija

## Apžvalga

Sistema buvo visiškai optimizuota mobiliesiems įrenginiams (telefonams ir planšetėms). Visi pagrindiniai puslapiai ir komponentai pritaikyti responsive dizainui su touch gesture palaikymu.

## ✨ Pagrindinės Optimizacijos

### 1. Viewport ir Meta Tags
- ✅ Pridėtas viewport meta tag su proper scaling
- ✅ PWA meta tags (theme-color, apple-mobile-web-app)
- ✅ Optimizuotos scroll properties mobiliam
- ✅ Safe area insets palaikymas (iPhone notch)

### 2. Global CSS Pagerinimaimai
```css
- Touch highlighting išjungtas (-webkit-tap-highlight-color)
- Smooth scrolling su -webkit-overflow-scrolling: touch
- Touch action manipulation mygtuks
- Mobile focus states
- Responsive image optimization
```

### 3. Tailwind Konfigūracija
- ✅ Pridėtas `xs` breakpoint (475px) smulkesniems telefonams
- ✅ Custom utility classes:
  - `touch-target` - 44px minimum touch area
  - `mobile-container` - responsive padding
  - `mobile-text` - adaptive text sizing
  - `mobile-heading` - adaptive heading sizing
  - `safe-area-inset` - notch support

## 📐 Breakpoint Hierarchija

```
xs:  475px  - Maži telefonai (iPhone SE)
sm:  640px  - Standartiniai telefonai
md:  768px  - Planšetės portrait
lg:  1024px - Planšetės landscape / desktop
xl:  1280px - Desktop
2xl: 1536px - Large desktop
```

## 🎨 Optimizuoti Komponentai

### 1. Pagrindinis Puslapis (/)
- Responsive padding (p-4 → sm:p-6 → lg:p-8)
- Adaptive text sizing
- Touch-friendly buttons
- Full-width mobile layout

### 2. Vartotojo Dashboard
- **Header:**
  - Sticky header position
  - Flexbox layout switch (column → row)
  - Compact button text mobile
  - Touch targets ≥44px
  
- **Survey Alerts:**
  - Full-width mobile cards
  - Stacked layout mobile
  - Adaptive icon sizes
  - Touch-friendly action buttons

- **Request Cards:**
  - Single column mobile
  - Line-clamp for long text
  - Responsive padding
  - Wrap-friendly meta info

### 3. Admin Dashboard
- **Stats Cards:**
  - 2 columns mobile (grid-cols-2)
  - 4 columns desktop (lg:grid-cols-4)
  - Compact card padding
  - Responsive icon sizes

- **Kanban Board:**
  - Single column mobile
  - 2 columns tablet (sm:grid-cols-2)
  - 4 columns desktop (lg:grid-cols-4)
  - Smaller cards mobile
  - Touch-optimized drag handles
  - Compact text (text-xs → sm:text-sm)

### 4. Chat Komponentas
- **Modal:**
  - Bottom sheet mobile (rounded-t-2xl)
  - Centered modal desktop
  - 90vh height mobile
  - Full-width mobile
  
- **Messages:**
  - 85% max-width mobile (visibility)
  - Smaller font sizes (text-xs)
  - Compact message padding
  - Date separators optimized

- **Input:**
  - Sticky bottom with safe-area
  - Touch-friendly send button
  - Proper keyboard handling

### 5. Naujos Užklausos Forma
- **Checkboxes:**
  - Single column mobile (better tap target)
  - Larger touch areas (w-4 h-4)
  - Full-width labels

- **Selects:**
  - Full-width mobile
  - Touch-optimized
  - Proper font sizing

### 6. Auth Puslapiai (Login/Register)
- Responsive padding
- Mobile-first form layout
- Touch-friendly inputs
- Adaptive text sizing
- Password strength indicator optimized

## 🔧 Technical Details

### Touch Targets
Visi interaktyvūs elementai atitinka **WCAG 2.1 standartą**:
- Minimum 44x44px touch area
- Applied via `touch-target` class
- Proper spacing between elements

### Font Scaling
```
Mobile (< 640px):    text-xs (12px), text-sm (14px)
Tablet (640-1024px): text-sm (14px), text-base (16px)
Desktop (> 1024px):  text-base (16px), text-lg (18px)
```

### Spacing Scale
```
Mobile:  p-3, p-4, gap-2, gap-3
Tablet:  p-4, p-6, gap-3, gap-4
Desktop: p-6, p-8, gap-4, gap-6
```

## 📊 Performance Optimizations

1. **CSS:**
   - Hardware acceleration enabled
   - Smooth transforms
   - Optimized animations
   - Reduced repaints

2. **Images:**
   - max-width: 100%
   - height: auto
   - Lazy loading ready

3. **Scroll:**
   - -webkit-overflow-scrolling: touch
   - scroll-behavior: smooth
   - Optimized scroll containers

## ✅ Testing Checklist

### Telefonai (320px - 640px)
- ✅ Visi tekstai skaitomi
- ✅ Mygtukai lengvai paspaudžiami
- ✅ Formos lengvai užpildomos
- ✅ Chat veikia bottom sheet režimu
- ✅ Kanban kortelės vilkiamos
- ✅ Nėra horizontal scroll

### Planšetės (640px - 1024px)
- ✅ 2 kolonų layouts veikia
- ✅ Stats cards optimizuoti
- ✅ Kanban 2 kolonos
- ✅ Chat modal centruotas
- ✅ Touch gestures veikia

### Desktop (> 1024px)
- ✅ Full layouts išplėsti
- ✅ 4 kolonų Kanban
- ✅ Optimal spacing
- ✅ Hover states veikia

## 🎯 Mobile UX Features

1. **Touch Gestures:**
   - Drag & Drop Kanban kortelėms
   - Swipe-friendly lists
   - Touch-optimized forms

2. **Visual Feedback:**
   - Active states (active:bg-blue-800)
   - Touch highlights removed
   - Proper focus rings

3. **Navigation:**
   - Sticky headers
   - Bottom-aligned chat
   - Easy-to-reach buttons
   - Compact navigation mobile

4. **Typography:**
   - Readable font sizes
   - Proper line heights
   - Truncate long text
   - Line-clamp for descriptions

## 📱 PWA Ready

Sistema paruošta Progressive Web App funkcionalumui:
- Meta tags pritaikyti
- Theme color nustatytas
- Apple touch icon ready
- Viewport optimizuotas
- Offline-ready architecture

## 🚀 Deployment Notes

### Mobile Testing
Rekomenduojamos testavimo priemonės:
- Chrome DevTools (Device Mode)
- Firefox Responsive Design Mode
- Real device testing (iOS Safari, Android Chrome)
- BrowserStack / LambdaTest

### Performance
- First Contentful Paint: < 1.8s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.8s
- Cumulative Layout Shift: < 0.1

## 📚 Dokumentacija

Responsive dizaino pavyzdžiai:

```tsx
// Mobile-first approach
<div className="p-4 sm:p-6 lg:p-8">
  <h1 className="text-xl sm:text-2xl lg:text-3xl">Heading</h1>
  <button className="w-full sm:w-auto touch-target">
    Action
  </button>
</div>
```

```tsx
// Grid responsive
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
  {/* Cards */}
</div>
```

```tsx
// Flex responsive
<div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
  {/* Content */}
</div>
```

## 🔄 Maintenence

Atnaujinant sistemą, sekite šias gaires:
1. Mobile-first design approach
2. Test visuose breakpoints
3. Touch targets ≥44px
4. Readable text ≥14px mobile
5. Proper spacing between elements

---

**Paskutinis atnaujinimas:** 2024-12-14
**Versija:** 1.0.0
**Autorius:** AI Assistant

