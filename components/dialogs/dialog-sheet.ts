import { Sheet } from "../sheet";

import { CustomNavigationBar } from "../custom-navigation-bar";
import { l10n } from "../../utils/l10n";
import { ContentView } from "../single-views";
import { Base } from "../base";

/** DialogSheet 属性接口 */
export interface DialogSheetProps {
  /** 导航栏标题。 */
  title: string;
  /** 弹出页内容组件。 */
  cview: Base<any, any>;
  /** 完成时返回结果的处理函数。 */
  doneHandler?: () => any;
  /** Sheet 显示模式；默认在 iPad 使用 form sheet，其他设备使用 page sheet。 */
  presentMode?: number;
  /** Sheet 背景颜色。 */
  bgcolor?: UIColor;
  /** 是否隐藏完成按钮。 */
  doneButtonHidden?: boolean;
  /** 完成前执行的验证器；返回 `false` 时保持弹出页打开。 */
  doneButtonValidator?: () => boolean;
  /** 完成按钮标题，默认为本地化的“完成”。 */
  doneButtonTitle?: string;
}
/**
 * 带自定义导航栏的表单式弹出页。
 *
 * 导航栏提供取消和完成操作，内容由一个 CView 组件提供。
 * 可通过 `promisify` 连接 Promise；未完成就关闭时会以 `"cancel"` 拒绝。
 */
export class DialogSheet extends Sheet<ContentView, UIView, UiTypes.ViewOptions> {
  _props: DialogSheetProps;
  _done: boolean;
  private _navbar?: CustomNavigationBar;
  resolve?: (value: any) => void;
  reject?: (reason: any) => void;

  /**
   * 创建表单式弹出页。
   * @param props - 弹出页内容和完成操作选项。
   */
  constructor(props: DialogSheetProps) {
    super({
      presentMode: props.presentMode ?? ($device.isIpad ? 2 : 1),
      bgcolor: props.bgcolor,
    });
    this._props = props;
    this._done = false;
  }

  /**
   * 连接外部 Promise 的成功和失败回调。
   * @param resolve - 完成时的 Promise 解析函数。
   * @param reject - 取消时的 Promise 拒绝函数。
   */
  promisify(resolve: (value: any) => void, reject: (reason: any) => void) {
    this.resolve = resolve;
    this.reject = reject;
  }

  /** 组装导航栏和内容组件，然后显示 Sheet。 */
  present() {
    this._dismissalHandler = () => {
      if (!this._done && this.reject) this.reject("cancel");
    };
    this._navbar = new CustomNavigationBar({
      props: {
        title: this._props.title,
        leftBarButtonItems: [{ symbol: "xmark", handler: () => this.dismiss() }],
        rightBarButtonItems: this._props.doneButtonHidden
          ? []
          : [
              {
                title: this._props.doneButtonTitle || l10n("DONE"),
                handler: () => {
                  if (this._props.doneButtonValidator) {
                    if (this._props.doneButtonValidator()) {
                      this.done();
                    } else {
                      return;
                    }
                  } else {
                    this.done();
                  }
                },
              },
            ],
      },
    });
    this._props.cview._layout = (make, view) => {
      make.left.right.bottom.equalTo(view.super);
      make.top.equalTo(view.prev.bottom);
    };
    this._cview = new ContentView({
      props: { bgcolor: $color("clear") },
      views: [this._navbar.definition, this._props.cview.definition],
    });
    super.present();
  }

  /** 执行完成处理、解析已连接的 Promise，并关闭 Sheet。 */
  done() {
    this._done = true;
    if (this.resolve && this._props.doneHandler) this.resolve(this._props.doneHandler());
    this.dismiss();
  }

  /**
   * 获取导航栏标题。
   * @returns 当前标题。
   */
  get title() {
    return this._props.title;
  }

  /**
   * 更新导航栏标题。
   * @param title - 新标题。
   */
  set title(title: string) {
    this._props.title = title;
    if (this._navbar) this._navbar.title = title;
  }
}
