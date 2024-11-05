# CSS Grid masonry polyfill

<a href="https://npmjs.com/package/@prof-dev/masonry"><img src="https://img.shields.io/npm/v/@prof-dev/masonry.svg" alt="npm package"></a>

A simple, easy-to-use solution for creating masonry-style grids with CSS Grid. This library checks for support of `grid-template-rows: masonry` in the browser. If unsupported, it automatically adjusts item placement to simulate a masonry layout.

It supports any `grid-template-columns` configuration and allows flexible use of `@media` queries to adjust column layouts.

**Note**: This polyfill does not implement any packing algorithms. The original order of items will be preserved.

<a href="https://profesor08.github.io/masonry">Demo</a>

## Installation

```bash
npm i @prof-dev/masonry
```

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
