import throttle from "lodash/throttle";

// Represents a parsed CSS grid column value
interface CSSValue {
  type: 'line-name' | 'repeat' | 'minmax' | 'fit-content' | 'keyword' | 'dimension' | 'special' | 'global';
  value: string;
}

// Represents the parsed result of grid-template-columns
interface GridTemplateColumns {
  type: 'none' | 'track-list';
  columns: CSSValue[];
}

// Maps a CSS grid-template-columns value to its type
const parseCSSValue = (value: string): CSSValue['type'] => {
  const tests = [
    { test: /^\[.*\]$/, type: 'line-name' },
    { test: /^repeat\(.+\)$/, type: 'repeat' },
    { test: /^minmax\(.+\)$/, type: 'minmax' },
    { test: /^fit-content\(.+\)$/, type: 'fit-content' },
    { test: /^(auto|max-content|min-content)$/, type: 'keyword' },
    { test: /^\d+(?:px|em|rem|%)|\d*\.?\d+fr$/, type: 'dimension' },
    { test: /^(subgrid|masonry)$/, type: 'special' },
    { test: /.*/, type: 'global' }
  ] as const;
  // Map CSS grid column value to a type (e.g., 'dimension', 'keyword')
  return tests.find(({ test }) => test.test(value))?.type || 'global';
};

// Parses the grid-template-columns property of an element
function parseGridTemplateColumns(grid: HTMLElement): GridTemplateColumns {
  const columns = window.getComputedStyle(grid)
    .getPropertyValue('grid-template-columns')
    .trim();
  if ('none' === columns) {
    return {
      type: 'none',
      columns: [],
    };
  }
  // Filters out line names to get actual column tracks
  const parsed = columns.split(/\s(?=(?:[^()]*\([^()]*\))*[^()]*$)/)
    .map(value => ({ type: parseCSSValue(value), value }))
    .filter(col => 'line-name' !== col.type);
  return {
    type: 'track-list',
    columns: parsed,
  };
}

export class Masonry {
  private readonly grid: HTMLElement;
  private items: HTMLElement[] = [];
  private mutationObserver?: MutationObserver;
  private resizeObserver?: ResizeObserver;

  /**
   * Initializes a Masonry layout for a grid element
   * @param grid - The grid container element
   */
  constructor(private grid: HTMLElement) {
    if (!CSS.supports('grid-template-rows', 'masonry')) {
      // Throttle updates to handle DOM and resize changes at ~30 FPS for smooth feedback
      const throttledUpdate = throttle(() => this.update(), 32); // 1000ms / 32 ≈ 31.25 updates per second
      this.mutationObserver = new MutationObserver(throttledUpdate);
      this.resizeObserver = new ResizeObserver(throttledUpdate);
      this.create();
    }
  }

  /**
   * Updates the masonry layout by adjusting item spacing
   */
  update(): void {
    const { columns } = parseGridTemplateColumns(this.grid);
    const style = window.getComputedStyle(this.grid);
    if (!style.getPropertyValue('display').includes('grid') || 1 >= columns.length) {
      return this.clean();
    }
    const rowGap = parseFloat(style.getPropertyValue('row-gap')) || 0;
    this.adjustColumnSpacing(rowGap, columns);
  }

  /**
   * Sets up observers and populates items from existing grid children
   */
  create(): void {
    this.destroy();
    this.mutationObserver?.observe(this.grid, {
      childList: true,
    });
    this.items = Array.from(this.grid.children) as HTMLElement[];

    this.items.forEach((item) => {
      this.resizeObserver?.observe(item);
    });
  }

  /**
   * Disconnects observers and resets the grid layout
   */
  destroy(): void {
    this.resizeObserver?.disconnect();
    this.mutationObserver?.disconnect();
    this.clean();
    this.items = [];
  }

  /**
   * Adjusts vertical spacing between grid items based on row gap
   * @param rowGap - The parsed row gap value in pixels
   * @param columns - The parsed grid-template-columns configuration
   */
  private adjustColumnSpacing(rowGap: number, columns: CSSValue[]): void {
    // Reset first items in each column
    this.items.slice(0, columns.length).forEach(item => {
      item?.style.removeProperty('margin-top');
    });
    this.items.forEach((nextItem, index) => {
      const prevItem = this.items[index - columns.length];
      if (!prevItem) return;
      const prevBottom = prevItem.getBoundingClientRect().bottom;
      nextItem.style.removeProperty('margin-top')
      const nextTop = nextItem.getBoundingClientRect().top;
      const gapDiff = prevBottom - (nextTop - rowGap);
      if (Number.EPSILON < Math.abs(gapDiff)) {
        const margin = Math.round((gapDiff + Number.EPSILON) * 100) / 100;
        nextItem.style.setProperty('margin-top', `${margin}px`)
      }
    })
  }

  /**
   * Removes margin-top style property from all grid items
   */
  private clean(): void {
    this.items.forEach((item) => {
      item.style.removeProperty("margin-top");
    });
  }
}
