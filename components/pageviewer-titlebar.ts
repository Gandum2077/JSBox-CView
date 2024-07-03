import { Base } from './base';
import { ContentView, Label, Stack } from "./single-views";

function weightedAverageColors(c0: UIColor, c1: UIColor, w: number) {
  const red = c0.components.red * w + c1.components.red * (1 - w);
  const green = c0.components.green * w + c1.components.green * (1 - w);
  const blue = c0.components.blue * w + c1.components.blue * (1 - w);
  return $rgb(red, green, blue);
}

interface PageViewerTitleBarProps {
  items: string[];
  index?: number;
  selectedItemColor?: UIColor;
  defaultItemColor?: UIColor;
}

interface PageViewerTitleBarEvents extends UiTypes.BaseViewEvents {
  changed?: (cview: PageViewerTitleBar, index: number) => void;
}

/** 
 * [PageViewer](./pageviewer.ts)配套的标题栏
 * @property index: number
 */
export class PageViewerTitleBar extends Base<UIView, UiTypes.ViewOptions> {
  private _props: Required<PageViewerTitleBarProps>;
  private _floatedIndex: number;
  private _lineStartLocationPercentage: number;
  labels: Label[];
  stack: Stack;
  placeholderView: ContentView;
  line: ContentView;

  _defineView: () => UiTypes.ViewOptions;

  /**
   * 
   * @param props 属性
   * - items: string[]
   * - index: number
   * - selectedItemColor
   * - defaultItemColor
   * @param layout 布局
   * @param events 事件
   * - changed: (cview, index) => void 在点击变更 index 的时候回调
   */
  constructor({ props, layout, events = {} }: {
    props: PageViewerTitleBarProps;
    layout: (make: MASConstraintMaker, view: UIView) => void;
    events: PageViewerTitleBarEvents;
  }) {
    super();
    this._props = {
      index: 0,
      selectedItemColor: $color("systemLink"),
      defaultItemColor: $color("secondaryText"),
      ...props
    };
    const { changed, ...restEvents } = events;
    this._floatedIndex = this._props.index;
    this._lineStartLocationPercentage = this._floatedIndex / this._props.items.length;
    this.labels = this._props.items.map((n, i) => {
      return new Label({
        props: {
          text: n,
          font: $font("bold", 17),
          textColor:
            i === this.index
              ? this._props.selectedItemColor
              : this._props.defaultItemColor,
          align: $align.center,
          userInteractionEnabled: true
        },
        events: {
          tapped: sender => {
            this.index = i;
            if (changed) changed(this, i);
          }
        }
      });
    });
    this.stack = new Stack({
      props: {
        axis: $stackViewAxis.horizontal,
        distribution: $stackViewDistribution.fillEqually,
        stack: {
          views: this.labels.map(n => n.definition)
        }
      },
      layout: $layout.fill
    });
    this.placeholderView = new ContentView({
      props: {
        bgcolor: $color("clear")
      },
      layout: (make, view) => {
        make.left.bottom.inset(0);
        make.width.equalTo(view.super).multipliedBy(this._floatedIndex / this._props.items.length);
      }
    });
    this.line = new ContentView({
      props: {
        bgcolor: this._props.selectedItemColor
      },
      layout: (make, view) => {
        make.height.equalTo(4);
        make.width.equalTo(view.super).dividedBy(this._props.items.length);
        make.bottom.inset(0);
        make.left.equalTo(view.prev.right);
      }
    });
    this._defineView = () => {
      return {
        type: "view",
        props: {
          id: this.id
        },
        layout,
        events: restEvents,
        views: [
          this.stack.definition,
          this.placeholderView.definition,
          this.line.definition
        ]
      };
    }
  }

  get lineStartLocationPercentage() {
    return this._lineStartLocationPercentage;
  }

  set lineStartLocationPercentage(percent) {
    this._lineStartLocationPercentage = percent;
    this.placeholderView.view.remakeLayout((make, view) => {
      make.left.bottom.inset(0);
      make.width.equalTo(view.super).multipliedBy(percent);
    });
  }

  get floatedIndex() {
    return this._floatedIndex;
  }

  set floatedIndex(floatedIndex) {
    this._floatedIndex = floatedIndex;
    this.lineStartLocationPercentage = floatedIndex / this._props.items.length;
    this.labels.forEach((n, i) => {
      if (Math.abs(floatedIndex - i) < 1) {
        n.view.textColor = weightedAverageColors(
          this._props.selectedItemColor,
          this._props.defaultItemColor,
          floatedIndex - i > 0 ? 1 - (floatedIndex - i) : 1 - (i - floatedIndex)
        );
      } else {
        n.view.textColor = this._props.defaultItemColor;
      }
    });
  }

  get index() {
    return this._props.index;
  }

  set index(index) {
    this._props.index = index;
  }
}
