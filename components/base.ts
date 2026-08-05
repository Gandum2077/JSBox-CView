import { cvid } from "../utils/cvid";

/**
 * CView 可复用视图组件的基类。
 *
 * 子类通过实现 `_defineView` 将 JSBox 视图定义与可延迟获取的视图实例绑定。
 * 根视图的 `props.id` 必须设置为组件的 `id`，才能通过 `view` 获取实例。
 * @template T - 根视图实例类型。
 * @template R - 根视图定义类型。
 */
export abstract class Base<T extends AllUIView, R extends UiTypes.AllViewOptions> {
  /** 根视图的全局唯一标识符。 */
  readonly id: string;
  private _view?: T;

  /**
   * 创建根视图定义。
   *
   * 子类必须将根视图的 `props.id` 设置为 `this.id`。
   * @returns 根视图定义。
   */
  protected abstract _defineView: () => R;

  /** 应用于根视图的可选 Masonry 布局函数。 */
  _layout?: (make: MASConstraintMaker, view: T) => void;

  /** 创建组件并分配全局唯一的 `id`。 */
  constructor() {
    this.id = cvid.newId;
  }

  /**
   * 获取新的根视图定义。
   * @returns `_defineView` 创建的根视图定义。
   */
  get definition() {
    const definition = this._defineView();

    return {
      ...definition,
      props: {
        ...definition.props,
        id: this.id,
      },
    } as R;
  }

  /**
   * 获取已加载的根视图实例。
   *
   * 首次访问时会通过 `id` 查询并缓存实例。调用前应确保视图定义已加入界面。
   * @returns 根视图实例。
   */
  get view() {
    if (!this._view) this._view = $(this.id) as T;
    return this._view;
  }

  /**
   * 将子视图添加到已加载的根视图。
   * @param view - CView 组件实例或 JSBox 视图定义。
   */
  add(view: UiTypes.AllViewOptions | Base<any, any>) {
    if (view instanceof Base) {
      this.view.add(view.definition);
    } else {
      this.view.add(view);
    }
  }
}
