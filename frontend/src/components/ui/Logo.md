# Logo Component

A reusable, branded logo component for the FoodShare application featuring a Leaf icon.

## Usage

```tsx
import { Logo } from '../components/ui';

// Basic usage with text
<Logo />

// Icon only (for small spaces)
<Logo iconOnly={true} showText={false} />

// Large size with dark variant
<Logo size="lg" variant="dark" />

// Custom styling
<Logo size="md" variant="light" className="my-custom-class" />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Size of the logo |
| `showText` | `boolean` | `true` | Show "FoodShare" text next to icon |
| `variant` | `'light' \| 'dark' \| 'color'` | `'light'` | Color scheme variant |
| `iconOnly` | `boolean` | `false` | Show only the icon without text |
| `className` | `string` | `''` | Additional CSS classes |

## Variants

- **`light`**: For use on light backgrounds (white navbar)
- **`dark`**: For use on dark backgrounds (footer)
- **`color`**: Solid emerald background with white icon (auth page, special emphasis)

## Size Reference

- **`xs`**: 16px icon - for inline text, badges
- **`sm`**: 20px icon - for compact UI elements
- **`md`**: 24px icon - navbar, standard usage (default)
- **`lg`**: 32px icon - footer, section headers
- **`xl`**: 40px icon - auth page, hero sections

## Examples

### Navbar
```tsx
<Logo size="md" variant="light" showText={true} />
```

### Footer
```tsx
<Logo size="md" variant="dark" showText={true} />
```

### Auth Page (Icon Only)
```tsx
<Logo size="xl" variant="color" showText={false} iconOnly={true} />
```

### Mobile Menu (Small)
```tsx
<Logo size="sm" variant="light" iconOnly={true} />
```
