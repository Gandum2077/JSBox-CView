/**
 * # cview LoadingWedges
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
          id: this.id,
          alpha: 0.8
        },
        layout: $layout.fill,
        events: {
          draw: (view, ctx) => {
            ctx.fillColor = this._tintColor;
            const radius = Math.min(view.frame.width, view.frame.height);
            ctx.addArc(
              radius / 2,
              radius / 2,
              radius / 2,
              this.startAngle,
              this.startAngle + (Math.PI * 2 * 1) / 4,
              true
            );
            ctx.addLineToPoint(radius / 2, radius / 2);
            ctx.closePath();
            ctx.fillPath();
          }
        }
      };
    }
  }

  redraw() {
    this.view.ocValue().invoke("setNeedsDisplay");
  }
}

export class Wedges extends Base<UIView, UiTypes.ViewOptions> {
  _defineView: () => UiTypes.ViewOptions;
  constructor({
    colors = [
      $color("#f5542e"),
      $color("#f2c327"),
      $color("#008b6e"),
      $color("#00aede")
    ],
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
        startAngle: -Math.PI / 2
      });
      const canvas2 = new CanvasComponet({
        tintColor: colors[1],
        startAngle: 0
      });
      const canvas3 = new CanvasComponet({
        tintColor: colors[2],
        startAngle: Math.PI / 2
      });
      const canvas4 = new CanvasComponet({
        tintColor: colors[3],
        startAngle: Math.PI
      });
      return {
        type: "view",
        props: {
          id: this.id
        },
        views: [
          canvas1.definition,
          canvas2.definition,
          canvas3.definition,
          canvas4.definition
        ],
        layout,
        events: {
          ready: async sender => {
            while (sender.super) {
              canvas1.startAngle += Math.PI * interval * 4;
              canvas1.redraw();
              canvas2.startAngle += Math.PI * interval * 3;
              canvas2.redraw();
              canvas3.startAngle += Math.PI * interval * 2;
              canvas3.redraw();
              canvas4.startAngle += Math.PI * interval * 1;
              canvas4.redraw();
              await $wait(interval);
            }
          }
        }
      };
    }
  }
}
