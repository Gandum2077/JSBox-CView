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
 * ## 专用方法
 *
 * - present() 在 `sheet.present()` 之后会先后执行 `load()` 和 `appear()`
 * - dismiss()
 *
 * ## 布局
 * 此控制器的 layout 必定为 `$layout.fill`，无需自行设定
 */
class PresentedPageController extends base_controller_1.BaseController {
    constructor({ props, layout, events } = {}) {
        var _a, _b;
        super({
            props: {
                id: props === null || props === void 0 ? void 0 : props.id,
                bgcolor: props === null || props === void 0 ? void 0 : props.bgcolor
            }, layout, events
        });
        this._sheet = new sheet_1.Sheet({
            presentMode: (_a = props === null || props === void 0 ? void 0 : props.presentMode) !== null && _a !== void 0 ? _a : 1,
            animated: (_b = props === null || props === void 0 ? void 0 : props.animated) !== null && _b !== void 0 ? _b : true,
            interactiveDismissalDisabled: (props === null || props === void 0 ? void 0 : props.interactiveDismissalDisabled) || false,
            bgcolor: (props === null || props === void 0 ? void 0 : props.bgcolor) || $color("secondarySurface"),
            cview: this.rootView,
            dismissalHandler: () => this.remove()
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
