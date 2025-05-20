import throttle from "lodash/throttle";

export class Masonry {
  private mutationObserver: MutationObserver;
  private resizeObserver: ResizeObserver;

  constructor(private grid: Element) {
    this.mutationObserver = new MutationObserver(this.onContainerMutation);
    this.resizeObserver = new ResizeObserver(this.onChildrenResize);

    if (CSS.supports("grid-template-rows", "masonry") === false) {
      this.create();
    }
  }

  private create = () => {
    this.mutationObserver.observe(this.grid, {
      childList: true,
    });

    Array.from(this.grid.children).forEach((item) => {
      this.resizeObserver.observe(item);
    });
  };

  private onContainerMutation = (mutations: MutationRecord[]) => {
    const removedNodes = mutations.flatMap((mutation) =>
      Array.from(mutation.removedNodes),
    );
    const addedNodes = mutations.flatMap((mutation) =>
      Array.from(mutation.addedNodes),
    );

    for (const node of removedNodes) {
      if (node instanceof Element) {
        this.resizeObserver.unobserve(node);
      }
    }

    for (const node of addedNodes) {
      if (node instanceof Element) {
        this.resizeObserver.observe(node);
      }
    }

    if (removedNodes.length > 0 && addedNodes.length === 0) {
      this.update();
    }
  };

  private onChildrenResize = (entries: ResizeObserverEntry[]) => {
    const entriesToUpdate = entries.filter(
      (entry) => entry.target.parentElement !== null,
    );

    if (entriesToUpdate.length > 0) {
      this.update();
    }
  };

  update = throttle(() => {
    const computedStyle = window.getComputedStyle(this.grid);

    if (computedStyle.getPropertyValue("display").includes("grid") === false) {
      this.clean();
      return;
    }

    const columns = parseGridTemplateColumns(this.grid);

    if (columns.length <= 1) {
      this.clean();

      return;
    }

    const rowGap =
      parseFloat(computedStyle.getPropertyValue("row-gap").trim()) || 0;

    const items = Array.from(this.grid.children) as HTMLElement[];

    for (let columnIndex = 0; columnIndex < columns.length; columnIndex++) {
      const firstItemInColumn = items[columnIndex];

      firstItemInColumn?.style.removeProperty("margin-top");
    }

    for (let index = 0; index < items.length; index++) {
      const prevItem = items[index - columns.length];
      const nextItem = items[index];

      if (prevItem !== undefined && nextItem !== undefined) {
        const prevBottom = prevItem.getBoundingClientRect().bottom;

        nextItem.style.removeProperty("margin-top");

        const nextTop = nextItem.getBoundingClientRect().top;

        if (nextTop - rowGap !== prevBottom) {
          const margin =
            Math.round(
              (prevBottom - (nextTop - rowGap) + Number.EPSILON) * 100,
            ) / 100;

          nextItem.style.setProperty("margin-top", `${margin}px`);
        }
      }
    }
  }, 32);

  destroy = () => {
    this.resizeObserver.disconnect();
    this.mutationObserver.disconnect();
    this.clean();
  };

  private clean = () => {
    (Array.from(this.grid.children) as HTMLElement[]).forEach((item) => {
      item.style.removeProperty("margin-top");
    });
  };

  [Symbol.dispose]() {
    this.destroy();
  }
}

function parseGridTemplateColumns(grid: Element) {
  const computedStyle = window.getComputedStyle(grid);

  const gridTemplateColumns = computedStyle.getPropertyValue(
    "grid-template-columns",
  );

  return gridTemplateColumns
    .trim()
    .split(/\s+(?=(?:[^()]*\([^()]*\))*[^()]*$)/);
}
