import { Base } from "./base";
import { cvid } from "../utils/cvid";

type MenuItem = {
  title: string;
  symbol?: string;
  handler: () => void;
  destructive?: boolean;
};

const RegisteredOCClassName: Set<string> = new Set();

/**
 * 动态上下文菜单视图，此视图是为了弥补JSBox中无法动态调整上下文菜单的缺陷而设计的。
 *
 * 此视图除了一般UIView的props, layout, events, views四个参数外，还有必须的特殊参数：
 * 1. classname?: string OC类名，如果不指定则会自动生成一个唯一的类名。
 *    如果有不同的DynamicContextMenuView实例使用相同的OC类，
 *    那么无法确定弹出的contextMenu是绑定了哪个实例。
 *    换言之，实例A弹出的Menu可能是绑定的实例B。
 *    如果这样做，必须使用下面generateContextMenu的sender参数来定位。
 * 2. generateContextMenu: (sender: UIView) => { title: string; items: MenuItem[]; }
 *    生成上下文菜单的回调函数。
 *
 */
export class DynamicContextMenuView extends Base<
  UIView,
  UiTypes.RuntimeOptions
> {
  private generateContextMenu: (sender: UIView) => {
    title?: string;
    items: MenuItem[];
  };
  private _ocClassName: string;
  _defineView: () => UiTypes.RuntimeOptions;

  constructor({
    classname,
    generateContextMenu,
    props,
    layout,
    events,
    views,
  }: {
    classname?: string;
    generateContextMenu: (sender: UIView) => {
      title?: string;
      items: MenuItem[];
    };
    props: UiTypes.ViewProps;
    layout?: (make: MASConstraintMaker, view: UIView) => void;
    events?: UiTypes.BaseViewEvents;
    views?: UiTypes.AllViewOptions[];
  }) {
    super();
    this._ocClassName = classname || `DynamicContextMenuView_${cvid.newId}`;
    this.generateContextMenu = generateContextMenu;
    const runtimeView = this.createRuntimeView();
    this._defineView = () => {
      return {
        type: "runtime",
        props: {
          ...props,
          id: this.id,
          view: runtimeView,
        },
        layout,
        events,
        views,
      };
    };
  }

  private defineOCClass() {
    if (RegisteredOCClassName.has(this._ocClassName)) return;
    RegisteredOCClassName.add(this._ocClassName);
    $define({
      type: this._ocClassName + " : UIView <UIContextMenuInteractionDelegate>",
      events: {
        "contextMenuInteraction:configurationForMenuAtLocation:": (
          interacton: any,
          point: JBPoint
        ) => {
          const view = interacton.$view().jsValue();
          const menu = this.generateContextMenu(view);
          return this.createContextMenuConfiguration(menu);
        },
      },
    });
  }

  private createContextMenuConfiguration({
    title,
    items,
  }: {
    title?: string;
    items: MenuItem[];
  }) {
    return $objc(
      "UIContextMenuConfiguration"
    ).$configurationWithIdentifier_previewProvider_actionProvider(
      null,
      null,
      $block("UIMenu *, NSArray *", () => {
        const actions = items.map((item) => {
          const action = $objc(
            "UIAction"
          ).$actionWithTitle_image_identifier_handler(
            item.title,
            item.symbol || null,
            null,
            $block("void, UIAction *", () => item.handler())
          );
          if (item.destructive) action.$setAttributes(1 << 1);
          return action;
        });
        return title ? $objc("UIMenu").$menuWithTitle_children(title, actions) : $objc("UIMenu").$menuWithChildren(actions);
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
