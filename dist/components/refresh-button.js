"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshButton = void 0;
const base_1 = require("./base");
/**
 * 创建一个刷新按钮，平时显示一个刷新的symbol，刷新时显示一个loading的symbol
 * props:
 *   - tintColor
 *   - enabled
 *   - hidden
 * events:
 *   - tapped
 */
class RefreshButton extends base_1.Base {
    constructor({ props, layout, events = {}, }) {
        super();
        this._loading = false;
        this._layout = layout;
        this._defineView = () => {
            var _a, _b, _c;
            return {
                type: "button",
                props: {
                    id: this.id,
                    bgcolor: $color("clear"),
                    enabled: (_a = props === null || props === void 0 ? void 0 : props.enabled) !== null && _a !== void 0 ? _a : true,
                    hidden: (_b = props === null || props === void 0 ? void 0 : props.hidden) !== null && _b !== void 0 ? _b : false,
                },
                layout: this._layout,
                events,
                views: [
                    {
                        type: "image",
                        props: {
                            id: this.id + "_image",
                            symbol: "arrow.clockwise",
                            tintColor: (_c = props === null || props === void 0 ? void 0 : props.tintColor) !== null && _c !== void 0 ? _c : $color("primaryText"),
                            contentMode: 1,
                            hidden: this._loading,
                        },
                        layout: (make, view) => {
                            make.edges.insets($insets(12.5, 12.5, 12.5, 12.5));
                            make.center.equalTo(view.super);
                        },
                    },
                    {
                        type: "spinner",
                        props: {
                            id: this.id + "_spinner",
                            loading: this._loading,
                            hidden: !this._loading,
                        },
                        layout: (make, view) => {
                            make.center.equalTo(view.super);
                        },
                    },
                ],
            };
        };
    }
    get loading() {
        return this._loading;
    }
    set loading(value) {
        this._loading = value;
        $(this.id + "_image").hidden = value;
        $(this.id + "_spinner").hidden = !value;
        $(this.id + "_spinner").loading = value;
        this.view.enabled = !value;
    }
}
exports.RefreshButton = RefreshButton;
