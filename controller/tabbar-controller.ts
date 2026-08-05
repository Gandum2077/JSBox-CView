import { BaseController, BaseControllerProps, BaseControllerEvents } from "./base-controller";
import { ContentView } from "../components/single-views";
import { TabBar } from "../components/tabbar";
import { controllerStatus } from "./controller-status";

/** TabBarController 的页面项目和初始选择配置。 */
export interface TabBarControllerProps extends BaseControllerProps {
  /** 按 Tab 显示顺序排列的子页面，至少包含一项。 */
  items: {
    /** Tab 项目标题；存在时与图标一起显示。 */
    title?: string;
    /** Tab 项目的 SF Symbol 名称。 */
    symbol?: string;
    /** Tab 项目图片。 */
    image?: UIImage;
    /** 保留的项目级前景色字段；当前 TabBar 实现不会读取该值。 */
    tintColor?: UIColor;
    /** 当前页面包装视图的背景颜色。 */
    bgcolor?: UIColor;
    /** 当前 Tab 对应的子控制器。 */
    controller: BaseController;
  }[];
  /** 初始选中索引，默认为 `0`。 */
  index?: number;
}

/** TabBarController 的生命周期和 Tab 交互事件。 */
export interface TabBarControllerEvents extends BaseControllerEvents {
  /** 用户选择不同 Tab 后触发。 */
  changed?: (controller: TabBarController, index: number) => void;
  /** 用户再次点击当前 Tab 时触发。 */
  reselected?: (controller: TabBarController, index: number) => void;
}

/**
 * 使用底部 TabBar 在多个同级子控制器之间切换的页面容器。
 *
 * 所有子控制器的根视图会在构造时加入页面层级，因此会随视图创建完成 `load`，但只有当前页面会在容器显示时
 * `appear`。用户选择其他 Tab 后，原页面 `disappear`、新页面 `appear`，对应包装视图的 `hidden` 状态也会同步更新。
 * 容器隐藏时只暂停当前页面。
 *
 * 页面内容填满整个根视图，TabBar 作为后创建的兄弟视图覆盖在底部并自动适配安全区域。子页面如果不能被 TabBar
 * 遮挡，应在自身布局中预留相应空间。TabBar 会在宽度大于 `600` 点时使用横向宽松布局，否则使用上下紧凑布局。
 *
 * `changed` 只在用户选择不同项目时触发；`reselected` 表示再次点击当前项。程序化设置
 * {@link index} 不会触发这两个事件，但会立即调用新子控制器的 `appear()`，且不检查容器是否可见，因此运行期间
 * 应只在容器可见时切换；初始页面应通过构造参数设置。
 *
 * `items` 至少应包含一项，所有索引必须有效。容器最终移除时不会自动调用子控制器的 `remove()`；如果子页面拥有
 * 需要最终释放的资源，应由应用的所有权层统一清理。
 * @example
 * ```ts
 * const controller = new TabBarController({
 *   props: {
 *     items: [
 *       { controller: homeController, title: "首页", symbol: "house" },
 *       { controller: settingsController, title: "设置", symbol: "gearshape" },
 *     ],
 *   },
 *   events: {
 *     reselected: (_controller, index) => scrollPageToTop(index),
 *   },
 * })
 *
 * controller.uirender({ navBarHidden: true })
 * ```
 */
export class TabBarController extends BaseController {
  /** 子页面列表和当前索引配置。 */
  _props: TabBarControllerProps;

  /** 底部 TabBar 和页面内容容器。 */
  cviews: {
    /** 负责项目显示和点击事件的底部 TabBar。 */
    tabbar: TabBar;
    /** 填满根视图并承载全部页面包装视图的容器。 */
    pageContentView: ContentView;
  };

  /** 与子控制器一一对应、通过 `hidden` 切换的页面包装视图。 */
  pages: ContentView[];

  /** 创建 Tab 页面容器并连接选择事件与子控制器生命周期。 */
  constructor({
    props,
    layout,
    events = {},
  }: {
    /** Tab 项目和初始选中索引。 */
    props: TabBarControllerProps;
    /** 控制器根视图布局，默认为 `$layout.fill`。 */
    layout?: (make: MASConstraintMaker, view: UIView) => void;
    /** 容器生命周期和 Tab 交互事件。 */
    events?: TabBarControllerEvents;
  }) {
    super({
      props: {
        id: props.id,
        bgcolor: props.bgcolor,
      },
      layout,
      events: {
        ...events,
        didAppear: () => {
          this._props.items[this.index].controller.appear();
          events.didAppear?.(this);
        },
        didDisappear: () => {
          this._props.items[this.index].controller.disappear();
          events.didDisappear?.(this);
        },
      },
    });
    this._props = {
      items: props.items,
      index: props.index || 0,
    };
    this.cviews = {} as {
      tabbar: TabBar;
      pageContentView: ContentView;
    };
    this.cviews.tabbar = new TabBar({
      props: {
        items: this._props.items,
        index: this._props.index,
      },
      events: {
        changed: (cview, index) => {
          this.index = index;
          events.changed?.(this, index);
        },
        reselected: (cview, index) => {
          events.reselected?.(this, index);
        },
      },
    });

    this.pages = this._props.items.map((n, i) => {
      return new ContentView({
        props: {
          bgcolor: n.bgcolor || this._props.bgcolor,
          hidden: i !== this._props.index,
        },
        layout: $layout.fill,
        views: [n.controller.rootView.definition],
      });
    });
    this.cviews.pageContentView = new ContentView({
      props: {
        bgcolor: $color("clear"),
      },
      layout: $layout.fill,
      views: this.pages.map((n) => n.definition),
    });
    this.rootView.views = [this.cviews.pageContentView, this.cviews.tabbar];
  }

  /**
   * 切换当前页面并同步页面可见性、TabBar 外观和子控制器生命周期。
   *
   * 重复设置当前索引不会产生效果；程序化切换不触发 `changed`。此方法不检查容器可见性，调用方负责保证索引有效，
   * 并应在容器处于可见状态时使用。
   * @param num - 目标 Tab 索引。
   */
  set index(num) {
    if (this._props.index === num) return;
    this.cviews.tabbar.index = num;
    this.pages.forEach((n, i) => {
      n.view.hidden = i !== num;
    });
    this._props.index = num;
    this._props.items.find((item) => item.controller.status === controllerStatus.appeared)?.controller.disappear();
    this._props.items[num].controller.appear();
  }

  /**
   * 获取当前 Tab 索引。
   * @returns 当前索引，未设置时为 `0`。
   */
  get index() {
    return this._props.index || 0;
  }
}
