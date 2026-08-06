import { Base } from "./base";
import { cvid } from "../utils/cvid";

/** 动态上下文菜单中的一个操作项。 */
type MenuItem = {
  /** 操作标题。 */
  title: string;
  /** 可选 SF Symbol 名称。 */
  symbol?: string;
  /** 选择操作后执行的回调。 */
  handler: () => void;
  /** 是否使用破坏性操作样式。 */
  destructive?: boolean;
};

/** 已注册的 Objective-C 上下文菜单视图类名。 */
const RegisteredOCClassName: Set<string> = new Set();

/**
 * 在菜单打开时动态生成操作项的原生上下文菜单视图。
 *
 * 组件通过 Objective-C Runtime 创建实现 `UIContextMenuInteractionDelegate` 的 UIView，并在每次系统请求菜单时
 * 调用 `generateContextMenu`。这适合菜单内容依赖当前状态、无法使用静态 JSBox `menu` 属性的场景。
 * @example
 * ```ts
 * const menuView = new DynamicContextMenuView({
 *   props: {},
 *   layout: $layout.fill,
 *   generateContextMenu: () => ({
 *     items: [{ title: "删除", destructive: true, handler: () => removeItem() }],
 *   }),
 * });
 * ```
 */
export class DynamicContextMenuView extends Base<UIView, UiTypes.RuntimeOptions> {
  /** 每次打开菜单时生成标题和操作项的回调。 */
  private _generateContextMenu: (sender: UIView) => {
    /** 可选菜单标题。 */
    title?: string;
    /** 当前菜单操作项。 */
    items: MenuItem[];
  };
  /** 当前实例使用的 Objective-C UIView 类名。 */
  private _ocClassName: string;
  /** 创建承载 Runtime UIView 的 JSBox 视图定义。 */
  _defineView: () => UiTypes.RuntimeOptions;

  /** 创建可动态生成原生上下文菜单的视图。 */
  constructor({
    generateContextMenu,
    props,
    layout,
    events,
    views,
  }: {
    /** 系统请求菜单时生成最新菜单内容。 */
    generateContextMenu: (sender: UIView) => {
      /** 可选菜单标题。 */
      title?: string;
      /** 当前菜单操作项。 */
      items: MenuItem[];
    };
    /** Runtime 根视图属性。 */
    props: UiTypes.ViewProps;
    /** Runtime 根视图布局。 */
    layout?: (make: MASConstraintMaker, view: UIView) => void;
    /** Runtime 根视图事件。 */
    events?: UiTypes.BaseViewEvents;
    /** Runtime 根视图的 JSBox 子视图。 */
    views?: UiTypes.AllViewOptions[];
  }) {
    super();
    this._ocClassName = `DynamicContextMenuView_${cvid.newId}`;
    this._generateContextMenu = generateContextMenu;
    const runtimeView = this.createRuntimeView();
    this._defineView = () => {
      return {
        type: "runtime",
        props: {
          ...props,
          view: runtimeView,
        },
        layout,
        events,
        views,
      };
    };
  }

  /** 注册当前实例所需的 Objective-C 上下文菜单视图类。 */
  private defineOCClass() {
    if (RegisteredOCClassName.has(this._ocClassName)) return;
    RegisteredOCClassName.add(this._ocClassName);
    $define({
      type: this._ocClassName + " : UIView <UIContextMenuInteractionDelegate>",
      events: {
        "contextMenuInteraction:configurationForMenuAtLocation:": (interacton: any, point: JBPoint) => {
          const view = interacton.$view().jsValue() as UIView;
          const menu = this._generateContextMenu(view);
          return this.createContextMenuConfiguration(menu);
        },
      },
    });
  }

  /**
   * 将菜单数据转换为 UIKit 上下文菜单配置。
   * @param menu - 菜单标题和操作项。
   * @returns `UIContextMenuConfiguration` Objective-C 对象。
   */
  private createContextMenuConfiguration({ title, items }: { title?: string; items: MenuItem[] }) {
    return $objc("UIContextMenuConfiguration").$configurationWithIdentifier_previewProvider_actionProvider(
      null,
      null,
      $block("UIMenu *, NSArray *", () => {
        const actions = items.map((item) => {
          const action = $objc("UIAction").$actionWithTitle_image_identifier_handler(
            item.title,
            item.symbol || null,
            null,
            $block("void, UIAction *", () => item.handler()),
          );
          if (item.destructive) action.$setAttributes(1 << 1);
          return action;
        });
        return title
          ? $objc("UIMenu").$menuWithTitle_children(title, actions)
          : $objc("UIMenu").$menuWithChildren(actions);
      }),
    );
  }

  /**
   * 创建并安装上下文菜单交互的 Runtime UIView。
   * @returns 已配置 `UIContextMenuInteraction` 的 Objective-C UIView。
   */
  private createRuntimeView() {
    this.defineOCClass();
    const view = $objc(this._ocClassName).invoke("alloc.init");
    const interaction = $objc("UIContextMenuInteraction").invoke("alloc").invoke("initWithDelegate", view);
    view.$addInteraction(interaction);
    return view;
  }
}
