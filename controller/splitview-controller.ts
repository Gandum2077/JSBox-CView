import {
  BaseController,
  BaseControllerProps,
  BaseControllerEvents,
} from "./base-controller";
import { Base } from "../components/base";
import { ContentView } from "../components/single-views";
import { cvid } from "../utils/cvid";

class SecondaryView extends Base<UIView, UiTypes.ViewOptions> {
  _props: UiTypes.BaseViewProps;
  _layouts: {
    hidden: (make: MASConstraintMaker, view: AllUIView) => void;
    shown: (make: MASConstraintMaker, view: AllUIView) => void;
  };
  line: ContentView;
  _defineView: () => UiTypes.ViewOptions;
  constructor({
    props,
    layout,
    views = [],
  }: {
    props?: UiTypes.BaseViewProps;
    layout?: (make: MASConstraintMaker, view: UIView) => void;
    views?: UiTypes.AllViewOptions[];
  }) {
    super();
    this._props = {
      bgcolor: $color("groupedBackground", "secondarySurface"),
      ...props,
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

  add(view: UiTypes.AllViewOptions | Base<any, any>) {
    super.add(view);
    this.line.view.moveToFront();
  }

  show() {
    this.view.remakeLayout(this._layouts.shown);
    $ui.animate({
      duration: 0.3,
      animation: () => this.view.relayout(),
    });
  }

  hide() {
    this.view.remakeLayout(this._layouts.hidden);
    $ui.animate({
      duration: 0.3,
      animation: () => this.view.relayout(),
    });
  }
}

class MaskView extends Base<UIView, UiTypes.ViewOptions> {
  _props: {
    bgcolor: UIColor;
    dismissHandler?: () => void;
  };
  _shown: boolean;
  _dismissEvent: () => void;
  _gestureObject: any;
  _defineView: () => UiTypes.ViewOptions;
  constructor({
    props,
    layout = $layout.fill,
  }: {
    props: {
      bgcolor?: UIColor;
      dismissHandler?: () => void;
    };
    layout?: (make: MASConstraintMaker, view: UIView) => void;
  }) {
    super();
    this._props = { bgcolor: $color("clear"), ...props };
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
    const tapGestureRecognizer = $objc("UITapGestureRecognizer")
      .$alloc()
      .$initWithTarget_action(object, "tapEvent");
    view.ocValue().$addGestureRecognizer(tapGestureRecognizer);
    view.ocValue().$addGestureRecognizer(swipeGestureRecognizer);
  }

  releaseGestureObject() {
    if (this._gestureObject) $objc_release(this._gestureObject);
  }

  show() {
    this._shown = true;
    this.view.moveToFront();
    this.view.hidden = false;
  }

  hide() {
    this._shown = false;
    this.view.hidden = true;
  }
}

interface SplitViewControllerProps extends BaseControllerProps {
  items: { controller: BaseController; bgcolor: UIColor }[];
}

/** # CView SplitView Controller
 *
 * 实现左右分栏布局的控制器, 本身不提供除了分割线以外的视觉效果
 *
 * 此控制器加载后，会禁用原本的ScreenEdgePanGesture，此控制器应该作为根控制器使用
 *
 * @param options.props.items: { controller: Controller, bgcolor: UIColor }[]
 *  其中第一个放在主视图上, 第二个放在次视图上
 *
 * @property sideBarShown: boolean = false 侧栏是否显示
 * @property canShowSidebar: boolean = true 是否启动显示侧栏的动作
 *  （若为false，依然可以用sideBarShown来控制侧栏的显示）
 */
export class SplitViewController extends BaseController {
  private _screenEdgePanGestureObject: any;
  private _sideBarShown: boolean;
  private _canShowSidebar: boolean;
  private _primaryController: BaseController;
  private _secondaryController: BaseController;
  cviews: {
    primaryView: ContentView;
    secondaryView: SecondaryView;
    maskView: MaskView;
  };
  constructor({
    props,
    layout,
    events,
  }: {
    props: SplitViewControllerProps;
    layout?: (make: MASConstraintMaker, view: UIView) => void;
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
      views: [
        props.items[0].controller.rootView.definition,
        this.cviews.maskView.definition,
      ],
    });
    this._screenEdgePanGestureObject = this._defineGestureObject(() => {
      if (!this.sideBarShown && this._canShowSidebar) this.sideBarShown = true;
    });
    this.rootView.views = [this.cviews.secondaryView, this.cviews.primaryView];
  }

  load() {
    super.load();
    this._renewScreenEdgePanGesture();
  }

  remove() {
    $objc_release(this._screenEdgePanGestureObject);
    this.cviews.maskView.releaseGestureObject();
    super.remove();
  }

  uirender() {
    const props: UiTypes.RootViewPrefs = {
      navBarHidden: true,
      statusBarStyle: 0,
    };
    super.uirender(props);
  }

  uipush() {
    const props: UiTypes.RootViewPrefs = {
      navBarHidden: true,
      statusBarStyle: 0,
    };
    super.uipush(props);
  }

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

  _renewScreenEdgePanGesture() {
    const UIScreenEdgePanGestureRecognizer = $ui.controller.view
      .ocValue()
      .$gestureRecognizers()
      .$firstObject();

    UIScreenEdgePanGestureRecognizer.invoke("removeTarget:action:", null, null);
    const NewUIScreenEdgePanGestureRecognizer = $objc(
      "UIScreenEdgePanGestureRecognizer"
    )
      .$alloc()
      .$initWithTarget_action(
        this._screenEdgePanGestureObject,
        "screenEdgePanEvent"
      );
    NewUIScreenEdgePanGestureRecognizer.$setEdges(1 << 1);
    this.rootView.view
      .ocValue()
      .$addGestureRecognizer(NewUIScreenEdgePanGestureRecognizer);
  }

  _showSideBar() {
    this.cviews.secondaryView.show();
    this.cviews.maskView.show();
  }

  _hideSideBar() {
    this.cviews.secondaryView.hide();
    this.cviews.maskView.hide();
  }

  get sideBarShown() {
    return this._sideBarShown;
  }

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

  get canShowSidebar() {
    return this._canShowSidebar;
  }

  set canShowSidebar(bool: boolean) {
    this._canShowSidebar = bool;
  }
}
