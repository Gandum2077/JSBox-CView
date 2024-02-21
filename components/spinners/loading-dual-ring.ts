/**
 * # cview LoadingDualRing
 */

import { Base } from "../base";

class CanvasComponet extends Base<UICanvasView, UiTypes.CanvasOptions> {
  _tintColor: UIColor;
  startAngle: number;
  _defineView: () => UiTypes.CanvasOptions;
  constructor({ tintColor, startAngle }: { tintColor: UIColor; startAngle: number }) {
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
            ctx.addArc(
              radius / 2,
              radius / 2,
              radius / 2 - 20,
              this.startAngle,
              this.startAngle + (Math.PI * 2 * 1) / 4,
              true
            );
            ctx.strokePath();
          }
        }
      };
    }
  }

  redraw() {
    this.view.ocValue().invoke("setNeedsDisplay");
  }
}

export class DualRing extends Base<UIView, UiTypes.ViewOptions> {
  _defineView: () => UiTypes.ViewOptions;
  constructor({ 
    colors = [$color("#f5542e"), $color("#f2c327")],
    layout 
  }: {
    colors?: UIColor[];
    layout: (make: MASConstraintMaker, view: UIView) => void;
  }) {
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
          ready: async sender => {
            while (sender.super) {
              canvas1.startAngle += Math.PI * interval * 2;
              canvas1.redraw();
              canvas2.startAngle += Math.PI * interval * 2;
              canvas2.redraw();
              await $wait(interval);
            }
          }
        }
      };
    }
  }
}
