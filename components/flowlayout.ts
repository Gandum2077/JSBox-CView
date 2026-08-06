import { Base } from "./base";

/** 可报告自身理想宽度的 Flow 项目组件。 */
export interface FlowlayoutItem extends Base<any, any> {
  /** 返回项目理想宽度。 */
  itemWidth: () => number;
}

/** Flowlayout 属性接口。 */
export interface FlowlayoutProps<T extends FlowlayoutItem> {
  /** 实现 `itemWidth()` 的项目组件。 */
  items: T[];
  /** 项目之间的水平和垂直间距。 */
  spacing: number;
  /** 所有项目的固定高度。 */
  itemHeight: number;
  /** 最大可见行数。 */
  fixedRows?: number;
  /** 是否禁止组件自动更新容器高度。 */
  fixedHeight?: boolean;
  /** 应用于每个项目 Wrapper 的上下文菜单。 */
  menu?: UiTypes.ContextMenuOptions<UIView>;
  /** 根容器背景色。 */
  bgcolor?: UIColor;
}

/** Flowlayout 事件接口。 */
export interface FlowlayoutEvents<T extends FlowlayoutItem> {
  /** 点击项目时触发。 */
  didSelect?: (index: number, item: T) => void;
  /** 长按项目时触发。 */
  didLongPress?: (index: number, item: T) => void;
}

/**
 * 流式布局：将不同宽度的 CView 项目按固定高度和间距左对齐、自动换行的非滚动布局。
 *
 * 每个项目必须实现同步的 `itemWidth()`，组件使用直接设置 Wrapper `frame` 的方式排列项目。首个项目从左上角开始，
 * 边缘不额外留白；项目理想宽度超过容器时会限制为容器宽度。`fixedRows` 可限制最大可见行数，超出的 Wrapper
 * 会被隐藏。
 *
 * 默认情况下，容器宽度变化或 `items` 被替换后会通过 `updateLayout` 更新自身高度，因此传入的 `layout` 必须
 * 预先包含高度约束。若外部固定高度，设置 `fixedHeight: true`，组件将只重排项目而不更新容器高度。
 * `heightToWidth` 可在视图加载前按目标宽度计算所需高度，也可用于 `DynamicRowHeightList` 的行组件。
 * @template T - 实现 `itemWidth()` 的 CView 项目类型。
 * @example
 * ```ts
 * const tags = new Flowlayout({
 *   props: { items: tagViews, spacing: 8, itemHeight: 32 },
 *   layout: (make, view) => {
 *     make.left.right.inset(16);
 *     make.height.equalTo(32);
 *   },
 *   events: {
 *     didSelect: (_flow, index) => selectTag(index),
 *   },
 * });
 * ```
 */
export class Flowlayout<T extends FlowlayoutItem> extends Base<UIView, UiTypes.ViewOptions> {
  /** 最近一次完成项目排列的容器宽度。 */
  private _width: number;
  /** Flow 项目、尺寸、行数限制和外观配置。 */
  private _props: FlowlayoutProps<T>;
  /** 当前项目对应的可交互 Wrapper。 */
  private _wrappers: WrapperView<T>[];
  /** 项目点击和长按事件。 */
  private _events?: FlowlayoutEvents<T>;
  /** 创建包含所有项目 Wrapper 的根视图定义。 */
  _defineView: () => UiTypes.ViewOptions;

  /** 创建左对齐、自动换行的 Flow 布局。 */
  constructor({
    props,
    layout,
    events,
  }: {
    /** Flow 项目、尺寸、行数限制和外观配置。 */
    props: FlowlayoutProps<T>;
    /** 根容器布局；自动高度模式下必须预先包含高度约束。 */
    layout: (make: MASConstraintMaker, view: UIView) => void;
    /** 项目点击和长按事件。 */
    events?: FlowlayoutEvents<T>;
  }) {
    super();
    this._width = 0;
    this._props = props;
    this._events = events;
    this._wrappers = props.items.map(
      (item, index) =>
        new WrapperView({
          props: {
            item,
            menu: props.menu,
            index,
          },
          events,
        }),
    );
    this._defineView = () => ({
      type: "view",
      props: {
        bgcolor: props.bgcolor,
      },
      layout,
      events: {
        layoutSubviews: (sender) => {
          if (this._width !== sender.frame.width) {
            this._width = sender.frame.width;
            const height = this._layoutWrappers();
            if (!this._props.fixedHeight) sender.updateLayout((make) => make.height.equalTo(height));
          }
        },
      },
      views: this._wrappers.map((wrapper) => wrapper.definition),
    });
  }

  /**
   * 获取指定索引的原始项目组件。
   * @param index - 项目索引。
   * @returns 对应的 CView 项目。
   */
  cell(index: number): T {
    return this._props.items[index];
  }

  /**
   * 获取当前项目组件。
   * @returns 当前项目数组。
   */
  get items(): T[] {
    return this._props.items;
  }

  /**
   * 替换项目、重建 Wrapper 并重新计算布局。
   * @param items - 新的项目组件。
   */
  set items(items: T[]) {
    this._props.items = items;
    this._wrappers = items.map(
      (item, index) =>
        new WrapperView({
          props: {
            item,
            menu: this._props.menu,
            index,
          },
          events: this._events,
        }),
    );
    this.view.views.forEach((v) => v.remove());
    this._wrappers.forEach((wrapper) => this.view.add(wrapper.definition));
    const height = this._layoutWrappers();
    if (!this._props.fixedHeight) this.view.updateLayout((make) => make.height.equalTo(height));
  }

  /**
   * 按当前容器宽度设置所有 Wrapper 的 frame 和可见状态。
   * @returns 应用于容器的布局高度。
   */
  _layoutWrappers(): number {
    const totalWidth = this._width;
    const itemHeight = this._props.itemHeight;
    const itemSpacing = this._props.spacing;
    let x = 0;
    let y = 0;
    let line = 1;
    this._wrappers.forEach((wrapper, index) => {
      const itemWidth = wrapper.item.itemWidth();
      const width = Math.min(itemWidth, totalWidth);
      if (x + width > totalWidth) {
        x = 0;
        y += itemHeight + itemSpacing;
        line++;
      }
      if (this._props.fixedRows && line > this._props.fixedRows) {
        wrapper.hidden = true;
      } else {
        wrapper.hidden = false;
      }
      wrapper.frame = $rect(x, y, width, itemHeight);
      x += width + itemSpacing;
    });
    if (this._props.fixedRows && line > this._props.fixedRows) {
      return this._props.fixedRows * (itemHeight + itemSpacing) - itemSpacing;
    }
    return y + itemHeight;
  }

  /**
   * 计算给定宽度下 Flow 布局所需的高度。
   * @param width - 可用容器宽度。
   * @returns 考虑固定行数限制后的布局高度。
   */
  heightToWidth(width: number): number {
    const totalWidth = width;
    const itemHeight = this._props.itemHeight;
    const itemSpacing = this._props.spacing;
    let x = 0;
    let y = 0;
    let line = 1;
    this._wrappers.forEach((wrapper, index) => {
      const itemWidth = wrapper.item.itemWidth();
      const width = Math.min(itemWidth, totalWidth);
      if (x + width > totalWidth) {
        x = 0;
        y += itemHeight + itemSpacing;
        line++;
      }
      x += width + itemSpacing;
    });
    if (this._props.fixedRows && line > this._props.fixedRows) {
      return this._props.fixedRows * (itemHeight + itemSpacing) - itemSpacing;
    }
    return y + itemHeight;
  }
}

/** WrapperView 属性接口 */
interface WrapperViewProps<T extends FlowlayoutItem> {
  /** 原始项目组件。 */
  item: T;
  /** Wrapper 上下文菜单。 */
  menu?: UiTypes.ContextMenuOptions<UIView>;
  /** 项目索引。 */
  index: number;
}

/** 为 Flow 项目提供 frame、显隐和交互事件的内部容器。 */
class WrapperView<T extends FlowlayoutItem> extends Base<UIView, UiTypes.ViewOptions> {
  /** 创建包含原始项目的 Wrapper 定义。 */
  _defineView: () => UiTypes.ViewOptions;
  /** Wrapper 内的原始项目。 */
  item: T;

  /** 创建单个可交互的 Flow 项目 Wrapper。 */
  constructor({ props, events }: { props: WrapperViewProps<T>; events?: FlowlayoutEvents<T> }) {
    super();
    this.item = props.item;
    const viewProps: UiTypes.ViewProps = {
      frame: $rect(0, 0, 0, 0),
      userInteractionEnabled: true,
    };
    if (props.menu) {
      viewProps.menu = props.menu;
    }
    this._defineView = () => ({
      type: "view",
      props: viewProps,
      views: [props.item.definition],
      events: {
        tapped: () => {
          if (events?.didSelect) events.didSelect(props.index, props.item);
        },
        longPressed: () => {
          if (events?.didLongPress) events.didLongPress(props.index, props.item);
        },
      },
    });
  }

  /** 设置 Wrapper frame。 */
  set frame(frame: JBRect) {
    this.view.frame = frame;
  }

  /**
   * 获取 Wrapper frame。
   * @returns 当前 frame。
   */
  get frame(): JBRect {
    return this.view.frame;
  }

  /** 设置 Wrapper 是否隐藏。 */
  set hidden(hidden: boolean) {
    this.view.hidden = hidden;
  }

  /**
   * 获取 Wrapper 是否隐藏。
   * @returns 当前隐藏状态。
   */
  get hidden(): boolean {
    return this.view.hidden;
  }
}
