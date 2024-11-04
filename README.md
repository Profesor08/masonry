# CSS Grid masonry polyfill

<a href="https://npmjs.com/package/@prof-dev/masonry"><img src="https://img.shields.io/npm/v/@prof-dev/masonry.svg" alt="npm package"></a>

## Installation

````bash
npm i @prof-dev/masonry
``

## Example

```css
.masonry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, auto));
  align-items: start;
  gap: 12px;
}
````

```ts
const grid = document.querySelector(".masonry-grid");

if (grid !== null) {
  new Masonry(grid);
}
```
