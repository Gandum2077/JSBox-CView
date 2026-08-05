import { Base } from "./base";
import { Matrix } from "./single-views";

/** ImagePager 的图片、页码和缩放属性。 */
export interface ImagePagerProps {
  /** 按页面顺序排列的图片地址，默认为空数组。 */
  srcs?: string[];
  /** 初始页码，默认为 `0`。 */
  page?: number;
  /** 是否允许双击缩放，默认为 `true`。 */
  doubleTapToZoom?: boolean;
}

/** ImagePager 的分页和点击事件。 */
export interface ImagePagerEvents {
  /** 用户拖动到新页面时触发。 */
  changed?: (page: number) => void;
  /** 预留的图片点击回调；当前实现不会自动触发。 */
  tapped?: (sender: ImagePager) => void;
}

/**
 * 使用水平 Matrix 分页浏览可缩放图片的组件。
 *
 * 每个页面包含一个支持缩放的 Scroll 和等比适应的 Image，适合图片较多、需要复用单元格的场景。
 * Matrix 会根据视口返回整页尺寸；宽高变化时组件清除加载记录、刷新单元格并恢复逻辑页码。
 *
 * `page` 用于无动画定位，`scrollToPage` 用于动画定位。`changed` 只在用户拖动产生新页码时触发，
 * 程序化切页不会触发该事件。组件会在滚动期间准备相邻页面，并在复用单元格时重置缩放比例。
 * 调用方负责保证页码处于 `srcs` 的有效索引范围内。
 * @example
 * ```ts
 * const pager = new ImagePager({
 *   props: { srcs: imageURLs, page: 0, doubleTapToZoom: true },
 *   layout: $layout.fill,
 *   events: {
 *     changed: (page) => saveReadingProgress(page),
 *   },
 * });
 * ```
 */
export class ImagePager extends Base<UIView, UiTypes.ViewOptions> {
  /** 图片地址、当前页码和双击缩放配置。 */
  _props: Required<ImagePagerProps>;
  /** 承载图片页面的水平 Matrix。 */
  _matrix: Matrix;
  /** 已处理加载状态的页码记录。 */
  _pageLoadRecorder: { [key: number]: boolean };
  /** 创建包含水平图片 Matrix 的根视图定义。 */
  _defineView: () => UiTypes.ViewOptions;

  /** 创建支持缩放和单元格复用的图片分页器。 */
  constructor({
    props,
    layout,
    events = {},
  }: {
    /** 图片地址、初始页码和双击缩放配置。 */
    props: ImagePagerProps;
    /** 根视图布局；必须能够确定分页视口尺寸。 */
    layout: (make: MASConstraintMaker, view: UIView) => void;
    /** 图片分页事件。 */
    events: ImagePagerEvents;
  }) {
    super();
    this._props = {
      ...props,
      srcs: props.srcs ?? [],
      page: props.page ?? 0,
      doubleTapToZoom: props.doubleTapToZoom ?? true,
    };
    this._pageLoadRecorder = {};
    this._matrix = new Matrix({
      props: {
        direction: $scrollDirection.horizontal,
        pagingEnabled: true,
        alwaysBounceVertical: false,
        showsVerticalIndicator: false,
        showsHorizontalIndicator: false,
        template: {
          views: [
            {
              type: "scroll",
              props: {
                id: "scroll",
                zoomEnabled: true,
                maxZoomScale: 3,
                doubleTapToZoom: this._props.doubleTapToZoom,
              },
              layout: $layout.fill,
              views: [
                {
                  type: "image",
                  props: {
                    id: "image",
                    contentMode: $contentMode.scaleAspectFit,
                  },
                },
              ],
            },
          ],
        },
        data: this._props.srcs.map((n) => {
          return { image: { src: n } };
        }),
      },
      layout: $layout.fill,
      events: {
        ready: (sender) => {
          // 如果没有此处的relayout，则会出现莫名其妙的bug
          sender.relayout();
          if (!this._matrix.view) return;
          this.page = this.page;
          this.loadsrc(this.page);
        },
        itemSize: (sender, indexPath) => {
          return $size(sender.frame.width, sender.frame.height);
        },
        forEachItem: (view, indexPath) => {
          const scroll = view.get("scroll") as UIScrollView;
          scroll.zoomScale = 0;
          //$delay(0.01, () => {});
        },
        willEndDragging: (sender, velocity, target) => {
          const oldPage = this.page;
          this._props.page = Math.round(target.x / sender.frame.width);
          //this.loadsrc(this.page, true);
          if (oldPage !== this.page && events.changed) events.changed(this.page);
        },
        didScroll: (sender) => {
          this.loadsrc(this.page + 1, true);
          this.loadsrc(this.page - 1, true);
        },
      },
    });
    this._defineView = () => {
      return {
        type: "view",
        props: {
          id: this.id,
        },
        layout,
        views: [this._matrix.definition],
        events: {
          layoutSubviews: (sender) => {
            this._pageLoadRecorder = {};
            sender.relayout();
            if (!this._matrix.view) return;
            this._matrix.view.reload();
            this.page = this.page;
            $delay(0.1, () => this.loadsrc(this.page, true));
            $delay(0.3, () => this.loadsrc(this.page, true));
          },
        },
      };
    };
  }

  /**
   * 标记指定页面已处理，并在需要时重置其缩放比例。
   * @param page - 目标页码；越界或单元格尚未创建时不执行操作。
   * @param forced - 是否忽略已有图片和加载记录强制处理。
   */
  loadsrc(page: number, forced = false) {
    if (page < 0 || page >= this._props.srcs.length) return;
    const cell = this._matrix.view.cell($indexPath(0, page));
    if (!cell) return;
    const image = cell.get("image") as UIImageView;
    if (forced || !image.image || !this._pageLoadRecorder[page]) {
      const scroll = cell.get("scroll") as UIScrollView;
      scroll.zoomScale = 0;
      this._pageLoadRecorder[page] = true;
    }
  }

  /**
   * 获取当前逻辑页码。
   * @returns 当前页面索引。
   */
  get page() {
    return this._props.page;
  }

  /**
   * 获取当前页面已经加载的图片对象。
   * @returns 当前 `UIImage`；单元格或图片尚未加载时返回 `undefined`。
   */
  get currentImage() {
    const cell = this._matrix.view.cell($indexPath(0, this.page));
    if (!cell) return;
    const image = cell.get("image") as UIImageView;
    return image.image;
  }

  /**
   * 无动画定位到指定页面。
   *
   * 此操作不会触发 `changed`；调用方负责保证索引有效。
   * @param page - 目标页面索引。
   */
  set page(page) {
    this._matrix.view.scrollTo({
      indexPath: $indexPath(0, page),
      animated: false,
    });
    this._props.page = page;
  }

  /**
   * 动画滚动到指定页面。
   *
   * 此操作不会触发 `changed`；调用方负责保证索引有效。
   * @param page - 目标页面索引。
   */
  scrollToPage(page: number) {
    this._matrix.view.scrollTo({
      indexPath: $indexPath(0, page),
      animated: true,
    });
    this._props.page = page;
  }
}
