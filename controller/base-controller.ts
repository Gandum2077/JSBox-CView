import { Base } from "../components/base";
import { ContentView } from "../components/single-views";
import { cvid } from "../utils/cvid";
import { router } from "./controller-router";
import { controllerStatus } from "./controller-status";

/**
 * {@link BaseController} 使用的根内容视图。
 *
 * 除普通 JSBox 视图定义外，`views` 还可直接接收 CView 组件，并在生成根视图定义时转换为对应的 `definition`。
 * 应在根视图加载前设置 `views`；加载后添加内容请使用继承自 {@link Base.add} 的方法。
 */
export class ControllerRootView extends ContentView {
  /** 创建控制器根视图。 */
  constructor({
    props,
    layout,
    events,
  }: {
    /** 根视图属性。 */
    props: { bgcolor: UIColor };
    /** 根视图布局。 */
    layout: (make: MASConstraintMaker, view: UIView) => void;
    /** 根视图加载完成事件。 */
    events: { ready: (sender: UIView) => void };
  }) {
    super({ props, layout, events });
  }

  /**
   * 替换下一次生成根视图定义时包含的子视图。
   * @param views - JSBox 视图定义或 CView 组件列表。
   */
  set views(views: UiTypes.AllViewOptions[] | Base<any, any>[]) {
    const _views: UiTypes.AllViewOptions[] = views.map((v) => {
      if (v instanceof Base) return v.definition;
      return v;
    });
    this._views = _views;
  }
}

/** {@link BaseController} 的基础属性。 */
export interface BaseControllerProps {
  /** 控制器 ID；省略时自动生成全局唯一值。 */
  id?: string;
  /** 根视图背景色，默认为 `primarySurface`。 */
  bgcolor?: UIColor;
}

/** {@link BaseController} 的生命周期事件。 */
export interface BaseControllerEvents {
  /** 控制器首次加载时触发一次。 */
  didLoad?: (controller: BaseController) => void;
  /** 控制器进入可见状态时触发。 */
  didAppear?: (controller: BaseController) => void;
  /** 控制器离开可见状态时触发。 */
  didDisappear?: (controller: BaseController) => void;
  /** 控制器从路由器注销时触发一次。 */
  didRemove?: (controller: BaseController) => void;
}

/**
 * 负责页面组合、生命周期和路由登记的 CView 控制器基类。
 *
 * 控制器负责连接组件、加载数据和协调页面行为；可复用的局部视图行为仍应封装在 `Base` 组件中。构造阶段的状态为
 * `created`，适合创建 CView 并通过 {@link ControllerRootView.views} 组成页面，此时不要访问尚未加载的 UIView。
 * `cviews` 只是用于保存子组件的字典，不会自动把组件加入 {@link rootView}。
 *
 * 正常状态流转为 `created → loaded → appeared ⇄ disappeared → removed`：
 *
 * - 根视图的 `ready` 事件自动调用一次 {@link load}；`didLoad` 适合初始化依赖真实视图的内容和请求初始数据；
 * - {@link appear} 和 {@link disappear} 用于恢复或暂停只应在页面可见时运行的刷新、计时器和动画；
 * - {@link remove} 用于最终持久化、注销任务以及释放 Objective-C 对象、观察者等页面资源。
 *
 * {@link uirender} 和 {@link uipush} 会把 JSBox 页面事件自动映射到上述生命周期。若只把 `rootView.definition`
 * 嵌入其他容器，根视图仍会自动加载，但容器必须负责转发子控制器的显示、隐藏和最终移除事件。
 * `remove()` 只从控制器路由器注销实例并触发 `didRemove`，不会从界面层级移除 `rootView`。
 * @example
 * ```ts
 * const controller = new BaseController({
 *   props: { bgcolor: $color("primarySurface") },
 *   events: {
 *     didAppear: () => resumeUpdates(),
 *     didDisappear: () => pauseUpdates(),
 *     didRemove: () => releaseResources(),
 *   },
 * })
 *
 * controller.cviews.content = contentView
 * controller.rootView.views = [contentView]
 * controller.uirender({ navBarHidden: true })
 * ```
 */
export class BaseController {
  /** 控制器属性。 */
  protected _props: BaseControllerProps;
  /** 生命周期事件处理函数。 */
  protected _events: BaseControllerEvents;
  /** 控制器的全局唯一标识符。 */
  readonly id: string;
  /** 当前生命周期状态值。 */
  private _status: number;
  /**
   * 由控制器持有的子组件字典。
   *
   * 向字典赋值不会自动改变根视图层级。
   */
  cviews: {
    [key: string]: Base<any, any>;
  };
  /** 控制器用于组合页面内容的根视图。 */
  readonly rootView: ControllerRootView;

  /** 创建处于 `created` 状态的控制器和根视图。 */
  constructor({
    props,
    layout = $layout.fill,
    events = {},
  }: {
    /** 控制器 ID 和根视图外观。 */
    props?: BaseControllerProps;
    /** 根视图布局，默认为 `$layout.fill`。 */
    layout?: (make: MASConstraintMaker, view: UIView) => void;
    /** 控制器生命周期事件。 */
    events?: BaseControllerEvents;
  } = {}) {
    this._props = props || {};
    this._events = events;
    this.id = this._props.id || cvid.newId;

    this._status = controllerStatus.created; // status使用额外的get来使其只读
    this.rootView = new ControllerRootView({
      props: {
        bgcolor: this._props.bgcolor || $color("primarySurface"),
      },
      layout,
      events: {
        ready: (sender) => this.load(),
      },
    });
    this.cviews = {};
  }

  /**
   * 将控制器从 `created` 转为 `loaded`，触发 `didLoad` 并加入路由器。
   *
   * 根视图 `ready` 时会自动调用；后续重复调用不会产生效果。若在根视图 ready 前手动调用，`didLoad` 中不可假定
   * UIView 已经可用。
   */
  load() {
    // 只有status为created才可以运行
    if (this._status !== controllerStatus.created) return;
    this._status = controllerStatus.loaded;
    if (this._events.didLoad) this._events.didLoad(this);
    router.add(this);
  }

  /**
   * 将 `loaded` 或 `disappeared` 控制器转为 `appeared` 并触发 `didAppear`。
   *
   * 其他状态调用不会产生效果。
   */
  appear() {
    // 只有status为loaded或者disappeared，才可以运行
    if (this._status !== controllerStatus.loaded && this._status !== controllerStatus.disappeared) return;
    if (this._events.didAppear) this._events.didAppear(this);
    this._status = controllerStatus.appeared;
  }

  /**
   * 将 `loaded` 或 `appeared` 控制器转为 `disappeared` 并触发 `didDisappear`。
   *
   * 此阶段应暂停页面隐藏后不必继续的工作，但保留返回页面所需的资源。
   */
  disappear() {
    // 只有status为loaded或者appeared，才可以运行
    if (this._status !== controllerStatus.loaded && this._status !== controllerStatus.appeared) return;
    if (this._events.didDisappear) this._events.didDisappear(this);
    this._status = controllerStatus.disappeared;
  }

  /**
   * 触发 `didRemove`，从路由器注销控制器并将状态转为 `removed`。
   *
   * 此方法不会移除 {@link rootView}；重复调用不会产生效果。
   */
  remove() {
    // 如果已经移除，不可以再次运行
    if (this._status === controllerStatus.removed) return;
    if (this._events.didRemove) this._events.didRemove(this);
    router.delete(this);
    this._status = controllerStatus.removed;
  }

  /**
   * 将当前控制器设为路由根控制器，并通过 `$ui.render` 展示根视图。
   *
   * JSBox 的 `appeared`、`disappeared` 和 `dealloc` 页面事件会分别转发到控制器生命周期。
   * @param props - `$ui.render` 使用的根页面属性。
   */
  uirender(props: UiTypes.RootViewPrefs) {
    router.root = this;
    $ui.render({
      props,
      views: [this.rootView.definition],
      events: {
        appeared: () => this.appear(),
        disappeared: () => this.disappear(),
        dealloc: () => this.remove(),
      },
    });
  }

  /**
   * 通过 `$ui.push` 推入根视图。
   *
   * JSBox 的 `appeared`、`disappeared` 和 `dealloc` 页面事件会分别转发到控制器生命周期。
   * @param props - `$ui.push` 使用的根页面属性。
   */
  uipush(props: UiTypes.RootViewPrefs) {
    $ui.push({
      props,
      views: [this.rootView.definition],
      events: {
        appeared: () => this.appear(),
        disappeared: () => this.disappear(),
        dealloc: () => this.remove(),
      },
    });
  }

  /**
   * 获取当前生命周期状态。
   * @returns 当前状态值，对应 {@link controllerStatus} 中的常量。
   */
  get status() {
    return this._status;
  }
}
