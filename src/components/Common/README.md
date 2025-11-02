# Common Components

Reusable UI components that are used across the application.

## CustomDropdown

A fully customizable dropdown component that replaces native `<select>` elements with a themed, accessible, and mobile-optimized alternative.

### Features

- ✅ **Theme-aware styling** - Automatically uses colors from ThemeContext
- ✅ **Keyboard accessible** - Full ARIA support and keyboard navigation
- ✅ **Mobile-optimized** - Touch-friendly, prevents zoom on iOS
- ✅ **Animated transitions** - Smooth opening/closing animations
- ✅ **Custom indicators** - Radio button indicators for selected items
- ✅ **Auto-close** - Closes when clicking outside (backdrop)

### Usage

```jsx
import CustomDropdown from '../Common/CustomDropdown.jsx';
import { useThemeColors } from '../../contexts/ThemeContext.jsx';

function MyComponent() {
  const currentColors = useThemeColors();
  const [selectedValue, setSelectedValue] = useState('option1');
  
  const options = [
    { value: 'option1', label: 'First Option' },
    { value: 'option2', label: 'Second Option' },
    { value: 'option3', label: 'Third Option' }
  ];
  
  return (
    <CustomDropdown 
      value={selectedValue}
      options={options}
      onChange={setSelectedValue}
      colors={currentColors}
    />
  );
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `string` | Yes | Currently selected value |
| `options` | `Array<{value: string, label: string}>` | Yes | Array of options to display |
| `onChange` | `Function` | Yes | Callback when selection changes (receives new value) |
| `colors` | `Object` | Yes | Theme colors object |
| `colors.panel` | `string` | Yes | Background color for dropdown |
| `colors.text` | `string` | Yes | Text color |
| `colors.border` | `string` | Yes | Border color |
| `colors.accent` | `string` | Yes | Accent color for selected state |

### Accessibility

The component includes proper ARIA attributes for screen readers:
- `role="button"` on trigger
- `role="listbox"` on menu
- `role="option"` on each option
- `aria-haspopup="listbox"` indicates dropdown functionality
- `aria-expanded` shows open/closed state
- `aria-selected` marks selected option
- `aria-activedescendant` tracks active option

### Keyboard Navigation

- **Enter/Space** - Open/close dropdown
- **Escape** - Close dropdown
- **Click outside** - Close dropdown

### Styling Constants

All styling values are defined as constants at the top of the file:

```javascript
STYLES = {
  TRIGGER: { /* Trigger button styling */ },
  ARROW: { /* Dropdown arrow styling */ },
  MENU: { /* Menu container styling */ },
  OPTION: { /* Individual option styling */ },
  RADIO: { /* Radio indicator styling */ }
}
```

This makes it easy to customize the component's appearance globally.

### Examples

#### Language Selector

```jsx
<CustomDropdown 
  value={currentLanguage}
  options={[
    { value: 'en', label: 'English' },
    { value: 'uk', label: 'Українська' }
  ]}
  onChange={onLanguageChange}
  colors={currentColors}
/>
```

#### Theme Selector

```jsx
<CustomDropdown 
  value={selectedTheme}
  options={[
    { value: 'dark', label: 'Dark' },
    { value: 'light', label: 'Light' },
    { value: 'ocean', label: 'Ocean' }
  ]}
  onChange={onThemeChange}
  colors={currentColors}
/>
```

#### Breathing Technique Selector

```jsx
<CustomDropdown 
  value={selectedTechniqueId}
  options={techniques.map(t => ({
    value: t.id,
    label: t.name
  }))}
  onChange={onTechniqueChange}
  colors={currentColors}
/>
```

### Performance Optimizations

- `React.useMemo` for computing selected option
- `React.useCallback` for event handlers to prevent unnecessary re-renders
- Conditional rendering of menu (only renders when open)

### Browser Support

Works consistently across:
- ✅ iOS Safari (no zoom on focus)
- ✅ Android Chrome
- ✅ Desktop Chrome/Firefox/Safari/Edge
- ✅ All modern mobile browsers

### Differences from Native Select

| Feature | Native `<select>` | `CustomDropdown` |
|---------|-------------------|------------------|
| Styling | Browser-dependent | Fully customizable |
| Theme support | Limited | Complete |
| Mobile appearance | Native OS | Consistent across devices |
| Animations | None | Smooth transitions |
| Radio indicators | No | Yes |
| Backdrop | No | Yes |

---

## Future Components

This directory can contain other reusable components like:
- CustomRadio (currently in SettingsScreen)
- CustomCheckbox
- CustomButton
- CustomInput
- etc.



