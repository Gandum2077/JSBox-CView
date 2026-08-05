import { BaseController, BaseControllerProps, BaseControllerEvents } from "./base-controller";
import { PageViewer } from "../components/pageviewer";
import { PageViewerTitleBar } from "../components/pageviewer-titlebar";
import { CustomNavigationBar, NavigationBarProps } from "../components/custom-navigation-bar";
import { controllerStatus } from "./controller-status";

/** 水平分页控制器的页面、导航栏和初始选择配置。 */
export interface PageViewerControllerProps extends BaseControllerProps {
  /** 按显示顺序排列的子控制器与标题，至少包含一项。 */
  items: {
    /** 当前页面的子控制器。 */
    controller: BaseController;
    /** 显示在分页标题栏中的文本。 */
    title: string;
  }[];
  /**
   * 自定义导航栏属性。
   *
   * 不应设置 `title` 或 `titleView`，否则可能覆盖分页标题栏。
   */
  navBarProps?: Partial<NavigationBarProps>;
  /** 初始页面索引，默认为 `0`。 */
  index?: number;
}

/**
 * 组合分页标题导航栏和水平 PageViewer 的页面容器控制器。
 *
 * 每个 `item` 提供一个子控制器和对应标题。所有子控制器的根视图都会加入 PageViewer，因此会随视图创建完成
 * `load`；容器可见时只让当前页进入 `appeared`，页面切换时把生命周期转移到新页面，容器隐藏时则让所有子页面
 * `disappear`。
 *
 * 导航栏固定使用 {@link PageViewerTitleBar} 作为 `titleView`，下方 PageViewer 填充剩余区域。`navBarProps` 可配置
 * 返回按钮、两侧按钮、颜色和样式，但不应设置 `title` 或 `titleView`：`title` 在 CustomNavigationBar 中优先级更高，
 * 会使分页标题栏不可见。
 *
 * 用户滑动页面或点击标题时会同步标题栏动画和子控制器显隐。程序化设置 {@link index} 使用无动画页面切换，
 * 不会产生额外的控制器级 `changed` 事件。`items` 至少应包含一项，初始索引和后续索引都必须有效。
 *
 * 容器最终移除时不会自动调用子控制器的 `remove()`；如果子控制器持有需要最终释放的资源，应由应用的所有权层
 * 在本控制器 `didRemove` 时统一移除它们。
 * @example
 * ```ts
 * const controller = new PageViewerController({
 *   props: {
 *     items: [
 *       { controller: detailController, title: "详情" },
 *       { controller: commentsController, title: "评论" },
 *     ],
 *     navBarProps: { popButtonEnabled: true },
 *   },
 * })
 *
 * controller.uipush({ navBarHidden: true })
 * ```
 */
export class PageViewerController extends BaseController {
  /** 页面、导航栏和当前索引配置。 */
  protected _props: PageViewerControllerProps;

  /** 控制器组合的分页视图、标题栏和导航栏。 */
  cviews: {
    /** 承载所有子控制器根视图的水平分页组件。 */
    pageviewer: PageViewer;
    /** 与分页滚动进度联动的标题栏。 */
    titlebar: PageViewerTitleBar;
    /** 承载分页标题栏及页面操作的导航栏。 */
    navbar: CustomNavigationBar;
  };

  /** 创建分页控制器并连接页面、标题栏和子控制器生命周期。 */
  constructor({
    props,
    layout,
    events = {},
  }: {
    /** 页面列表、初始索引和导航栏配置。 */
    props: PageViewerControllerProps;
    /** 控制器根视图布局，默认为 `$layout.fill`。 */
    layout?: (make: MASConstraintMaker, view: UIView) => void;
    /** 容器控制器生命周期事件。 */
    events?: BaseControllerEvents;
  }) {
    super({
      props: {
        id: props.id,
        bgcolor: props.bgcolor,
      },
      layout,
      events: {
        didLoad: events.didLoad,
        didAppear: (controller) => {
          props.items[this.index].controller.appear();
          events.didAppear?.(controller);
        },
        didDisappear: (controller) => {
          props.items.forEach((item) => item.controller.disappear());
          events.didDisappear?.(controller);
        },
        didRemove: (controller) => {
          events.didRemove?.(controller);
        },
      },
    });
    this._props = props;
    this.cviews = {} as {
      pageviewer: PageViewer;
      titlebar: PageViewerTitleBar;
      navbar: CustomNavigationBar;
    };
    this.cviews.pageviewer = new PageViewer({
      props: {
        page: this._props.index || 0,
        cviews: this._props.items.map((n) => n.controller.rootView),
      },
      layout: (make, view) => {
        make.left.right.bottom.inset(0);
        make.top.equalTo(view.prev.bottom);
      },
      events: {
        floatPageChanged: (cview, floatPage) => {
          this.cviews.titlebar.floatedIndex = floatPage;
        },
        changed: (cview, page) => {
          this._props.index = page;
          if (this.status !== controllerStatus.appeared) return;
          this._props.items.forEach((item, i) => {
            if (i === page) {
              item.controller.appear();
            } else {
              item.controller.disappear();
            }
          });
        },
      },
    });
    this.cviews.titlebar = new PageViewerTitleBar({
      props: {
        items: this._props.items.map((n) => n.title),
        index: this._props.index ?? 0,
      },
      layout: $layout.fill,
      events: {
        changed: (cview, index) => this.cviews.pageviewer.scrollToPage(index),
      },
    });
    this.cviews.navbar = new CustomNavigationBar({
      props: {
        ...this._props.navBarProps,
        titleView: this.cviews.titlebar,
      },
    });
    this.rootView.views = [this.cviews.navbar, this.cviews.pageviewer];
  }

  /**
   * 获取当前页面索引。
   * @returns 当前页面索引，未设置时为 `0`。
   */
  get index() {
    return this._props.index || 0;
  }

  /**
   * 无动画切换页面，并在容器可见时同步子控制器生命周期。
   *
   * 此操作不会触发控制器级事件；调用方负责保证索引有效。
   * @param num - 目标页面索引。
   */
  set index(num) {
    this.cviews.titlebar.index = num;
    this.cviews.pageviewer.page = num;
    this._props.index = num;
  }
}
