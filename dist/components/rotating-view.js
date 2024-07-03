"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RotatingView = void 0;
const base_1 = require("./base");
const single_views_1 = require("./single-views");
/**
 * 创建一个可以旋转的视图。理论上来说，这个视图的布局必须是方形的。
 *
 * @method startRotating() 开始旋转
 * @method stopRotating() 结束旋转，请注意旋转是不能立即结束的，必须等到动画归位
 */
class RotatingView extends base_1.Base {
    /**
     *
     * @param props 属性
     * - image: UIImage
     * - tintColor: UIColor
     * - contentMode = 1
     * - cview 使用自定义的cview，如果设置上面三项将失效
     * - rps = 0.5 每秒转多少圈
     * - clockwise = true 是否顺时针旋转
     * @param layout 布局
     * @param events 事件
     * - ready?: (cview: RotatingView) => void 默认的ready事件是自动开始旋转；也可以手动指定其他效果
     */
    constructor({ props, layout, events = {} }) {
        super();
        this._props = Object.assign({ contentMode: 1, rps: 0.5, clockwise: true }, props);
        this._rotatingFlag = false;
        if (this._props.cview) {
            this._innerView = this._props.cview;
        }
        else {
            if (!this._props.image)
                throw new Error("image is required");
            this._innerView = new single_views_1.Image({
                props: {
                    image: this._props.tintColor
                        ? this._props.image.alwaysTemplate
                        : this._props.image,
                    tintColor: this._props.tintColor,
                    contentMode: this._props.contentMode
                },
                layout: $layout.fill
            });
        }
        this._defineView = () => {
            return {
                type: "view",
                props: Object.assign(Object.assign({}, this._props), { id: this.id }),
                layout,
                events: {
                    ready: sender => {
                        if (events.ready) {
                            events.ready(this);
                        }
                        else {
                            this.startRotating();
                        }
                    }
                },
                views: [this._innerView.definition]
            };
        };
    }
    startRotating() {
        this._rotatingFlag = true;
        this._rotateView(this._innerView.view);
    }
    stopRotating() {
        this._rotatingFlag = false;
    }
    _rotateView(view) {
        const clockwiseMultiplier = this._props.clockwise ? 1 : -1;
        const duration = 1 / 3 / (this._props.rps || 0.5);
        $ui.animate({
            duration,
            options: 3 << 16,
            animation: () => {
                view.rotate(Math.PI * 2 / 3 * clockwiseMultiplier);
            },
            completion: () => {
                $ui.animate({
                    duration,
                    options: 3 << 16,
                    animation: () => {
                        view.rotate(Math.PI * 4 / 3 * clockwiseMultiplier);
                    },
                    completion: () => {
                        $ui.animate({
                            duration,
                            options: 3 << 16,
                            animation: () => {
                                view.rotate(Math.PI * 2 * clockwiseMultiplier);
                            },
                            completion: () => {
                                if (this._rotatingFlag)
                                    this._rotateView(view);
                            }
                        });
                    }
                });
            }
        });
    }
}
exports.RotatingView = RotatingView;
