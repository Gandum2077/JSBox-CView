import { footBarDefaultSegmentColor } from "../utils/colors";
import { Base } from "./base";

/** TabBar 中的单个项目。 */
export interface TabBarItem {
  /** SF Symbol 名称。 */
  symbol?: string;
  /** 项目图片；显示时转换为模板渲染模式。 */
  image?: UIImage;
  /** 项目标题；存在时同时显示图标和文本。 */
  title?: string;
}

/** TabBar 的尺寸、项目、选择状态和外观属性。 */
export interface TabBarProps {
  /** 安全区域上方的内容高度，默认为 `50`。 */
  height?: number;
  /** 按显示顺序排列的 Tab 项目。 */
  items: TabBarItem[];
  /** 初始选中索引，默认为 `0`。 */
  index?: number;
  /** 选中项目颜色，默认为系统链接色。 */
  selectedSegmentTintColor?: UIColor;
  /** 未选中项目颜色。 */
  defaultSegmentTintColor?: UIColor;
  /** 可选纯色背景；省略时使用样式为 `10` 的 Blur。 */
  bgcolor?: UIColor;
}

/** TabBar 的选择和重复点击事件。 */
export interface TabBarEvents {
  /** 选择不同项目后触发。 */
  changed?: (cview: TabBar, index: number) => void;
  /** 再次点击当前项目时触发。 */
  reselected?: (cview: TabBar, index: number) => void;
}

/** 图标 Cell 共用的内部属性。 */
interface TabBarCellProps extends Pick<TabBarItem, "symbol" | "image"> {
  /** Cell 对应的 Tab 索引。 */
  index: number;
  /** 选中状态颜色。 */
  selectedSegmentTintColor: UIColor;
  /** 未选中状态颜色。 */
  defaultSegmentTintColor: UIColor;
  /** 当前是否选中。 */
  selected?: boolean;
}

/** 同时显示图标和标题的内部 Cell 属性。 */
interface ImageLabelCellProps extends TabBarCellProps {
  /** 标题文本。 */
  text: string;
}

/** 内部 Cell 的点击事件。 */
interface TabBarCellEvents {
  /** 点击 Cell 时返回对应的 Tab 索引。 */
  tapped?: (index: number) => void;
}

/** 同时显示图标和标题的内部 TabBar 项目。 */
class ImageLabelCell extends Base<UIView, UiTypes.ViewOptions> {
  /** Cell 的图标、标题、索引和颜色属性。 */
  _props: ImageLabelCellProps;
  layouts: {
    image_tightened: (make: MASConstraintMaker, view: AllUIView) => void;
    label_tightened: (make: MASConstraintMaker, view: AllUIView) => void;
    image_loosed: (make: MASConstraintMaker, view: AllUIView) => void;
    label_loosed: (make: MASConstraintMaker, view: AllUIView) => void;
  };
  _defineView: () => UiTypes.ViewOptions;
  constructor({
    props,
    events = {},
  }: {
    /** Cell 的图标、标题、索引和颜色属性。 */
    props: ImageLabelCellProps;
    /** Cell 点击事件。 */
    events: TabBarCellEvents;
  }) {
    super();
    this._props = props;
    this.layouts = {
      image_tightened: (make, view) => {
        make.centerX.equalTo(view.super);
        make.size.equalTo($size(25, 25));
        make.top.inset(7);
      },
      label_tightened: (make, view) => {
        make.centerX.equalTo(view.super);
        make.top.equalTo(view.prev.bottom);
      },
      image_loosed: (make, view) => {
        make.centerX.equalTo(view.super).offset(-35);
        make.centerY.equalTo(view.super);
        make.size.equalTo($size(25, 25));
      },
      label_loosed: (make, view) => {
        make.left.equalTo(view.prev.right).inset(10);
        make.centerY.equalTo(view.super);
      },
    };
    this._defineView = () => {
      return {
        type: "view",
        props: {
          id: this.id,
          userInteractionEnabled: true,
        },
        views: [
          {
            type: "image",
            props: {
              id: "image",
              symbol: this._props.symbol,
              image: this._props.image,
              contentMode: 1,
            },
          },
          {
            type: "label",
            props: {
              id: "label",
              text: this._props.text,
              align: $align.center,
            },
          },
        ],
        events: {
          tapped: (sender) => {
            if (events.tapped) events.tapped(this._props.index);
          },
        },
      };
    };
  }

  set selected(selected) {
    this._props.selected = selected;
    const color = selected ? this._props.selectedSegmentTintColor : this._props.defaultSegmentTintColor;
    this.view.get("image").tintColor = color;
    const label = this.view.get("label") as UILabelView;
    label.textColor = color;
  }

  get selected() {
    return this._props.selected;
  }

  _useTightenedLayout() {
    this.view.get("image").remakeLayout(this.layouts.image_tightened);
    this.view.get("label").remakeLayout(this.layouts.label_tightened);
    const label = this.view.get("label") as UILabelView;
    label.font = $font(10);
  }

  _useLoosedLayout() {
    this.view.get("image").remakeLayout(this.layouts.image_loosed);
    this.view.get("label").remakeLayout(this.layouts.label_loosed);
    const label = this.view.get("label") as UILabelView;
    label.font = $font(14);
  }
}

/** 仅显示图标的内部 TabBar 项目。 */
class ImageCell extends Base<UIView, UiTypes.ViewOptions> {
  /** Cell 的图标、索引和颜色属性。 */
  _props: TabBarCellProps;
  layouts: {
    image_tightened: (make: MASConstraintMaker, view: AllUIView) => void;
    image_loosed: (make: MASConstraintMaker, view: AllUIView) => void;
  };
  _defineView: () => UiTypes.ViewOptions;
  constructor({
    props,
    events = {},
  }: {
    /** Cell 的图标、索引和颜色属性。 */
    props: TabBarCellProps;
    /** Cell 点击事件。 */
    events: TabBarCellEvents;
  }) {
    super();
    this._props = props;
    this.layouts = {
      image_tightened: (make, view) => {
        make.center.equalTo(view.super);
        make.size.equalTo($size(30, 30));
      },
      image_loosed: (make, view) => {
        make.center.equalTo(view.super);
        make.size.equalTo($size(30, 30));
      },
    };
    this._defineView = () => {
      return {
        type: "view",
        props: {
          id: this.id,
          userInteractionEnabled: true,
        },
        views: [
          {
            type: "image",
            props: {
              id: "image",
              symbol: this._props.symbol,
              image: this._props.image,
              contentMode: 1,
            },
          },
        ],
        events: {
          tapped: (sender) => {
            if (events.tapped) events.tapped(this._props.index);
          },
        },
      };
    };
  }

  set selected(selected) {
    this._props.selected = selected;
    const color = selected ? this._props.selectedSegmentTintColor : this._props.defaultSegmentTintColor;
    this.view.get("image").tintColor = color;
  }

  get selected() {
    return this._props.selected;
  }

  _useTightenedLayout() {
    this.view.get("image").remakeLayout(this.layouts.image_tightened);
  }

  _useLoosedLayout() {
    this.view.get("image").remakeLayout(this.layouts.image_loosed);
  }
}

/**
 * 固定在父视图底部并适配安全区域的 CView TabBar。
 *
 * 组件自行生成底部约束，不接受外部 `layout`。`height` 表示安全区域上方的内容高度，根视图还会覆盖底部安全区域。
 * 未设置 `bgcolor` 时使用样式为 `10` 的模糊背景，设置后改用纯色背景；顶部始终包含 `0.5` 点分隔线。
 *
 * 每个项目可提供 SF Symbol 或图片；存在 `title` 时显示图标和文本，否则只显示图标。窄于或等于 `600` 点时，
 * 图标和标题上下紧凑排列；更宽时改为水平宽松布局。点击不同项目会更新 `index` 并触发 `changed`；
 * 再次点击当前项目会触发 `reselected`。
 *
 * 程序化设置 `index` 只更新选择外观，不触发事件。`hide` 和 `show` 通过重建根视图约束折叠或恢复 TabBar。
 * 普通应用页面通常应使用负责子控制器生命周期的 `TabBarController`；本组件适合不需要控制器管理的自定义容器。
 * @example
 * ```ts
 * const tabBar = new TabBar({
 *   props: {
 *     items: [
 *       { symbol: "house", title: "首页" },
 *       { symbol: "gearshape", title: "设置" },
 *     ],
 *   },
 *   events: {
 *     changed: (_tabBar, index) => showPage(index),
 *     reselected: (_tabBar, index) => scrollPageToTop(index),
 *   },
 * });
 * ```
 */
export class TabBar extends Base<UIView | UIBlurView, UiTypes.ViewOptions | UiTypes.BlurOptions> {
  /** TabBar 尺寸、项目、选择颜色和背景配置。 */
  _props: Required<Omit<TabBarProps, "bgcolor">> & Pick<TabBarProps, "bgcolor">;
  /** 当前选中索引。 */
  _index: number;
  /** 与项目一一对应的内部 Cell。 */
  _cells: (ImageLabelCell | ImageCell)[];
  /** Tab 选择和重复点击事件。 */
  _events: TabBarEvents;
  /** 创建纯色或模糊背景的底部 TabBar 定义。 */
  _defineView: () => UiTypes.ViewOptions | UiTypes.BlurOptions;

  /** 创建自动固定在父视图底部的 TabBar。 */
  constructor({
    props,
    events = {},
  }: {
    /** TabBar 尺寸、项目、初始选择和外观配置。 */
    props: TabBarProps;
    /** Tab 选择和重复点击事件。 */
    events?: TabBarEvents;
  }) {
    super();
    this._props = {
      height: props.height ?? 50,
      items: props.items,
      index: props.index ?? 0,
      selectedSegmentTintColor: props.selectedSegmentTintColor ?? $color("systemLink"),
      defaultSegmentTintColor: props.defaultSegmentTintColor ?? footBarDefaultSegmentColor,
      bgcolor: props.bgcolor,
    };
    this._index = this._props.index;
    this._events = events;
    this._cells = this._defineCells();
    this._defineView = () => {
      const stack: UiTypes.StackOptions = {
        type: "stack",
        props: {
          axis: $stackViewAxis.horizontal,
          distribution: $stackViewDistribution.fillEqually,
          spacing: 0,
          stack: {
            views: this._cells.map((n) => n.definition),
          },
        },
        layout: (make, view) => {
          make.height.equalTo(this._props.height - 0.5);
          make.left.right.equalTo(view.super.safeArea);
          make.top.equalTo(view.prev.bottom);
        },
      };
      const line: UiTypes.ViewOptions = {
        type: "view",
        props: {
          bgcolor: $color("separatorColor"),
        },
        layout: (make, view) => {
          make.top.left.right.inset(0);
          make.height.equalTo(0.5);
        },
      };
      if (this._props.bgcolor) {
        return {
          type: "view",
          props: {
            id: this.id,
            bgcolor: this._props.bgcolor,
          },
          layout: (make, view) => {
            make.left.right.bottom.inset(0);
            make.top.equalTo(view.super.safeAreaBottom).inset(-this._props.height);
          },
          views: [line, stack],
          events: {
            ready: (sender) => (this.index = this._index),
            layoutSubviews: (sender) => {
              const windowWidth = sender.frame.width;
              if (windowWidth > 600) {
                this._useLoosedLayout();
              } else {
                this._useTightenedLayout();
              }
            },
          },
        };
      } else {
        return {
          type: "blur",
          props: {
            id: this.id,
            style: 10,
          },
          layout: (make, view) => {
            make.left.right.bottom.inset(0);
            make.top.equalTo(view.super.safeAreaBottom).inset(-this._props.height);
          },
          views: [line, stack],
          events: {
            ready: (sender) => (this.index = this._index),
            layoutSubviews: (sender) => {
              const windowWidth = sender.frame.width;
              if (windowWidth > 600) {
                this._useLoosedLayout();
              } else {
                this._useTightenedLayout();
              }
            },
          },
        };
      }
    };
  }

  /**
   * 根据项目是否有标题创建对应的内部 Cell。
   * @returns 与 `items` 顺序一致的 Cell 数组。
   */
  private _defineCells() {
    return this._props.items.map((n, i) => {
      if (n.title) {
        return new ImageLabelCell({
          props: {
            symbol: n.symbol,
            image: n.image ? n.image.alwaysTemplate : undefined,
            text: n.title,
            index: i,
            selectedSegmentTintColor: this._props.selectedSegmentTintColor,
            defaultSegmentTintColor: this._props.defaultSegmentTintColor,
          },
          events: {
            tapped: (index) => {
              if (index !== this.index) {
                this.index = index;
                if (this._events.changed) this._events.changed(this, index);
              } else {
                if (this._events.reselected) this._events.reselected(this, index);
              }
            },
          },
        });
      } else {
        return new ImageCell({
          props: {
            symbol: n.symbol,
            image: n.image ? n.image.alwaysTemplate : undefined,
            index: i,
            selectedSegmentTintColor: this._props.selectedSegmentTintColor,
            defaultSegmentTintColor: this._props.defaultSegmentTintColor,
          },
          events: {
            tapped: (index) => {
              if (index !== this.index) {
                this.index = index;
                if (this._events.changed) this._events.changed(this, index);
              } else {
                if (this._events.reselected) this._events.reselected(this, index);
              }
            },
          },
        });
      }
    });
  }

  /**
   * 获取当前选中索引。
   * @returns 当前选中项目索引。
   */
  get index() {
    return this._index;
  }

  /**
   * 更新选中索引和所有项目的颜色状态。
   *
   * 此操作不会触发 `changed`；调用方负责保证索引有效。
   * @param index - 新的选中项目索引。
   */
  set index(index) {
    this._index = index;
    this._cells.forEach((n, i) => {
      n.selected = i === this._index;
    });
  }

  /**
   * 将 TabBar 高度折叠为零。
   * @param animated - 是否播放 `0.3` 秒布局动画。
   */
  hide(animated = true) {
    this.view.remakeLayout((make, view) => {
      make.left.right.bottom.inset(0);
      make.height.equalTo(0);
    });
    if (animated) {
      $ui.animate({
        duration: 0.3,
        animation: () => this.view.relayout(),
      });
    }
  }

  /**
   * 恢复 TabBar 的安全区域和配置高度。
   * @param animated - 是否播放 `0.3` 秒布局动画。
   */
  show(animated = true) {
    this.view.remakeLayout((make, view) => {
      make.left.right.bottom.inset(0);
      make.top.equalTo(view.super.safeAreaBottom).inset(-this._props.height);
    });
    if (animated) {
      $ui.animate({
        duration: 0.3,
        animation: () => this.view.relayout(),
      });
    }
  }

  /** 将所有项目切换为窄屏紧凑布局。 */
  private _useTightenedLayout() {
    this._cells.forEach((n) => {
      n._useTightenedLayout();
    });
  }

  /** 将所有项目切换为宽屏宽松布局。 */
  private _useLoosedLayout() {
    this._cells.forEach((n) => {
      n._useLoosedLayout();
    });
  }
}
