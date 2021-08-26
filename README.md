# Masonry grid implementation

## Install

```console
npm install @prof-dev/masonry
```

## Usage

```html
<div class="container">
  <div class="item"></div>
  ...
  <div class="item"></div>
</div>
```

```scss
.container {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  margin: 0 -12px;

  .item {
    @media (min-width: 992px) {
      flex: 0 0 calc(100% / 3 - 24px);
    }

    @media (max-width: 991.98px) {
      flex: 0 0 calc(100% / 2 - 24px);
    }

    @media (max-width: 499.98px) {
      flex: 0 0 100%;
    }
  }
}
```

```typescript
Masonry.create(container, {
  breakpoints: [
    {
      query: "(min-width: 992px)",
      columns: 3,
      gap: 22,
    },
    {
      query: "(max-width: 991.98px)",
      columns: 2,
      gap: 22,
    },
    {
      query: "(max-width: 499.98px)",
      columns: 1,
      gap: 22,
    },
  ],
});
```
