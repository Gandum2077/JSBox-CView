import { Base } from "./base";
import { cvid } from "../utils/cvid";

/** 每次请求菜单时同步读取当前位置的数据；返回 null/undefined 可禁用该项菜单。 */
export type ContextMenuEvent<T extends UIListView | UIMatrixView> = (
  sender: T,
  indexPath: NSIndexPath,
  data: any,
) => UiTypes.ContextMenuOptions<T> | null | undefined;

/** 原生 List 事件，加上大小写敏感的动态 ContextMenu 事件。 */
export interface DynamicContextMenuListEvents extends UiTypes.ListEvents {
  ContextMenu: ContextMenuEvent<UIListView>;
}

/** 原生 Matrix 事件，加上大小写敏感的动态 ContextMenu 事件。 */
export interface DynamicContextMenuMatrixEvents extends UiTypes.MatrixEvents {
  ContextMenu: ContextMenuEvent<UIMatrixView>;
}

/** 动态菜单接管 props.menu；其余配置保持原生 List 语义。 */
export interface DynamicContextMenuListOptions extends Omit<UiTypes.ListOptions, "type" | "props" | "events"> {
  props: Omit<UiTypes.ListProps, "menu">;
  events: DynamicContextMenuListEvents;
}

/** 动态菜单接管 props.menu；其余配置保持原生 Matrix 语义。 */
export interface DynamicContextMenuMatrixOptions extends Omit<UiTypes.MatrixOptions, "type" | "props" | "events"> {
  props: Omit<UiTypes.MatrixProps, "menu">;
  events: DynamicContextMenuMatrixEvents;
}

/**
 * 将递归菜单转换为 UIKit 元素，并保留本次请求的 indexPath。
 * @param items - 当前层级的菜单项。
 * @param sender - 原生源视图。
 * @param indexPath - 本次菜单请求的位置。
 * @returns UIKit 菜单元素。
 */
function menuElements<T extends UIListView | UIMatrixView>(
  items: UiTypes.ContextMenuSubItem<T>[],
  sender: T,
  indexPath: NSIndexPath,
): any[] {
  return items.map((item) => {
    const image = item.symbol ? $objc("UIImage").$systemImageNamed(item.symbol) : null;
    if (item.items) {
      return $objc("UIMenu").$menuWithTitle_image_identifier_options_children(
        item.title ?? "",
        image,
        null,
        (item.inline ? 1 : 0) | (item.destructive ? 2 : 0),
        menuElements(item.items, sender, indexPath),
      );
    }
    const action = $objc("UIAction").$actionWithTitle_image_identifier_handler(
      item.title ?? "",
      image,
      null,
      $block("void, UIAction *", () => item.handler?.(sender, indexPath)),
    );
    if (item.destructive) action.$setAttributes(2);
    return action;
  });
}

/**
 * 为原生视图添加独立菜单交互，不替换 JSBox 的 delegate/dataSource。
 * @param sender - 已加载的原生源视图。
 * @param kind - 原生视图类型。
 * @param event - 同步菜单生成回调。
 * @returns 移除交互并释放其 delegate 的幂等清理函数。
 */
function installMenu<T extends UIListView | UIMatrixView>(
  sender: T,
  kind: "list" | "matrix",
  event: ContextMenuEvent<T>,
) {
  const native = sender.ocValue();
  const expectedClass = kind === "list" ? "UITableView" : "UICollectionView";
  if (!native.$isKindOfClass($objc(expectedClass).$class())) {
    throw new Error(`DynamicContextMenu: expected ${expectedClass} from sender.ocValue()`);
  }
  // Registered classes outlive instances. Disposal clears the callbacks and view references.
  let state: { sender: T; event: ContextMenuEvent<T> } | undefined = {
    sender,
    event,
  };
  const className = `CViewContextMenuInteraction_${cvid.newId}`;
  const configuration = (interaction: any, point: JBPoint) => {
    if (!state) return null;
    const { sender, event } = state;
    const view = interaction.$view();
    const path = kind === "list" ? view.$indexPathForRowAtPoint(point) : view.$indexPathForItemAtPoint(point);
    // Headers, footers, inter-item gaps and empty data do not have an index path.
    if (!path) return null;
    const indexPath = $indexPath(path.$section(), path.$row());
    const menu = event(sender, indexPath, sender.object(indexPath));
    if (!menu || menu.items.length === 0) return null;
    if (menu.pullDown || menu.asPrimary) throw new Error("List/Matrix context menus do not support pullDown/asPrimary");
    return $objc("UIContextMenuConfiguration").$configurationWithIdentifier_previewProvider_actionProvider(
      path,
      null,
      $block("UIMenu *, NSArray *", () => {
        if (!state) return null;
        return $objc("UIMenu").$menuWithTitle_children(menu.title ?? "", menuElements(menu.items, sender, indexPath));
      }),
    );
  };
  const preview = (interaction: any, configuration: any) => {
    if (!state) return null;
    const view = interaction.$view();
    const path = configuration.$identifier();
    const cell = kind === "list" ? view.$cellForRowAtIndexPath(path) : view.$cellForItemAtIndexPath(path);
    if (!cell || !cell.$window()) return null;
    return $objc("UITargetedPreview").invoke("alloc").invoke("initWithView", cell);
  };
  $define({
    type: `${className}: NSObject <UIContextMenuInteractionDelegate>`,
    events: {
      "contextMenuInteraction:configurationForMenuAtLocation:": configuration,
      "contextMenuInteraction:previewForHighlightingMenuWithConfiguration:": preview,
      "contextMenuInteraction:previewForDismissingMenuWithConfiguration:": preview,
    },
  });
  const delegate = $objc(className).$new();
  $objc_retain(delegate);
  let interaction: any;
  try {
    interaction = $objc("UIContextMenuInteraction").invoke("alloc").invoke("initWithDelegate", delegate);
    native.$addInteraction(interaction);
  } catch (error) {
    state = undefined;
    if (interaction) native.$removeInteraction(interaction);
    $objc_release(delegate);
    throw error;
  }
  return () => {
    if (!state) return;
    native.$removeInteraction(interaction);
    state = undefined;
    $objc_release(delegate);
  };
}

/** 原生 List 加上 Runtime 动态行菜单。页面最终移除时必须调用 dispose()。 */
export class DynamicContextMenuList extends Base<UIListView, UiTypes.ListOptions> {
  protected _defineView: () => UiTypes.ListOptions;
  private readonly cleanups: (() => void)[] = [];

  /**
   * 创建动态行菜单列表。
   * @param options - 原生列表配置与动态菜单事件。
   */
  constructor(options: DynamicContextMenuListOptions) {
    super();
    const { ContextMenu, ready, ...events } = options.events;
    this._defineView = () => ({
      ...options,
      type: "list",
      props: { ...options.props, menu: undefined },
      events: {
        ...events,
        ready: (sender) => {
          this.cleanups.push(installMenu(sender, "list", ContextMenu));
          ready?.(sender);
        },
      },
    });
  }

  /** 最终移除页面时移除所有已加载实例的菜单交互，并释放 Runtime 对象；可重复调用。 */
  dispose() {
    this.cleanups.splice(0).forEach((cleanup) => cleanup());
  }
}

/** 原生 Matrix 加上 Runtime 动态项菜单。页面最终移除时必须调用 dispose()。 */
export class DynamicContextMenuMatrix extends Base<UIMatrixView, UiTypes.MatrixOptions> {
  protected _defineView: () => UiTypes.MatrixOptions;
  private readonly cleanups: (() => void)[] = [];

  /**
   * 创建动态项菜单网格。
   * @param options - 原生网格配置与动态菜单事件。
   */
  constructor(options: DynamicContextMenuMatrixOptions) {
    super();
    const { ContextMenu, ready, ...events } = options.events;
    this._defineView = () => ({
      ...options,
      type: "matrix",
      props: { ...options.props, menu: undefined },
      events: {
        ...events,
        ready: (sender) => {
          this.cleanups.push(installMenu(sender, "matrix", ContextMenu));
          ready?.(sender);
        },
      },
    });
  }

  /** 最终移除页面时移除所有已加载实例的菜单交互，并释放 Runtime 对象；可重复调用。 */
  dispose() {
    this.cleanups.splice(0).forEach((cleanup) => cleanup());
  }
}
