# CSS Grid masonry polyfill

This library helps to make masonry grid layout using css grid

## Example

```css
.masonry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, auto));
  align-items: start;
  gap: 12px;
}
```

```ts
const grid = document.querySelector(".masonry-grid");

if (grid !== null) {
  new Masonry(grid);
}
```
