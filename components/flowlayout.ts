import { Base } from "./base";

/**
 * 流式布局：间距固定，项目高度固定但宽度不定，左对齐，自动换行，不能滚动。
 * 
 * 注意事项:
 * 1. 此控件默认是可变高度的，但前提是布局中必须有关于高度的约束。如果不需要可变高度，可以设置fixedHeight为true
 * 1. 此控件的边缘是不留白的，这和Matrix不同
 * 2. itemWidth 如果超过总宽度，会被设定为总宽度
 * 3. maxRows 可以控制最大行数，如果超过则会被截断
 * 
 * ## 属性
 * 属性的写法尽可能和Matrix的风格保持一致
 * - items: FlowlayoutItem[] 关键参数，必须实现一个方法itemWidth(): number, 用于告知自身理想的宽度
 * - spacing: number
 * - itemHeight: number
 * - maxRows?: number
 * - fixedHeight?: boolean
 * - menu?: UiTypes.ContextMenuOptions
 * - bgcolor?: UIColor
 * 
 * ## 事件
 * - didSelect: (sender: Flowlayout, index: number, item: FlowlayoutItem) => void
 * - didLongPress: (sender: Flowlayout, index: number, item: FlowlayoutItem) => void
 *
 * ## 方法
 * - heightToWidth(width: number): height: number  根据宽度计算其应有的高度
 * - cell(index: number): FlowlayoutItem  获取对应位置的 cview
 * - set items(items: FlowlayoutItem[])  设置子视图
 * - get items(): FlowlayoutItem[]  获取子视图
 */
export class Flowlayout extends Base<UIView, UiTypes.ViewOptions> {
  private _width: number; // 缓存宽度，用于判断是否需要重新布局
  private _props: {
    items: FlowlayoutItem[];
    spacing: number;
    itemHeight: number;
    fixedRows?: number;
    fixedHeight?: boolean;
    menu?: UiTypes.ContextMenuOptions;
    bgcolor?: UIColor;
  }
  private _wrappers: WrapperView[];
  private _events?: {
    didSelect?: (sender: Flowlayout, index: number, item: FlowlayoutItem) => void;
    didLongPress?: (sender: Flowlayout, index: number, item: FlowlayoutItem) => void;
  }
  _defineView: () => UiTypes.ViewOptions;

  constructor({ props, layout, events }: {
    props: {
      items: FlowlayoutItem[];
      spacing: number;
      itemHeight: number;
      fixedRows?: number;
      fixedHeight?: boolean;
      menu?: UiTypes.ContextMenuOptions;
      bgcolor?: UIColor;
    };
    layout: (make: MASConstraintMaker, view: UIView) => void;
    events?: {
      didSelect?: (sender: Flowlayout, index: number, item: FlowlayoutItem) => void;
      didLongPress?: (sender: Flowlayout, index: number, item: FlowlayoutItem) => void;
    }
  }) {
    super();
    this._width = 0;
    this._props = props;
    this._events = events;
    this._wrappers = props.items.map((item, index) => new WrapperView({
      item,
      menu: props.menu,
      didSelect: events?.didSelect,
      didLongPress: events?.didLongPress,
      flowlayout: this,
      index
    }));
    this._defineView = () => ({
      type: "view",
      props: {
        id: this.id,
        bgcolor: props.bgcolor,
      },
      layout,
      events: {
        layoutSubviews: sender => {
          if (this._width !== sender.frame.width) {
            this._width = sender.frame.width;
            const height = this._layoutWrappers();
            if (!this._props.fixedHeight) sender.updateLayout((make) => make.height.equalTo(height));
          }
        }
      },
      views: this._wrappers.map(wrapper => wrapper.definition)
    });
  }

  cell(index: number): FlowlayoutItem {
    return this._props.items[index];
  }

  get items(): FlowlayoutItem[] {
    return this._props.items;
  }

  set items(items: FlowlayoutItem[]) {
    this._props.items = items;
    this._wrappers = items.map((item, index) => new WrapperView({
      item,
      menu: this._props.menu,
      didSelect: this._events?.didSelect,
      didLongPress: this._events?.didLongPress,
      flowlayout: this,
      index
    }));
    this.view.views.forEach(v => v.remove());
    this._wrappers.forEach(wrapper => this.view.add(wrapper.definition));
    const height = this._layoutWrappers();
    if (!this._props.fixedHeight) this.view.updateLayout((make) => make.height.equalTo(height));
  }

  _layoutWrappers(): number {
    const totalWidth = this._width;
    const itemHeight = this._props.itemHeight;
    const itemSpacing = this._props.spacing;
    let x = 0;
    let y = 0;
    let line = 1;
    this._wrappers.forEach((wrapper, index) => {
      const itemWidth = wrapper.item.itemWidth();
      const width = Math.min(itemWidth, totalWidth);
      if (x + width > totalWidth) {
        x = 0;
        y += itemHeight + itemSpacing;
        line++;
      }
      if (this._props.fixedRows && line > this._props.fixedRows) {
        wrapper.hidden = true;
      } else {
        wrapper.hidden = false;
      }
      wrapper.frame = $rect(x, y, width, itemHeight);
      x += width + itemSpacing;
    });
    if (this._props.fixedRows && line > this._props.fixedRows) {
      return this._props.fixedRows * (itemHeight + itemSpacing) - itemSpacing;
    }
    return y + itemHeight;
  }

  heightToWidth(width: number): number {
    const totalWidth = width;
    const itemHeight = this._props.itemHeight;
    const itemSpacing = this._props.spacing;
    let x = 0;
    let y = 0;
    let line = 1;
    this._wrappers.forEach((wrapper, index) => {
      const itemWidth = wrapper.item.itemWidth();
      const width = Math.min(itemWidth, totalWidth);
      if (x + width > totalWidth) {
        x = 0;
        y += itemHeight + itemSpacing;
        line++;
      }
      x += width + itemSpacing;
    });
    if (this._props.fixedRows && line > this._props.fixedRows) {
      return this._props.fixedRows * (itemHeight + itemSpacing) - itemSpacing;
    }
    return y + itemHeight;
  }
}

interface FlowlayoutItem extends Base<any, any> {
  itemWidth: () => number;
}

class WrapperView extends Base<UIView, UiTypes.ViewOptions> {
  _defineView: () => UiTypes.ViewOptions;
  item: FlowlayoutItem;
  constructor({
    item,
    menu,
    didSelect,
    didLongPress,
    flowlayout,
    index
  }: {
    item: FlowlayoutItem;
    menu?: UiTypes.ContextMenuOptions;
    didSelect?: (sender: Flowlayout, index: number, item: FlowlayoutItem) => void;
    didLongPress?: (sender: Flowlayout, index: number, item: FlowlayoutItem) => void;
    flowlayout: Flowlayout;
    index: number;
  }) {
    super();
    this.item = item;
    const props: UiTypes.BaseViewProps = {
      id: this.id,
      frame: $rect(0, 0, 0, 0),
      userInteractionEnabled: true,
    }
    if (menu) {
      props.menu = menu;
    }
    this._defineView = () => ({
      type: "view",
      props,
      views: [item.definition],
      events: {
        tapped: sender => {
          if (didSelect) didSelect(flowlayout, index, item)
        },
        longPressed: sender => {
          if (didLongPress) didLongPress(flowlayout, index, item)
        }
      }
    });
  }

  set frame(frame: JBRect) {
    this.view.frame = frame;
  }

  get frame(): JBRect {
    return this.view.frame;
  }

  set hidden(hidden: boolean) {
    this.view.hidden = hidden;
  }

  get hidden(): boolean {
    return this.view.hidden;
  }
}