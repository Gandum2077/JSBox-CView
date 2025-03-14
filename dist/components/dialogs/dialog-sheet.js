"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DialogSheet = void 0;
const sheet_1 = require("../sheet");
const custom_navigation_bar_1 = require("../custom-navigation-bar");
const l10n_1 = require("../../utils/l10n");
const single_views_1 = require("../single-views");
/**
 * dialog所需要的sheet
 *
 * @param title 标题
 * @param cview 内容视图
 * @param doneHandler 完成时的回调
 * @param presentMode 显示模式
 * @param bgcolor 背景颜色
 * @param doneButtonHidden 是否隐藏完成按钮, 默认为false，如果隐藏则需要自行实现完成逻辑
 */
class DialogSheet extends sheet_1.Sheet {
    constructor(props) {
        super({
            presentMode: props.presentMode || ($device.isIpad ? 2 : 1),
            bgcolor: props.bgcolor,
        });
        this._props = props;
        this._done = false;
    }
    promisify(resolve, reject) {
        this.resolve = resolve;
        this.reject = reject;
    }
    present() {
        this._dismissalHandler = () => {
            if (!this._done && this.reject)
                this.reject("cancel");
        };
        this._navbar = new custom_navigation_bar_1.CustomNavigationBar({
            props: {
                title: this._props.title,
                leftBarButtonItems: [
                    { symbol: "xmark", handler: () => this.dismiss() },
                ],
                rightBarButtonItems: this._props.doneButtonHidden
                    ? []
                    : [{ title: (0, l10n_1.l10n)("DONE"), handler: () => this.done() }],
            },
        });
        this._props.cview._layout = (make, view) => {
            make.bottom.equalTo(view.super);
            make.left.right.equalTo(view.super.safeArea);
            make.top.equalTo(view.prev.bottom);
        };
        this._cview = new single_views_1.ContentView({
            props: { bgcolor: $color("clear") },
            views: [this._navbar.definition, this._props.cview.definition],
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
    set title(title) {
        this._props.title = title;
        if (this._navbar)
            this._navbar.title = title;
    }
}
exports.DialogSheet = DialogSheet;
