# Inter Font and Gradient Background

This guide demonstrates how to import the Inter font family and create a gradient background with HTML and CSS.

## 1. Importing Inter Font Family

Add the following `@import` rule in your CSS file to include the Inter font family:

```css
@import url("https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap");
```

## 2. Gradient Background Implementation

### HTML Structure

```html
<div class="mainDiv">
  <div class="radial-gradient"></div>
</div>
```

### CSS Styles

```css
.mainDiv {
  position: absolute;
  inset: 0;
  z-index: -10;
  height: 100%;
  width: 100%;
  background-color: white;
  background-image: linear-gradient(to right, #f0f0f0 1px, transparent 1px),
    linear-gradient(to bottom, #f0f0f0 1px, transparent 1px);
  background-size: 6rem 4rem;
  font-family: "Inter", serif;
}

.radial-gradient {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-image: radial-gradient(
    circle 800px at 100% 200px,
    #d5c5ff,
    transparent
  );
}
```

### Explanation

1. **`mainDiv` Class**:

   - The `mainDiv` creates a grid-like background using two linear gradients that intersect.
   - It uses the imported Inter font family for any text contained within.

2. **`radial-gradient` Class**:
   - The `radial-gradient` overlays the `mainDiv` with a radial gradient originating from the top-right corner.
   - The gradient transitions from `#d5c5ff` to transparent, creating a subtle visual effect.

## Preview

Ensure your HTML and CSS files are linked correctly to see the background and font styling. The `mainDiv` spans the full viewport, and the radial gradient adds a decorative touch.
