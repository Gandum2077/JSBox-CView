import { Base } from "./base";
import { cvid } from "../utils/cvid";
type MenuItem = {
  title: string;
  symbol: string;
  handler: () => void;
  destructive?: boolean;
}

/**
 * 动态上下文菜单视图，此视图是为了弥补JSBox中无法动态调整上下文菜单的缺陷而设计的。
 * 
 * 每次创建此视图，都会为其自动创建一个新的OC类（如果不这样做，会导致handler出现指向错误，由于OC类注册是全局性的，数量过多会造成什么后果，尚不清楚）。
 * 用menuList列表来记录所需的动态上下文菜单，通过props.info.menuIndex来指定当前视图需要使用的菜单。
 * 
 * 此视图除了一般UIView的props, layout, events, views四个参数外，还有两个必须的特殊参数：
 * 1. menuList: { title: string; items: MenuItem[] }[] 菜单列表，每个菜单项包含一个标题和一个MenuItem数组。
 * 2. props.info: { menuIndex: number } 用于指定当前视图的菜单索引，从0开始。info中可以包含其他参数。
 * 
 */
export class DynamicContextMenuView extends Base<UIView, UiTypes.RuntimeOptions> {
  private _ocClassName: string;
  private _menuList: { title: string; items: MenuItem[] }[];
  _defineView: () => UiTypes.RuntimeOptions;
  constructor({ menuList, props, layout, events, views = [] }: {
    menuList: { title: string; items: MenuItem[] }[];
    props: UiTypes.BaseViewProps;
    layout?: (make: MASConstraintMaker, view: UIView) => void;
    events?: UiTypes.BaseViewEvents;
    views: UiTypes.AllViewOptions[];
  }) {
    super();
    if (!props.info || props.info?.menuIndex === undefined || props.info?.menuIndex === null) {
      throw new Error("props.info.menuIndex is required");
    }
    if (typeof props.info.menuIndex !== "number") {
      throw new Error("props.info.menuIndex must be a number");
    }
    if (props.info.menuIndex < 0 || props.info.menuIndex >= menuList.length) {
      throw new Error("props.info.menuIndex is out of range");
    }
    this._menuList = menuList;
    this._ocClassName = `DynamicContextMenuView_${cvid.newId}`;
    const runtimeView = this.createRuntimeView();
    this._defineView = () => {
      return {
        type: "runtime",
        props: {
          ...props,
          id: this.id,
          view: runtimeView
        },
        layout,
        events,
        views
      }
    }
  }

  set menuIndex(index: number) {
    if (index < 0 || index >= this._menuList.length) {
      throw new Error("menuIndex is out of range");
    }
    // 必须重新赋值info，否则info不会改变
    this.view.info = { ...this.view.info, menuIndex: index };
  }

  get menuIndex(): number {
    return this.view.info.menuIndex;
  }

  private defineOCClass() {
    $define({
      type: this._ocClassName + " : UIView <UIContextMenuInteractionDelegate>",
      events: {
        "contextMenuInteraction:configurationForMenuAtLocation:": (interacton: any, point: JBPoint) => {
          const menuIndex = (interacton.$view().jsValue().info?.menuIndex ?? 0) as number;
          if (menuIndex < 0 || menuIndex >= this._menuList.length) return
          return this.createContextMenuConfiguration(this._menuList[menuIndex]);
        }
      }
    })
  }
  
  private createContextMenuConfiguration({ title, items }: { title: string, items: MenuItem[] }) {
    return $objc("UIContextMenuConfiguration").$configurationWithIdentifier_previewProvider_actionProvider(
      null,
      null,
      $block("UIMenu *, NSArray *", () => {
        const actions = items.map(item => {
          const action = $objc("UIAction").$actionWithTitle_image_identifier_handler(
            item.title,
            item.symbol,
            null,
            $block("void, UIAction *", () => item.handler())
          );
          if (item.destructive) action.$setAttributes(1 << 1);
          return action;
        })
        return $objc("UIMenu").$menuWithTitle_children(title, actions);
      })
    );
  }
  
  private createRuntimeView() {
    this.defineOCClass();
    const view = $objc(this._ocClassName).invoke("alloc.init");
    const interaction = $objc("UIContextMenuInteraction")
      .invoke("alloc")
      .invoke("initWithDelegate", view);
      view.$addInteraction(interaction);
    return view;
  }
}
