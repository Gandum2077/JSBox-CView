"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SymbolButton = void 0;
const base_1 = require("./base");
/**
 * 创建可以自动规范symbol大小的button，兼容image，可以设定insets
 * props:
 *   - symbol
 *   - image
 *   - tintColor
 *   - insets
 * events:
 *   - tapped
 */
class SymbolButton extends base_1.Base {
    constructor({ props, layout, events = {} }) {
        super();
        this._props = Object.assign({ enabled: true, contentMode: 1, insets: $insets(12.5, 12.5, 12.5, 12.5), tintColor: $color("primaryText") }, props);
        this._layout = layout;
        this._defineView = () => {
            const props = this._props.menu
                ? {
                    radius: 0,
                    bgcolor: $color("clear"),
                    id: this.id,
                    menu: this._props.menu,
                    enabled: this._props.enabled
                } : {
                radius: 0,
                bgcolor: $color("clear"),
                id: this.id,
                enabled: this._props.enabled
            };
            return {
                type: "button",
                props,
                views: [
                    {
                        type: "image",
                        props: {
                            id: "image",
                            symbol: this._props.symbol,
                            image: this._props.image,
                            src: this._props.src,
                            tintColor: this._props.tintColor,
                            contentMode: this._props.contentMode
                        },
                        layout: (make, view) => {
                            make.edges.insets(this._props.insets);
                            make.centerX.equalTo(view.super);
                            make.width.equalTo(view.height);
                        }
                    }
                ],
                layout: this._layout,
                events
            };
        };
    }
    set tintColor(tintColor) {
        this.view.get("image").tintColor = tintColor;
    }
    set image(image) {
        this.view.get("image").image = image;
    }
    set symbol(symbol) {
        this.view.get("image").symbol = symbol;
    }
    set src(src) {
        this.view.get("image").src = src;
    }
}
exports.SymbolButton = SymbolButton;
