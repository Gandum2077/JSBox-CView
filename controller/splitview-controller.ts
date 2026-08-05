import { BaseController, BaseControllerProps, BaseControllerEvents } from "./base-controller";
import { Base } from "../components/base";
import { ContentView } from "../components/single-views";
import { cvid } from "../utils/cvid";
import { controllerStatus } from "./controller-status";

/**
 * SplitViewController 内部使用的滑出式侧栏容器。
 *
 * 隐藏状态下右边缘贴合父视图左边缘，显示状态下左边缘贴合父视图左边缘。显示宽度取父视图的 40%，
 * 并限制在 `250` 到 `350` 点之间；状态切换通过 `remakeLayout` 和动画完成。右侧分隔线始终保持在最上层。
 */
class SecondaryView extends Base<UIView, UiTypes.ViewOptions> {
  /** 侧栏根视图属性。 */
  _props: UiTypes.ViewProps;

  /** 侧栏隐藏和显示状态使用的完整约束集合。 */
  _layouts: {
    /** 将侧栏移到父视图左侧之外的布局。 */
    hidden: (make: MASConstraintMaker, view: AllUIView) => void;
    /** 将侧栏贴合父视图左侧的布局。 */
    shown: (make: MASConstraintMaker, view: AllUIView) => void;
  };

  /** 侧栏右边缘的分隔线。 */
  line: ContentView;

  /** 创建包含内容和分隔线的侧栏视图定义。 */
  _defineView: () => UiTypes.ViewOptions;

  /** 创建滑出式侧栏容器。 */
  constructor({
    props,
    layout,
    views = [],
  }: {
    /** 侧栏根视图属性。 */
    props?: UiTypes.ViewProps;
    /** 初始布局；SplitViewController 使用屏幕左侧之外的隐藏布局。 */
    layout?: (make: MASConstraintMaker, view: UIView) => void;
    /** 侧栏内容视图定义。 */
    views?: UiTypes.AllViewOptions[];
  }) {
    super();
    this._props = {
      ...props,
      bgcolor: props?.bgcolor ?? $color("groupedBackground", "secondarySurface"),
    };
    this._layouts = {
      hidden: (make, view) => {
        make.top.bottom.inset(0);
        make.right.equalTo(view.super.left);
        make.width.greaterThanOrEqualTo(250);
        make.width.lessThanOrEqualTo(350);
        make.width.equalTo(view.super).dividedBy(2.5).priority(999);
      },
      shown: (make, view) => {
        make.top.bottom.inset(0);
        make.left.equalTo(view.super.left);
        make.width.greaterThanOrEqualTo(250);
        make.width.lessThanOrEqualTo(350);
        make.width.equalTo(view.super).dividedBy(2.5).priority(999);
      },
    };
    this.line = new ContentView({
      props: {
        bgcolor: $color("separatorColor"),
      },
      layout: (make, view) => {
        make.top.bottom.right.inset(0);
        make.width.equalTo(0.5);
      },
    });
    this._defineView = () => {
      return {
        type: "view",
        props: {
          ...this._props,
          id: this.id,
        },
        layout,
        views: [...views, this.line.definition],
      };
    };
  }

  /**
   * 向已加载的侧栏添加内容，并重新把分隔线移到最上层。
   * @param view - CView 组件或 JSBox 视图定义。
   */
  add(view: UiTypes.AllViewOptions | Base<any, any>) {
    super.add(view);
    this.line.view.moveToFront();
  }

  /** 使用显示状态约束把侧栏滑入父视图。 */
  show() {
    this.view.remakeLayout(this._layouts.shown);
    $ui.animate({
      duration: 0.3,
      animation: () => this.view.relayout(),
    });
  }

  /** 使用隐藏状态约束把侧栏滑到父视图左侧之外。 */
  hide() {
    this.view.remakeLayout(this._layouts.hidden);
    $ui.animate({
      duration: 0.3,
      animation: () => this.view.relayout(),
    });
  }
}

/**
 * SplitViewController 内部用于拦截主页面交互的遮罩。
 *
 * 遮罩显示时通过点击或向左轻扫请求关闭侧栏。手势 target 是手动保留的 Objective-C 对象，拥有者必须在控制器
 * 最终移除时调用一次 {@link releaseGestureObject}。
 */
class MaskView extends Base<UIView, UiTypes.ViewOptions> {
  /** 遮罩颜色和关闭处理函数。 */
  _props: {
    /** 遮罩背景颜色。 */
    bgcolor: UIColor;
    /** 点击或轻扫遮罩时执行的关闭处理函数。 */
    dismissHandler?: () => void;
  };

  /** 遮罩当前是否处于显示状态。 */
  _shown: boolean;

  /** 检查显示状态后转发关闭请求的手势回调。 */
  _dismissEvent: () => void;

  /** 被点击和轻扫手势持有的 Objective-C target。 */
  _gestureObject: any;

  /** 创建默认隐藏的遮罩视图定义。 */
  _defineView: () => UiTypes.ViewOptions;

  /** 创建支持点击和左滑关闭的遮罩视图。 */
  constructor({
    props,
    layout = $layout.fill,
  }: {
    /** 遮罩颜色和关闭处理函数。 */
    props: {
      /** 遮罩背景颜色，默认为透明。 */
      bgcolor?: UIColor;
      /** 点击或左滑遮罩时执行的处理函数。 */
      dismissHandler?: () => void;
    };
    /** 遮罩根视图布局，默认为 `$layout.fill`。 */
    layout?: (make: MASConstraintMaker, view: UIView) => void;
  }) {
    super();
    this._props = { ...props, bgcolor: props.bgcolor ?? $color("clear") };
    this._shown = false;
    this._dismissEvent = () => {
      if (!this._shown) return;
      if (this._props.dismissHandler) this._props.dismissHandler();
    };
    this._defineView = () => {
      return {
        type: "view",
        props: {
          ...this._props,
          hidden: true,
          id: this.id,
        },
        layout,
        events: {
          ready: (sender) => this._addGesture(sender, this._dismissEvent),
        },
      };
    };
  }

  /**
   * 创建并安装点击、左滑手势及其 Objective-C target。
   * @param view - 安装手势的遮罩视图。
   * @param event - 两种手势共用的回调。
   */
  _addGesture(view: UIView, event: () => void) {
    const objectId = cvid.newId;
    $define({
      type: objectId + ": NSObject",
      events: {
        swipeEvent: event,
        tapEvent: event,
      },
    });
    const object = $objc(objectId).$new();
    $objc_retain(object); // 此步骤是必须的，否则将很快被系统释放掉，
    // 但是必须在关闭时手动释放掉，否则再次启动可能会有问题
    this._gestureObject = object;
    const swipeGestureRecognizer = $objc("UISwipeGestureRecognizer")
      .$alloc()
      .$initWithTarget_action(object, "swipeEvent");
    swipeGestureRecognizer.$setDirection(1 << 1); // 从右向左划动
    const tapGestureRecognizer = $objc("UITapGestureRecognizer").$alloc().$initWithTarget_action(object, "tapEvent");
    view.ocValue().$addGestureRecognizer(tapGestureRecognizer);
    view.ocValue().$addGestureRecognizer(swipeGestureRecognizer);
  }

  /**
   * 释放手动保留的 Objective-C 手势 target。
   *
   * 应在遮罩完成 ready 后由拥有者最终清理时调用一次。
   */
  releaseGestureObject() {
    if (this._gestureObject) $objc_release(this._gestureObject);
  }

  /** 将遮罩移动到最上层并允许其接收关闭手势。 */
  show() {
    this._shown = true;
    this.view.moveToFront();
    this.view.hidden = false;
  }

  /** 隐藏遮罩并停止转发关闭手势。 */
  hide() {
    this._shown = false;
    this.view.hidden = true;
  }
}

/** SplitViewController 的主页面和侧栏配置。 */
export interface SplitViewControllerProps extends BaseControllerProps {
  /**
   * 主页面和侧栏配置，必须按顺序提供两项。
   *
   * 第一项作为主页面，第二项作为侧栏；额外项目不会被使用。
   */
  items: {
    /** 当前区域显示的子控制器。 */
    controller: BaseController;
    /** 当前区域容器的背景颜色。 */
    bgcolor: UIColor;
  }[];
}

/**
 * 组合主页面和左侧滑出栏的双区域控制器。
 *
 * `items` 必须按顺序包含两个子控制器：第一项填充主页面，第二项显示在左侧栏。侧栏打开时宽度为父视图的 40%，
 * 并限制在 `250` 到 `350` 点之间；主页面随侧栏向右移动，页面上的遮罩会拦截交互，点击或左滑遮罩即可关闭。
 *
 * 控制器加载后会移除 `$ui.controller.view` 第一个手势识别器的原有 target/action，并在自身根视图安装新的左边缘
 * 轻扫手势，因此主要设计为应用根控制器。{@link uirender} 和 {@link uipush} 都会强制隐藏系统导航栏并使用默认
 * 状态栏样式；不要在需要保留原生边缘返回手势的页面中使用本容器。
 *
 * 当容器出现时，只有当前显示区域的子控制器进入 `appeared`；打开或关闭侧栏会在两个子控制器之间转移生命周期，
 * 容器隐藏时二者都会 `disappear`。{@link canShowSidebar} 只控制边缘手势能否打开侧栏，程序化设置
 * {@link sideBarShown} 仍然有效。
 *
 * 控制器最终移除时会释放自身保留的 Objective-C 手势对象，但不会自动调用两个子控制器的 `remove()`；子控制器
 * 拥有最终清理资源时，应由应用的所有权层统一移除。
 * @example
 * ```ts
 * const splitController = new SplitViewController({
 *   props: {
 *     items: [
 *       { controller: contentController, bgcolor: $color("primarySurface") },
 *       { controller: sidebarController, bgcolor: $color("secondarySurface") },
 *     ],
 *   },
 * })
 *
 * splitController.uirender()
 * ```
 */
export class SplitViewController extends BaseController {
  /** 左边缘轻扫手势手动保留的 Objective-C target。 */
  private _screenEdgePanGestureObject: any;
  /** 侧栏当前是否显示。 */
  private _sideBarShown: boolean;
  /** 左边缘手势当前是否可以打开侧栏。 */
  private _canShowSidebar: boolean;
  /** 主页面子控制器。 */
  private _primaryController: BaseController;
  /** 侧栏子控制器。 */
  private _secondaryController: BaseController;

  /** 主页面、侧栏和交互遮罩组件。 */
  cviews: {
    /** 随侧栏移动的主页面容器。 */
    primaryView: ContentView;
    /** 从左侧滑入或滑出的侧栏容器。 */
    secondaryView: SecondaryView;
    /** 侧栏显示时覆盖主页面的手势遮罩。 */
    maskView: MaskView;
  };

  /** 创建双区域页面并配置侧栏手势和子控制器生命周期。 */
  constructor({
    props,
    layout,
    events,
  }: {
    /** 主页面和侧栏配置；`items` 必须至少包含两项。 */
    props: SplitViewControllerProps;
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
        ...events,
        didAppear: (sender) => {
          if (this._sideBarShown) {
            this._secondaryController.appear();
          } else {
            this._primaryController.appear();
          }
          events?.didAppear?.(this);
        },
        didDisappear: () => {
          this._primaryController.disappear();
          this._secondaryController.disappear();
          events?.didDisappear?.(this);
        },
      },
    });
    this._sideBarShown = false;
    this._canShowSidebar = true;
    this._primaryController = props.items[0].controller;
    this._secondaryController = props.items[1].controller;
    this.cviews = {} as {
      primaryView: ContentView;
      secondaryView: SecondaryView;
      maskView: MaskView;
    };
    this.cviews.secondaryView = new SecondaryView({
      props: {
        bgcolor: props.items[1].bgcolor || $color("clear"),
      },
      layout: (make, view) => {
        make.top.bottom.inset(0);
        make.right.equalTo(view.super.left);
        make.width.equalTo(view.super).dividedBy(3);
      },
      views: [props.items[1].controller.rootView.definition],
    });
    this.cviews.maskView = new MaskView({
      props: {
        dismissHandler: () => (this.sideBarShown = false),
      },
    });
    this.cviews.primaryView = new ContentView({
      props: {
        bgcolor: props.items[0].bgcolor || $color("clear"),
      },
      layout: (make, view) => {
        make.top.bottom.inset(0);
        make.left.equalTo(view.prev.right);
        make.width.equalTo(view.super);
      },
      views: [props.items[0].controller.rootView.definition, this.cviews.maskView.definition],
    });
    this._screenEdgePanGestureObject = this._defineGestureObject(() => {
      if (!this.sideBarShown && this._canShowSidebar) this.sideBarShown = true;
    });
    this.rootView.views = [this.cviews.secondaryView, this.cviews.primaryView];
  }

  /**
   * 加载控制器并用自定义手势替换 JSBox 原有的屏幕边缘手势。
   *
   * 通常应由根视图 `ready` 自动调用；在视图尚未加载时手动调用会访问不可用的 UIKit 视图。
   */
  load() {
    if (this.status !== controllerStatus.created) return;
    super.load();
    this._renewScreenEdgePanGesture();
  }

  /**
   * 释放侧栏相关的 Objective-C 手势对象并结束控制器生命周期。
   *
   * 此操作不会移除主页面和侧栏的子控制器；重复调用不会产生效果。
   */
  remove() {
    if (this.status === controllerStatus.removed) return;
    $objc_release(this._screenEdgePanGestureObject);
    this.cviews.maskView.releaseGestureObject();
    super.remove();
  }

  /** 使用隐藏系统导航栏的固定页面配置渲染根控制器。 */
  uirender() {
    const props: UiTypes.RootViewPrefs = {
      navBarHidden: true,
      statusBarStyle: 0,
    };
    super.uirender(props);
  }

  /** 使用隐藏系统导航栏的固定页面配置推入控制器。 */
  uipush() {
    const props: UiTypes.RootViewPrefs = {
      navBarHidden: true,
      statusBarStyle: 0,
    };
    super.uipush(props);
  }

  /**
   * 创建并手动保留左边缘轻扫手势使用的 Objective-C target。
   * @param event - 边缘手势触发时执行的回调。
   * @returns 已通过 `$objc_retain` 保留的 Objective-C 对象。
   */
  _defineGestureObject(event: () => void) {
    const objectId = cvid.newId;
    $define({
      type: objectId + ": NSObject",
      events: {
        screenEdgePanEvent: event,
      },
    });
    const object = $objc(objectId).$new();
    $objc_retain(object);
    return object;
  }

  /**
   * 移除 `$ui.controller.view` 第一个手势识别器的 target，并为根视图安装新的左边缘轻扫手势。
   *
   * 调用前要求控制器和根视图已经加载。
   */
  _renewScreenEdgePanGesture() {
    const UIScreenEdgePanGestureRecognizer = $ui.controller.view.ocValue().$gestureRecognizers().$firstObject();

    UIScreenEdgePanGestureRecognizer.invoke("removeTarget:action:", null, null);
    const NewUIScreenEdgePanGestureRecognizer = $objc("UIScreenEdgePanGestureRecognizer")
      .$alloc()
      .$initWithTarget_action(this._screenEdgePanGestureObject, "screenEdgePanEvent");
    NewUIScreenEdgePanGestureRecognizer.$setEdges(1 << 1);
    this.rootView.view.ocValue().$addGestureRecognizer(NewUIScreenEdgePanGestureRecognizer);
  }

  /** 显示侧栏和主页面交互遮罩。 */
  _showSideBar() {
    this.cviews.secondaryView.show();
    this.cviews.maskView.show();
  }

  /** 隐藏侧栏和主页面交互遮罩。 */
  _hideSideBar() {
    this.cviews.secondaryView.hide();
    this.cviews.maskView.hide();
  }

  /**
   * 获取侧栏显示状态。
   * @returns 侧栏当前是否显示。
   */
  get sideBarShown() {
    return this._sideBarShown;
  }

  /**
   * 打开或关闭侧栏，并在主页面、侧栏子控制器之间转移可见生命周期。
   *
   * 此属性不受 {@link canShowSidebar} 限制，并会立即访问已加载视图；通常只应在容器可见且完成加载后设置。
   * @param bool - `true` 显示侧栏，`false` 隐藏侧栏。
   */
  set sideBarShown(bool: boolean) {
    if (this._sideBarShown === bool) return;
    if (bool) {
      this._showSideBar();
    } else {
      this._hideSideBar();
    }
    this._sideBarShown = bool;
    if (bool) {
      this._primaryController.disappear();
      this._secondaryController.appear();
    } else {
      this._primaryController.appear();
      this._secondaryController.disappear();
    }
  }

  /**
   * 获取边缘手势是否可以打开侧栏。
   * @returns 边缘手势可用时为 `true`。
   */
  get canShowSidebar() {
    return this._canShowSidebar;
  }

  /**
   * 启用或禁用左边缘手势打开侧栏。
   *
   * 此设置不会关闭已经显示的侧栏，也不限制程序化设置 {@link sideBarShown}。
   * @param bool - 是否允许边缘手势打开侧栏。
   */
  set canShowSidebar(bool: boolean) {
    this._canShowSidebar = bool;
  }
}
