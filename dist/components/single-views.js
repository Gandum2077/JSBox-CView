"use strict";
/**
 * 实现单个视图的定义
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Runtime = exports.Code = exports.Chart = exports.Lottie = exports.Markdown = exports.Canvas = exports.Picker = exports.DatePicker = exports.Gradient = exports.Blur = exports.Matrix = exports.List = exports.Web = exports.Map = exports.Menu = exports.Tab = exports.Stack = exports.Scroll = exports.Video = exports.Image = exports.Text = exports.Stepper = exports.Gallery = exports.Progress = exports.Spinner = exports.Switch = exports.Slider = exports.Input = exports.Button = exports.Label = exports.MaskView = exports.ContentView = exports.ClearView = exports.SingleView = void 0;
const base_1 = require("./base");
class SingleView extends base_1.Base {
    constructor({ type, props, layout, events, views }) {
        super();
        this._type = type || "view";
        this._props = props;
        this._layout = layout;
        this._events = events;
        this._views = views;
        this._defineView = () => {
            return {
                type: this._type,
                props: Object.assign(Object.assign({}, this._props), { id: this.id }),
                layout: this._layout,
                events: this._events,
                views: this._views
            };
        };
    }
}
exports.SingleView = SingleView;
class ClearView extends SingleView {
    constructor({ props, layout = $layout.fill, events, views }) {
        super({
            type: "view",
            props: Object.assign({}, props),
            layout,
            events,
            views
        });
    }
}
exports.ClearView = ClearView;
class ContentView extends SingleView {
    constructor({ props, layout = $layout.fillSafeArea, events = {}, views }) {
        super({
            type: "view",
            props: Object.assign({ bgcolor: $color("primarySurface") }, props),
            layout,
            events,
            views
        });
    }
}
exports.ContentView = ContentView;
/**
 * 遮挡视图，使得下面的view无法操作并且整体变暗。
 * 设计上此视图不单独使用，而是作为一个子视图
 * events:
 *   - tapped 点击事件，通常用于dismiss
 */
class MaskView extends SingleView {
    constructor({ props, layout = $layout.fill, events, views }) {
        super({
            type: "view",
            props: Object.assign(Object.assign({ bgcolor: $rgba(0, 0, 0, 0.2) }, props), { userInteractionEnabled: true }),
            layout,
            events,
            views
        });
    }
}
exports.MaskView = MaskView;
class Label extends SingleView {
    constructor({ props, layout, events, views }) {
        super({
            type: "label",
            props,
            layout,
            events,
            views
        });
    }
}
exports.Label = Label;
class Button extends SingleView {
    constructor({ props, layout, events, views }) {
        super({
            type: "button",
            props,
            layout,
            events,
            views
        });
    }
}
exports.Button = Button;
class Input extends SingleView {
    constructor({ props, layout, events, views }) {
        super({
            type: "input",
            props,
            layout,
            events,
            views
        });
    }
}
exports.Input = Input;
class Slider extends SingleView {
    constructor({ props, layout, events, views }) {
        super({
            type: "slider",
            props,
            layout,
            events,
            views
        });
    }
}
exports.Slider = Slider;
class Switch extends SingleView {
    constructor({ props, layout, events, views }) {
        super({
            type: "switch",
            props,
            layout,
            events,
            views
        });
    }
}
exports.Switch = Switch;
class Spinner extends SingleView {
    constructor({ props, layout, events, views }) {
        super({
            type: "spinner",
            props,
            layout,
            events,
            views
        });
    }
}
exports.Spinner = Spinner;
class Progress extends SingleView {
    constructor({ props, layout, events, views }) {
        super({
            type: "progress",
            props,
            layout,
            events,
            views
        });
    }
}
exports.Progress = Progress;
class Gallery extends SingleView {
    constructor({ props, layout, events, views }) {
        super({
            type: "gallery",
            props,
            layout,
            events,
            views
        });
    }
}
exports.Gallery = Gallery;
class Stepper extends SingleView {
    constructor({ props, layout, events, views }) {
        super({
            type: "stepper",
            props,
            layout,
            events,
            views
        });
    }
}
exports.Stepper = Stepper;
class Text extends SingleView {
    constructor({ props, layout, events, views }) {
        super({
            type: "text",
            props,
            layout,
            events,
            views
        });
    }
}
exports.Text = Text;
class Image extends SingleView {
    constructor({ props, layout, events, views }) {
        super({
            type: "image",
            props,
            layout,
            events,
            views
        });
    }
}
exports.Image = Image;
class Video extends SingleView {
    constructor({ props, layout, events, views }) {
        super({
            type: "video",
            props,
            layout,
            events,
            views
        });
    }
}
exports.Video = Video;
class Scroll extends SingleView {
    constructor({ props, layout, events, views }) {
        super({
            type: "scroll",
            props,
            layout,
            events,
            views
        });
    }
}
exports.Scroll = Scroll;
class Stack extends SingleView {
    constructor({ props, layout, events, views }) {
        super({
            type: "stack",
            props,
            layout,
            events,
            views
        });
    }
}
exports.Stack = Stack;
class Tab extends SingleView {
    constructor({ props, layout, events, views }) {
        super({
            type: "tab",
            props,
            layout,
            events,
            views
        });
    }
}
exports.Tab = Tab;
class Menu extends SingleView {
    constructor({ props, layout, events, views }) {
        super({
            type: "menu",
            props,
            layout,
            events,
            views
        });
    }
}
exports.Menu = Menu;
class Map extends SingleView {
    constructor({ props, layout, events, views }) {
        super({
            type: "map",
            props,
            layout,
            events,
            views
        });
    }
}
exports.Map = Map;
class Web extends SingleView {
    constructor({ props, layout, events, views }) {
        super({
            type: "web",
            props,
            layout,
            events,
            views
        });
    }
}
exports.Web = Web;
class List extends SingleView {
    constructor({ props, layout, events, views }) {
        super({
            type: "list",
            props,
            layout,
            events,
            views
        });
    }
}
exports.List = List;
class Matrix extends SingleView {
    constructor({ props, layout, events, views }) {
        super({
            type: "matrix",
            props,
            layout,
            events,
            views
        });
    }
}
exports.Matrix = Matrix;
class Blur extends SingleView {
    constructor({ props, layout, events, views }) {
        super({
            type: "blur",
            props,
            layout,
            events,
            views
        });
    }
}
exports.Blur = Blur;
class Gradient extends SingleView {
    constructor({ props, layout, events, views }) {
        super({
            type: "gradient",
            props,
            layout,
            events,
            views
        });
    }
}
exports.Gradient = Gradient;
class DatePicker extends SingleView {
    constructor({ props, layout, events, views }) {
        super({
            type: "date-picker",
            props,
            layout,
            events,
            views
        });
    }
}
exports.DatePicker = DatePicker;
class Picker extends SingleView {
    constructor({ props, layout, events, views }) {
        super({
            type: "picker",
            props,
            layout,
            events,
            views
        });
    }
}
exports.Picker = Picker;
class Canvas extends SingleView {
    constructor({ props, layout, events, views }) {
        super({
            type: "canvas",
            props,
            layout,
            events,
            views
        });
    }
}
exports.Canvas = Canvas;
class Markdown extends SingleView {
    constructor({ props, layout, events, views }) {
        super({
            type: "markdown",
            props,
            layout,
            events,
            views
        });
    }
}
exports.Markdown = Markdown;
class Lottie extends SingleView {
    constructor({ props, layout, events, views }) {
        super({
            type: "lottie",
            props,
            layout,
            events,
            views
        });
    }
}
exports.Lottie = Lottie;
class Chart extends SingleView {
    constructor({ props, layout, events, views }) {
        super({
            type: "chart",
            props,
            layout,
            events,
            views
        });
    }
}
exports.Chart = Chart;
class Code extends SingleView {
    constructor({ props, layout, events, views }) {
        super({
            type: "code",
            props,
            layout,
            events,
            views
        });
    }
}
exports.Code = Code;
class Runtime extends SingleView {
    constructor({ props, layout, events, views }) {
        super({
            type: "runtime",
            props,
            layout,
            events,
            views
        });
    }
}
exports.Runtime = Runtime;
