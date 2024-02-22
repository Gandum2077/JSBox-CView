"use strict";
/**
 * # CView Base Controller
 *
 * Cview 控件尽量保持非侵入性和功能专注。而控制器负责控件之间的关联和数据更新。
 * 另外，控制器可以实现一些常用的页面构建形式，比如底部Tab分页，左侧滑动分页，弹出式页面等。
 *
 * ## 属性
 *
 * - id?: string 可以指定 id，如不指定，会自动赋值全局唯一 id
 * - 只写 bgcolor?: UIColor = $color("primarySurface") rootView 的 bgcolor
 * - 只读 cviews: {}
 * - 只读 rootView
 * - 只读 status
 *   - created = 0 被创建，未被加载
 *   - loaded = 1 被加载，显示状态未知
 *   - appearing = 2 处于可显示状态
 *   - disappearing = 3 处于不显示状态
 *   - removed = 4 根视图被移除
 *
 * ## 事件
 *
 * 5 个生命周期节点：创建、加载、显示、隐藏、销毁。后面四个具有生命周期事件。
 *
 * 创建阶段没有对应事件，此阶段适合为 rootView 添加子 view，不能涉及对 UIView 的任何操作，因为此时 rootView 还未加载。
 *
 * 生命周期事件：
 *
 * 1. didLoad: controller => void 在 rootView 被加载之后执行
 *    - 可以在 rootView 的 ready 事件中自动执行，也可以手动执行加快速度
 *    - 也可以在这个节点为 rootView 添加子 view
 *    - 这个节点可以对 UIView 进行操作了
 *    - 可以向 Model 层请求初始数据
 * 2. didAppear: controller => void 在 rootView 显现的时候执行
 *    - 向 Model 层请求刷新数据
 * 3. didDisappear: controller => void 在 rootView 不可见的时候执行
 *    - 如果是持续执行的刷新行为，可以在此处转为暂停
 * 4. didRemove: controller => void 在 rootView 被移除的时候执行
 *    - 应该在此节点释放自定义的 objc
 *    - 数据持久化
 *
 * ## 方法
 *
 * 加载方法：
 *
 * 1. uirender(props) 此方法只能使用一次，对应的 Controller 将成为顶级 Controller
 * 2. uipush(props)
 * 3. 直接让 rootView.definition 包含在其他 View 的 views 参数中
 *
 * 生命周期管理：
 *
 * 1. load() 会在 rootView 的 ready 事件中自动调用，也可以手动调用，以加速运行
 * 2. appear()
 * 3. disappear()
 * 4. remove() 用来移除 Router 中的当前 Controller，**请注意此方法和 rootView 的移除无关**，如果通过 uirender 和 uipush，可以在销毁时自动执行 remove()
 *
 * ## 其他
 *
 * - rootView 可以直接通过 rootView.views 设置其_views 属性，其中元素可以为 view 定义也可以为 cview
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseController = exports.ControllerRootView = void 0;
const base_1 = require("../components/base");
const single_views_1 = require("../components/single-views");
const cvid_1 = require("../utils/cvid");
const controller_router_1 = require("./controller-router");
/**
 * status
 *   - created = 0 被创建，未被加载
 *   - loaded = 1 被加载，显示状态未知
 *   - appeared= 2 处于可显示状态
 *   - disappeared = 3 处于不显示状态
 *   - removed = 4 根视图被移除
 * 其中只有 2 和 3 可以相互转化，其他不可以
 */
const controllerStatus = {
    created: 0,
    loaded: 1,
    appeared: 2,
    disappeared: 3,
    removed: 4
};
class ControllerRootView extends single_views_1.ContentView {
    constructor({ props, layout, events }) {
        super({ props, layout, events });
    }
    set views(views) {
        const _views = views.map(v => {
            if (v instanceof base_1.Base)
                return v.definition;
            return v;
        });
        this._views = _views;
    }
}
exports.ControllerRootView = ControllerRootView;
class BaseController {
    constructor({ props, layout = $layout.fill, events = {} } = {}) {
        this._props = props || {};
        this._events = events;
        this.id = this._props.id || cvid_1.cvid.newId;
        this._status = controllerStatus.created; // status使用额外的get来使其只读
        this.rootView = new ControllerRootView({
            props: {
                bgcolor: this._props.bgcolor || $color("primarySurface")
            },
            layout,
            events: {
                ready: sender => this.load()
            }
        });
        this.cviews = {};
    }
    load() {
        // 只有status为created才可以运行
        if (this._status !== controllerStatus.created)
            return;
        this._status = controllerStatus.loaded;
        if (this._events.didLoad)
            this._events.didLoad(this);
        controller_router_1.router.add(this);
    }
    appear() {
        // 只有status为loaded或者disappeared，才可以运行
        if (this._status !== controllerStatus.loaded &&
            this._status !== controllerStatus.disappeared)
            return;
        if (this._events.didAppear)
            this._events.didAppear(this);
        this._status = controllerStatus.appeared;
    }
    disappear() {
        // 只有status为loaded或者appeared，才可以运行
        if (this._status !== controllerStatus.loaded &&
            this._status !== controllerStatus.appeared)
            return;
        if (this._events.didDisappear)
            this._events.didDisappear(this);
        this._status = controllerStatus.disappeared;
    }
    // 此方法不能用于移除rootView，其作用是将控制器从Router中移除，并触发didRemove事件
    remove() {
        // 如果已经移除，不可以再次运行
        if (this._status === controllerStatus.removed)
            return;
        if (this._events.didRemove)
            this._events.didRemove(this);
        controller_router_1.router.delete(this);
        this._status = controllerStatus.removed;
    }
    uirender(props) {
        controller_router_1.router.root = this;
        $ui.render({
            props,
            views: [this.rootView.definition],
            events: {
                appeared: () => this.appear(),
                disappeared: () => this.disappear(),
                dealloc: () => this.remove()
            }
        });
    }
    uipush(props) {
        $ui.push({
            props,
            views: [this.rootView.definition],
            events: {
                appeared: () => this.appear(),
                disappeared: () => this.disappear(),
                dealloc: () => this.remove()
            }
        });
    }
    get status() {
        return this._status;
    }
}
exports.BaseController = BaseController;
