"use strict";
/**
 * # cview LoadingDualRing
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DualRing = void 0;
const base_1 = require("../base");
class CanvasComponet extends base_1.Base {
    constructor({ tintColor, startAngle }) {
        super();
        this._tintColor = tintColor;
        this.startAngle = startAngle;
        this._defineView = () => {
            return {
                type: "canvas",
                props: {
                    id: this.id
                },
                layout: $layout.fill,
                events: {
                    draw: (view, ctx) => {
                        ctx.strokeColor = this._tintColor;
                        const radius = Math.min(view.frame.width, view.frame.height);
                        ctx.setLineWidth(20);
                        ctx.setLineCap(1);
                        ctx.setLineJoin(1);
                        ctx.addArc(radius / 2, radius / 2, radius / 2 - 20, this.startAngle, this.startAngle + (Math.PI * 2 * 1) / 4, true);
                        ctx.strokePath();
                    }
                }
            };
        };
    }
    redraw() {
        this.view.ocValue().invoke("setNeedsDisplay");
    }
}
class DualRing extends base_1.Base {
    constructor({ colors = [$color("#f5542e"), $color("#f2c327")], layout }) {
        super();
        const interval = 1 / 60;
        this._defineView = () => {
            const canvas1 = new CanvasComponet({
                tintColor: colors[0],
                startAngle: (-Math.PI * 3) / 4
            });
            const canvas2 = new CanvasComponet({
                tintColor: colors[1],
                startAngle: Math.PI / 4
            });
            return {
                type: "view",
                props: {
                    id: this.id
                },
                views: [canvas1.definition, canvas2.definition],
                layout,
                events: {
                    ready: (sender) => __awaiter(this, void 0, void 0, function* () {
                        while (sender.super) {
                            canvas1.startAngle += Math.PI * interval * 2;
                            canvas1.redraw();
                            canvas2.startAngle += Math.PI * interval * 2;
                            canvas2.redraw();
                            yield $wait(interval);
                        }
                    })
                }
            };
        };
    }
}
exports.DualRing = DualRing;
