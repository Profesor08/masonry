import { EventEmitter } from "@prof-dev/event-emitter";
import { useMedia } from "@prof-dev/media";
import debounce from "lodash/debounce";

interface IMasonryOptions {
  breakpoints: IMasonryBreakpoint[];
}

interface IMasonryBreakpoint {
  query: string;
  columns: number;
  gap: number;
}

const masonryMap = new Map<HTMLElement, Masonry>();

export class Masonry extends EventEmitter<"reflow", Masonry> {
  private options: IMasonryOptions;
  private mediaItemsList: {
    media: MediaQueryList;
    columns: number;
    gap: number;
  }[];
  private resizeObserver: ResizeObserver;
  private mutationObserver: MutationObserver;

  constructor(private element: HTMLElement, options: IMasonryOptions) {
    super();
    this.options = { ...options };
    this.mediaItemsList = this.options.breakpoints.map(
      ({ query, columns, gap }) => {
        const media = useMedia(query);

        media.addEventListener("change", this.reflow.flush);

        return {
          media,
          columns,
          gap,
        };
      },
    );

    this.resizeObserver = new ResizeObserver(this.reflow);

    this.resizeObserver.observe(this.element);

    this.mutationObserver = new MutationObserver(this.reflow);

    this.mutationObserver.observe(this.element, {
      childList: true,
    });

    this.reflow();

    masonryMap.set(this.element, this);
  }

  private reflow = debounce(
    () => {
      this.mediaItemsList.forEach((item) => {
        if (item.media.matches) {
          for (let column = 0; column < item.columns; column++) {
            let prev: HTMLElement | null = null;

            for (
              let i = column;
              i < this.element.children.length;
              i += item.columns
            ) {
              const children = this.element.children[i] as HTMLElement;

              children.style.removeProperty("margin-top");

              if (prev) {
                const { bottom } = prev.getBoundingClientRect();
                const offset = bottom + item.gap;

                const { top } = children.getBoundingClientRect();

                children.style.setProperty(
                  `margin-top`,
                  `${-(top - offset)}px`,
                );
              }

              prev = children;
            }
          }
        }
      });

      this.dispatch("reflow", this);
    },
    100,
    {
      leading: true,
      trailing: true,
      maxWait: 500,
    },
  );

  static create(element: HTMLElement, options: IMasonryOptions) {
    const instance = masonryMap.get(element);

    if (instance !== undefined) {
      return instance;
    }

    return new Masonry(element, options);
  }

  destroy() {
    this.resizeObserver.disconnect();
    this.mutationObserver.disconnect();
    (Array.from(this.element.children) as HTMLElement[]).forEach((children) => {
      children.style.removeProperty("margin-top");
    });
    this.mediaItemsList.forEach((item) => {
      item.media.removeEventListener("change", this.reflow.flush);
    });
    this.mediaItemsList = [];
    masonryMap.delete(this.element);
  }
}
