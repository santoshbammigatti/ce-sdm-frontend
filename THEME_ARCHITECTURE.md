# Theme System Architecture

## Overview
The application implements a professional dark/light theme system using React Context API and CSS custom properties (variables).

## Architecture Components

### 1. ThemeContext (`src/context/ThemeContext.jsx`)
**Purpose**: Centralized theme state management using React Context API

**Features**:
- Theme state management (light/dark)
- localStorage persistence
- System preference detection on first load
- Theme toggle functionality
- Auto-apply theme to document root

**Best Practices**:
- Single source of truth for theme state
- Custom hook (`useTheme`) for easy consumption
- Error boundary protection
- Automatic side effects handled with useEffect

### 2. ThemeToggle Component (`src/components/ThemeToggle.jsx`)
**Purpose**: UI control for switching themes

**Features**:
- Sun/Moon SVG icons
- Smooth rotation animation on toggle
- Accessibility attributes (aria-label, title)
- Responsive hover states

### 3. CSS Variables System (`src/index.css`)
**Purpose**: Theme-aware styling using CSS custom properties

**Dark Theme Colors**:
```css
--bg: #0b1220          (deep navy background)
--panel: #0f172a       (card/panel background)
--text: #e2e8f0        (light text)
--muted: #94a3b8       (muted text)
--brand: #22c55e       (green accent)
--border: #1f2937      (subtle borders)
```

**Light Theme Colors**:
```css
--bg: #f8fafc          (light gray background)
--panel: #ffffff       (white cards/panels)
--text: #0f172a        (dark text)
--muted: #64748b       (muted gray text)
--brand: #16a34a       (darker green)
--border: #e2e8f0      (light borders)
```

**Design Decisions**:
- CSS variables allow instant theme switching without component re-renders
- Semantic naming (--bg, --text, --panel) makes intent clear
- Smooth 0.3s transitions for all color changes
- Both themes maintain WCAG accessibility contrast ratios

### 4. Integration Points

**main.jsx**:
```jsx
<ThemeProvider>
  <App />
</ThemeProvider>
```
Wraps entire app to provide theme context globally.

**App.jsx**:
```jsx
import ThemeToggle from './components/ThemeToggle';
// ... positioned in toolbar next to API label
```

## User Experience Flow

1. **First Visit**:
   - System checks localStorage for saved preference
   - Falls back to system preference detection
   - Applies theme immediately (no flash)

2. **Theme Toggle**:
   - User clicks sun/moon icon
   - ThemeContext updates state
   - DOM attribute changes: `data-theme="light"` or `"dark"`
   - CSS variables update instantly
   - All components transition smoothly (0.3s)
   - Preference saved to localStorage

3. **Subsequent Visits**:
   - Theme loads from localStorage
   - User's preference persists across sessions

## Benefits of This Architecture

✅ **Separation of Concerns**: Theme logic separate from UI components
✅ **Performance**: CSS variables = no re-renders on theme change
✅ **Maintainability**: Single source of truth for colors
✅ **Scalability**: Easy to add new themes or colors
✅ **Accessibility**: Respects system preferences
✅ **UX**: Smooth transitions, persistent preferences
✅ **Industry Standard**: Context API + CSS variables pattern
✅ **Type Safety**: Could easily add TypeScript
✅ **Testing**: ThemeProvider can be mocked in tests

## File Structure
```
src/
├── context/
│   └── ThemeContext.jsx       # Theme state & logic
├── components/
│   └── ThemeToggle.jsx        # UI control
├── index.css                   # Theme variables & styles
├── main.jsx                    # ThemeProvider wrapper
└── App.jsx                     # ThemeToggle placement
```

## Future Enhancements
- [ ] Add more theme options (auto/system)
- [ ] Add theme-specific images/logos
- [ ] Add custom color picker
- [ ] Add high-contrast mode
- [ ] Add reduced-motion mode
- [ ] TypeScript types for theme values
