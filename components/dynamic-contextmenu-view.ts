import { Base } from "./base";
import { cvid } from "../utils/cvid";

/** `DynamicContextMenuView` 支持的菜单项。 */
export interface DynamicContextMenuItem {
  /** 菜单项标题；只显示图标时可以省略。 */
  title?: string;
  /** SF Symbol 名称。 */
  symbol?: string;
  /** 是否使用表示危险操作的红色样式。 */
  destructive?: boolean;
  /**
   * 选择普通操作项后执行的回调。
   *
   * 子菜单由 `items` 决定；同时提供 `items` 和 `handler` 时，行为与 JSBox 一致，忽略 `handler`。
   */
  handler?: (sender: UIView) => void;
  /** 子菜单内容，可以任意层级嵌套。 */
  items?: DynamicContextMenuItem[];
  /** 是否把子菜单内容直接显示在父菜单中并用分隔线分组。 */
  inline?: boolean;
}

/** 每次打开 `DynamicContextMenuView` 时生成的菜单。 */
export interface DynamicContextMenu {
  /** 顶层菜单标题。 */
  title?: string;
  /** 顶层菜单项。 */
  items: DynamicContextMenuItem[];
}

/** `UIMenuOptions.displayInline`。 */
const UIMenuOptionDisplayInline = 1 << 0;
/** `UIMenuOptions.destructive`。 */
const UIMenuOptionDestructive = 1 << 1;
/** `UIMenuElementAttributes.destructive`。 */
const UIMenuElementAttributeDestructive = 1 << 1;

/** 已注册的 Objective-C 上下文菜单视图类名。 */
const RegisteredOCClassName: Set<string> = new Set();

/**
 * 在每次打开时动态生成完整 JSBox 上下文菜单内容的 Runtime UIView。
 *
 * 支持 JSBox 通用长按菜单公开的标题、SF Symbols、危险操作、多层子菜单和 inline 分组。`pullDown` 与
 * `asPrimary` 是 JSBox button/navButtons 的触发方式，不适用于通用 `UIView` 的
 * `UIContextMenuInteraction`，因此不属于本组件的配置。
 * @example
 * ```ts
 * const menuView = new DynamicContextMenuView({
 *   props: {},
 *   layout: $layout.fill,
 *   generateContextMenu: () => ({
 *     title: "操作",
 *     items: [
 *       {
 *         title: "分享",
 *         symbol: "square.and.arrow.up",
 *         handler: sender => share(sender),
 *       },
 *       {
 *         title: "更多",
 *         items: [
 *           { title: "复制", symbol: "doc.on.doc", handler: () => copy() },
 *           { title: "删除", symbol: "trash", destructive: true, handler: () => remove() },
 *         ],
 *       },
 *     ],
 *   }),
 * });
 * ```
 */
export class DynamicContextMenuView extends Base<UIView, UiTypes.RuntimeOptions> {
  /** 当前实例使用的 Objective-C UIView 类名。 */
  private readonly _ocClassName: string;
  /** 每次系统请求菜单时生成最新菜单内容的回调。 */
  private readonly _generateContextMenu: (sender: UIView) => DynamicContextMenu;

  /** 创建承载 Runtime UIView 的 JSBox 视图定义。 */
  protected _defineView: () => UiTypes.RuntimeOptions;

  /** 创建可动态生成原生上下文菜单的视图。 */
  constructor({
    generateContextMenu,
    props,
    layout,
    events,
    views,
  }: {
    /** 系统准备显示菜单时生成最新菜单内容。 */
    generateContextMenu: (sender: UIView) => DynamicContextMenu;
    /** Runtime 根视图属性。 */
    props: UiTypes.ViewProps;
    /** Runtime 根视图布局。 */
    layout?: (make: MASConstraintMaker, view: UIView) => void;
    /** Runtime 根视图事件。 */
    events?: UiTypes.BaseViewEvents<UIView>;
    /** Runtime 根视图的 JSBox 子视图。 */
    views?: UiTypes.AllViewOptions[];
  }) {
    super();
    this._ocClassName = `DynamicContextMenuView_${cvid.newId}`;
    this._generateContextMenu = generateContextMenu;
    this.defineOCClass();

    this._defineView = () => ({
      type: "runtime",
      props: {
        ...props,
        // A definition can be presented repeatedly (for example by Sheet). UIKit views cannot have two parents.
        view: this.createRuntimeView(),
      },
      layout,
      events,
      views,
    });
  }

  /** 注册当前实例所需的 Objective-C 上下文菜单视图类。 */
  private defineOCClass() {
    if (RegisteredOCClassName.has(this._ocClassName)) return;
    $define({
      type: `${this._ocClassName}: UIView <UIContextMenuInteractionDelegate>`,
      events: {
        "contextMenuInteraction:configurationForMenuAtLocation:": (interaction: any, _point: JBPoint) => {
          const sender = interaction.$view().jsValue() as UIView;
          return this.createContextMenuConfiguration(this._generateContextMenu(sender), sender);
        },
      },
    });
    RegisteredOCClassName.add(this._ocClassName);
  }

  /**
   * 将动态菜单数据转换为 UIKit 上下文菜单配置。
   * @param menu - 最新生成的菜单内容。
   * @param sender - 安装上下文菜单交互的源视图。
   * @returns `UIContextMenuConfiguration` Objective-C 对象。
   */
  private createContextMenuConfiguration(menu: DynamicContextMenu, sender: UIView) {
    return $objc("UIContextMenuConfiguration").$configurationWithIdentifier_previewProvider_actionProvider(
      null,
      null,
      $block("UIMenu *, NSArray *", () => this.createMenu(menu.title, menu.items, sender)),
    );
  }

  /**
   * 把一个菜单项列表递归转换为 `UIAction` 或 `UIMenu`。
   * @param items - 当前层级的菜单项。
   * @param sender - 安装上下文菜单交互的源视图。
   * @returns 可作为 `UIMenu` 子元素的 Objective-C 对象数组。
   */
  private createMenuElements(items: DynamicContextMenuItem[], sender: UIView): any[] {
    return items.map((item) => {
      if (item.items) return this.createSubmenu(item, sender);

      const action = $objc("UIAction").$actionWithTitle_image_identifier_handler(
        item.title ?? "",
        this.createSymbolImage(item.symbol),
        null,
        $block("void, UIAction *", () => item.handler?.(sender)),
      );
      if (item.destructive) action.$setAttributes(UIMenuElementAttributeDestructive);
      return action;
    });
  }

  /**
   * 创建顶层菜单。
   * @param title - 可选的顶层标题。
   * @param items - 顶层菜单项。
   * @param sender - 安装上下文菜单交互的源视图。
   * @returns UIKit `UIMenu` 对象。
   */
  private createMenu(title: string | undefined, items: DynamicContextMenuItem[], sender: UIView) {
    const children = this.createMenuElements(items, sender);
    return title
      ? $objc("UIMenu").$menuWithTitle_children(title, children)
      : $objc("UIMenu").$menuWithChildren(children);
  }

  /**
   * 创建带图标、inline 和 destructive 选项的子菜单。
   * @param item - 包含子项的菜单项。
   * @param sender - 安装上下文菜单交互的源视图。
   * @returns UIKit `UIMenu` 对象。
   */
  private createSubmenu(item: DynamicContextMenuItem, sender: UIView) {
    let options = 0;
    if (item.inline) options |= UIMenuOptionDisplayInline;
    if (item.destructive) options |= UIMenuOptionDestructive;

    return $objc("UIMenu").$menuWithTitle_image_identifier_options_children(
      item.title ?? "",
      this.createSymbolImage(item.symbol),
      null,
      options,
      this.createMenuElements(item.items ?? [], sender),
    );
  }

  /**
   * 将 JSBox 的 SF Symbol 名称转换为 UIKit 菜单需要的 `UIImage`。
   * @param symbol - 可选 SF Symbol 名称。
   * @returns UIKit `UIImage` 对象；没有名称时返回 `null`。
   */
  private createSymbolImage(symbol?: string) {
    return symbol ? $objc("UIImage").$systemImageNamed(symbol) : null;
  }

  /**
   * 创建并安装上下文菜单交互的 Runtime UIView。
   * @returns 已安装 `UIContextMenuInteraction` 的 Objective-C UIView。
   */
  private createRuntimeView() {
    const view = $objc(this._ocClassName).$new();
    const interaction = $objc("UIContextMenuInteraction").invoke("alloc").invoke("initWithDelegate", view);
    view.$addInteraction(interaction);
    return view;
  }
}
