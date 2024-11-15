import throttle from "lodash/throttle";

export class Masonry {
  private resizeObserver?: ResizeObserver;
  private mutationObserver?: MutationObserver;
  private items: HTMLElement[] = [];

  constructor(private grid: Element) {
    if (CSS.supports("grid-template-rows", "masonry") === false) {
      this.resizeObserver = new ResizeObserver(this.update);
      this.mutationObserver = new MutationObserver(this.update);
      this.create();
    }
  }

  update = throttle(() => {
    const computedStyle = window.getComputedStyle(this.grid);

    if (computedStyle.getPropertyValue("display").includes("grid") === false) {
      this.clean();
      return;
    }

    const { columns } = parseGridTemplateColumns(this.grid);

    if (columns.length <= 1) {
      this.clean();
      return;
    }

    const rowGap =
      parseInt(computedStyle.getPropertyValue("row-gap").trim()) || 0;

    for (let columnIndex = 0; columnIndex < columns.length; columnIndex++) {
      const firstItemInColumn = this.items[columnIndex];

      firstItemInColumn?.style.removeProperty("margin-top");
    }

    for (let index = 0; index < this.items.length; index++) {
      const prevItem = this.items[index - columns.length];
      const nextItem = this.items[index];

      if (prevItem !== undefined && nextItem !== undefined) {
        const prevBottom = prevItem.getBoundingClientRect().bottom;

        nextItem.style.removeProperty("margin-top");

        const nextTop = nextItem.getBoundingClientRect().top;

        if (nextTop - rowGap !== prevBottom) {
          const margin = prevBottom - (nextTop - rowGap);

          nextItem.style.setProperty("margin-top", `${margin}px`);
        }
      }
    }
  }, 32);

  create = () => {
    this.destroy();
    this.mutationObserver?.observe(this.grid, {
      childList: true,
    });
    this.items = Array.from(this.grid.children) as HTMLElement[];

    this.items.forEach((item) => {
      this.resizeObserver?.observe(item);
    });
  };

  destroy = () => {
    this.resizeObserver?.disconnect();
    this.mutationObserver?.disconnect();
    this.clean();
    this.items = [];
  };

  private clean = () => {
    this.items.forEach((item) => {
      item.style.removeProperty("margin-top");
    });
  };
}
function parseGridTemplateColumns(grid: Element) {
  const computedStyle = window.getComputedStyle(grid);
  const columns = computedStyle
    .getPropertyValue("grid-template-columns")
    .trim();

  if (columns === "none") {
    return { type: "none", columns: [] };
  }

  const columnEntries = columns
    .split(/\s(?=(?:[^()]*\([^()]*\))*[^()]*$)/)
    .map((entry) => {
      if (/^\[.*\]$/.test(entry)) {
        // Line name definition
        return { type: "line-name", value: entry };
      } else if (/^repeat\(.+\)$/.test(entry)) {
        // Repeat notation
        return { type: "repeat", value: entry };
      } else if (/^minmax\(.+\)$/.test(entry)) {
        // Minmax notation
        return { type: "minmax", value: entry };
      } else if (/^fit-content\(.+\)$/.test(entry)) {
        // Fit-content notation
        return { type: "fit-content", value: entry };
      } else if (
        entry === "auto" ||
        entry === "max-content" ||
        entry === "min-content"
      ) {
        // Auto, max-content, min-content keywords
        return { type: "keyword", value: entry };
      } else if (
        /^\d+(px|em|rem|%)$/.test(entry) ||
        /^\d*\.?\d+fr$/.test(entry)
      ) {
        // Lengths, percentages, and flexible (fr) units
        return { type: "dimension", value: entry };
      } else if (entry === "subgrid" || entry === "masonry") {
        // Subgrid or masonry keywords
        return { type: "special", value: entry };
      } else {
        // Global values (inherit, initial, revert, unset)
        return { type: "global", value: entry };
      }
    });

  return {
    type: "track-list",
    columns: columnEntries,
  };
}
