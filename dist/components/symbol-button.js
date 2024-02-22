"use strict";
/**
 * #cview symbolButton
 *
 * 创建可以自动规范symbol大小的button，兼容image，可以设定insets
 *
 * props:
 *   - symbol
 *   - image
 *   - tintColor
 *   - insets
 *
 * events:
 *  - tapped
 */
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
        this._props = Object.assign({ insets: $insets(12.5, 12.5, 12.5, 12.5), tintColor: $color("primaryText") }, props);
        this._layout = layout;
        this._events = events;
        this._defineView = () => {
            return {
                type: "button",
                props: {
                    radius: 0,
                    bgcolor: $color("clear"),
                    id: this.id
                },
                views: [
                    {
                        type: "image",
                        props: {
                            id: "image",
                            symbol: this._props.symbol,
                            image: this._props.image,
                            src: this._props.src,
                            tintColor: this._props.tintColor,
                            contentMode: 1
                        },
                        layout: (make, view) => {
                            make.edges.insets(this._props.insets);
                            make.centerX.equalTo(view.super);
                            make.width.equalTo(view.height);
                        }
                    }
                ],
                layout: this._layout,
                events: Object.assign({}, this._events)
            };
        };
    }
    set tintColor(tintColor) {
        const image = this.view.get("image");
        image.tintColor = tintColor;
    }
    set symbol(symbol) {
        this._props.symbol = symbol;
        const image = this.view.get("image");
        image.symbol = symbol;
    }
    get symbol() {
        return this._props.symbol;
    }
}
exports.SymbolButton = SymbolButton;
