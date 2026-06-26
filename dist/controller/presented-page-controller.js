"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PresentedPageController = void 0;
const base_controller_1 = require("./base-controller");
const sheet_1 = require("../components/sheet");
/** # CView PresentedPageController
 *
 * ## Props
 *
 * - presentMode?: number = 1
 * - animated?: boolean = true
 * - interactiveDismissalDisabled?: boolean = false
 * - bgcolor?: UIColor = $color("secondarySurface")
 *
 * ## 专用事件
 *
 * - dismissed: function  退出时的回调
 *
 * ## 专用方法
 *
 * - present() 在 `sheet.present()` 之后会先后执行 `load()` 和 `appear()`
 * - dismiss()
 *
 * ## 布局
 * 此控制器的 layout 必定为 `$layout.fill`，无需自行设定
 */
class PresentedPageController extends base_controller_1.BaseController {
    constructor({ props, layout, events, } = {}) {
        super({
            props: {
                id: props?.id,
                bgcolor: props?.bgcolor,
            },
            layout,
            events,
        });
        this._sheet = new sheet_1.Sheet({
            presentMode: props?.presentMode ?? 1,
            animated: props?.animated ?? true,
            interactiveDismissalDisabled: props?.interactiveDismissalDisabled || false,
            bgcolor: props?.bgcolor || $color("secondarySurface"),
            cview: this.rootView,
            dismissalHandler: () => {
                events?.dismissed?.(this);
                this.remove();
            },
        });
    }
    present() {
        if (this._sheet)
            this._sheet.present();
        this.load();
        this.appear();
    }
    dismiss() {
        if (this._sheet)
            this._sheet.dismiss();
    }
}
exports.PresentedPageController = PresentedPageController;
