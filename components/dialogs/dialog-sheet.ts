/**
 * # cview DialogSheet
 * 
 * dialog所需要的sheet
 * 
 * ## 参数
 * - `title` 标题
 * - `cview` CView
 * - `doneHandler` 完成时的回调
 * - `presentMode` presentMode
 * - `bgcolor` 背景颜色
 */

import { Sheet } from "../sheet";

import { CustomNavigationBar } from "../custom-navigation-bar";
import { l10n } from "../../utils/l10n";
import { ContentView } from "../single-views";
import { Base } from "../base";


export class DialogSheet extends Sheet<ContentView, UIView, UiTypes.ViewOptions>{
  _props: {
    title: string;
    cview: Base<any, any>;
    doneHandler?: () => void;
    presentMode?: number;
    bgcolor?: UIColor;
  }
  _done: boolean;
  private _navbar?: CustomNavigationBar;
  resolve?: (value: any) => void;
  reject?: (reason: any) => void;

  constructor(props: {
    title: string;
    cview: Base<any, any>;
    doneHandler?: () => void;
    presentMode?: number;
    bgcolor?: UIColor;
  }) {
    super({
      presentMode: props.presentMode || ($device.isIpad ? 2 : 1),
      bgcolor: props.bgcolor
    });
    this._props = props;
    this._done = false;
  }

  promisify(resolve: (value: any) => void, reject: (reason: any) => void) {
    this.resolve = resolve;
    this.reject = reject;
  }

  present() {
    this._dismissalHandler = () => {
      if (!this._done && this.reject) this.reject("cancel");
    };
    this._navbar = new CustomNavigationBar({
      props: {
        title: this._props.title,
        leftBarButtonItems: [
          { symbol: "xmark", handler: () => this.dismiss() }
        ],
        rightBarButtonItems: [
          { title: l10n("DONE"), handler: () => this.done() }
        ]
      }
    });
    this._props.cview._layout = (make, view) => {
      make.bottom.equalTo(view.super);
      make.left.right.equalTo(view.super.safeArea);
      make.top.equalTo(view.prev.bottom);
    };
    this._cview = new ContentView({
      props: { bgcolor: $color("clear") },
      views: [this._navbar.definition, this._props.cview.definition]
    });
    super.present();
  }

  done() {
    this._done = true;
    if (this.resolve && this._props.doneHandler)
      this.resolve(this._props.doneHandler());
    this.dismiss();
  }

  get title() {
    return this._props.title;
  }

  set title(title: string) {
    this._props.title = title;
    if (this._navbar) this._navbar.title = title;
  }
}
