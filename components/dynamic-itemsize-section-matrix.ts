import { getTextHeight } from "../utils/uitools";
import { Base } from "./base";
import { Matrix } from "./single-views";

export interface DynamicItemSizeSectionMatrixSection {
  title: string;
  items: Record<string, unknown>[];
}

export interface DynamicItemSizeSectionMatrixProps extends Omit<
  UiTypes.MatrixProps,
  "data" | "itemSize" | "autoItemSize" | "estimatedItemSize" | "columns" | "square" | "waterfall" | "reorder" | "menu"
> {
  data?: DynamicItemSizeSectionMatrixSection[];
  fixedItemHeight?: number;
  minItemWidth?: number;
  maxColumns?: number;
  spacing?: number;
}

export interface DynamicItemSizeSectionMatrixEvents extends Omit<
  UiTypes.MatrixEvents,
  "itemSize" | "reorderBegan" | "reorderMoved" | "canMoveItem" | "reorderFinished"
> {
  itemHeight?: (width: number) => number;
}

function _getColumnsAndItemSizeWidth(
  containerWidth: number,
  minItemWidth: number,
  maxColumns: number,
  spacing: number,
) {
  if (minItemWidth > containerWidth - 2 * spacing) {
    return {
      columns: 1,
      itemSizeWidth: containerWidth - 2 * spacing,
    };
  }
  const columns = Math.max(
    Math.min(Math.floor((containerWidth - spacing) / (minItemWidth + spacing)), maxColumns),
    1, // 最少一列
  );
  const itemSizeWidth = Math.max(
    Math.floor((containerWidth - spacing * (columns + 1)) / columns),
    minItemWidth, // 最小宽度
  );
  return {
    columns,
    itemSizeWidth,
  };
}

function _getTextHeight(text: string, width: number) {
  return getTextHeight(text, {
    width,
    font: $font(13),
    inset: 0,
  });
}

/**
 * # CView Dynamic ItemSize Section Matrix
 *
 * 此组件是为了在 Dynamic ItemSize Matrix 的基础上添加 SectionTitle
 *
 * - 使用此组件必须在每个section中添加title，如果title为空字符串，依然添加高度35的空格(包含spacing)
 * - sectionTitle的字体为font(13)，左右边距为16（不含spacing），即总宽度为 totalWidth - 2 * spacing - 32
 * - 由于它必然和底下的item会有spacing，所以不建议spacing设的太大，那样会很违和
 * - sectionTitle会使得section之间的间隔增加自身的高度
 * - matrix事件会自动调整indexPath，包括didSelect、didLongPress、forEachItem
 * - matrix的方法都在该组件中重新实现，自动调整indexPath
 * - 不支持matrix原有的重新排序、自动大小功能，为防止sectionTitle暴露，也不支持menu
 * - 不支持Dynamic ItemSize Matrix的dynamicHeightEnabled、heightToWidth
 *
 * ## 动态调整 itemSize
 *
 * 动态的改变自己的 itemSize，从而使得 spacing 被优先满足。
 * 思路为在 matrix 上层套一个 superView，在旋转的时候 superView 会调用 matrix.relayout()
 * 和 matrix.reload()，从而触发 itemSize 事件
 *
 * 其排布逻辑是这样的:
 *
 * 1. 由 minItemWidth，spacing，maxColumns 这三个参数决定 cloumns，
 *    并结合 totalWidth 确定 itemSize.width
 * 2. 确定 itemHeight 有两种方法:
 *    - fixedItemHeight 固定高度，优先级第二
 *    - event: itemHeight(width) => height 通过 width 动态计算，优先级最高
 * 3. 如果 minItemWidth 比 totalWidth - 2 * spacing 还要小，那么 itemSize.width
 *    会被设定为 totalWidth - 2 * spacing，以保证item不会超出边框
 *
 * ## props:
 *
 * 可以使用 matrix 的全部属性。
 *
 * 但data的类型调整为：
 * { title: string; items: Record<string, unknown>[] }
 *
 * 特殊属性:
 *
 * - fixedItemHeight 固定 itemSize 高度
 * - minItemWidth 最小的 itemSize 宽度
 * - maxColumns 最大列数
 * - spacing
 *
 * events:
 *
 * 可以使用 matrix 除 itemSize 以外的全部事件
 *
 * 其他特殊事件:
 *
 * - itemHeight: width => height 通过 itemWidth 动态计算 itemHeight
 *
 *
 * 方法:
 * - get data
 * - set data
 * - reload(): void;
 * - object(indexPath: NSIndexPath): any;
 * - insert(args: { indexPath: NSIndexPath;value: any; } ): void;
 * - delete(indexPathOrIndex: NSIndexPath | number): void;
 * - cell(indexPath: NSIndexPath): AllUIView;
 * - scrollTo(args: { indexPath: NSIndexPath; animated?: boolean }): void;
 */
export class DynamicItemSizeSectionMatrix extends Base<UIView, UiTypes.ViewOptions> {
  _defineView: () => UiTypes.ViewOptions;
  private _props: DynamicItemSizeSectionMatrixProps;
  private _data: DynamicItemSizeSectionMatrixSection[];
  private _events: DynamicItemSizeSectionMatrixEvents;
  private _itemSizeWidth: number;
  private _itemSizeHeight: number;
  private _totalWidth: number = 0;
  private _columns: number = 1;
  private _fixedItemHeight: number;
  private _minItemWidth: number;
  private _maxColumns: number;
  private _spacing: number;
  matrix: Matrix;
  constructor({
    props,
    layout,
    events,
  }: {
    props: DynamicItemSizeSectionMatrixProps;
    layout: (make: MASConstraintMaker, view: UIView) => void;
    events: DynamicItemSizeSectionMatrixEvents;
  }) {
    super();
    this._props = props;
    this._data = this._props.data ?? [];
    this._events = events;
    this._itemSizeWidth = 0;
    this._itemSizeHeight = 0;
    this._fixedItemHeight = this._props.fixedItemHeight ?? 96;
    this._minItemWidth = this._props.minItemWidth ?? 96;
    this._maxColumns = this._props.maxColumns ?? 5;
    this._spacing = this._props.spacing ?? 6;
    const { itemHeight, didSelect, didLongPress, forEachItem, ...otherEvents } = this._events;
    this.matrix = new Matrix({
      props: {
        ...props,
        data: this._mapData(this._data),
        template: this._mapTemplate(props.template),
      },
      layout: $layout.fill,
      events: {
        ...otherEvents,
        itemSize: (_sender, indexPath) => {
          if (this._totalWidth === 0) {
            return $size(0, 0);
          }
          if (indexPath.item === 0) {
            const width = Math.max(this._totalWidth - 2 * this._spacing, 32);
            const textHeight = _getTextHeight(this._data[indexPath.section].title, width - 32);
            const height = textHeight + 35 - this._spacing * (indexPath.section === 0 ? 1 : 2);
            return $size(width, height);
          } else {
            return $size(this._itemSizeWidth, this._itemSizeHeight);
          }
        },
        didSelect: didSelect
          ? (sender, indexPath) => {
              if (indexPath.item === 0) {
                return;
              } else {
                didSelect(
                  sender,
                  $indexPath(indexPath.section, indexPath.item - 1),
                  this._data[indexPath.section].items[indexPath.item - 1],
                );
              }
            }
          : undefined,
        didLongPress: didLongPress
          ? (sender, indexPath) => {
              if (indexPath.item === 0) {
                return;
              } else {
                didLongPress(
                  sender,
                  $indexPath(indexPath.section, indexPath.item - 1),
                  this._data[indexPath.section].items[indexPath.item - 1],
                );
              }
            }
          : undefined,
        forEachItem: forEachItem
          ? (sender, indexPath) => {
              if (indexPath.item === 0) {
                return;
              } else {
                forEachItem(sender, $indexPath(indexPath.section, indexPath.item - 1));
              }
            }
          : undefined,
      },
    });
    this._defineView = () => {
      return {
        type: "view",
        props: {
          id: this.id,
          bgcolor: $color("clear"),
        },
        layout,
        views: [this.matrix.definition],
        events: {
          layoutSubviews: (sender) => {
            sender.relayout();
            if (sender.frame.width === this._totalWidth) return;
            this._totalWidth = sender.frame.width;
            const { columns, itemSizeWidth } = _getColumnsAndItemSizeWidth(
              this._totalWidth,
              this._minItemWidth,
              this._maxColumns,
              this._spacing,
            );
            this._columns = columns;
            this._itemSizeWidth = itemSizeWidth;
            this._itemSizeHeight = this._events.itemHeight
              ? this._events.itemHeight(this._itemSizeWidth)
              : this._fixedItemHeight;
            this.matrix.view.reload();
          },
        },
      };
    };
  }

  private _mapData(data: DynamicItemSizeSectionMatrixSection[]) {
    return data.map((n) => {
      const mappedItems = n.items.map((n) => {
        return {
          __section_title__: { hidden: true },
          __original_template__: { hidden: false },
          ...n,
        };
      });
      return {
        title: "",
        items: [
          {
            __section_title__: { hidden: false },
            __section_title_label__: { text: n.title },
            __original_template__: { hidden: true },
          },
          ...mappedItems,
        ],
      };
    });
  }

  private _mapTemplate(template: UiTypes.MatrixProps["template"]): UiTypes.MatrixProps["template"] {
    if (!template) return;
    const newTemplate: UiTypes.MatrixProps["template"] = {
      views: [
        {
          type: "view",
          props: {
            id: "__section_title__",
          },
          layout: $layout.fill,
          views: [
            { 
              // 在这里放一个透明且无效果的button，从而取消item自己的highlight效果
              type: "button",
              props: {
                bgcolor: $color("clear"),
              },
              layout: $layout.fill,
            },
            {
              type: "label",
              props: {
                id: "__section_title_label__",
                bgcolor: $color("clear"),
                font: $font(13),
                textColor: $color("secondaryText"),
                lines: 0,
              },
              layout: (make, view) => {
                make.left.right.inset(16);
                make.bottom.inset(0);
              },
            },
          ],
        },
        {
          type: "view",
          props: {
            ...template.props,
            id: "__original_template__",
          },
          layout: $layout.fill,
          views: template.views,
        },
      ],
    };

    return newTemplate;
  }

  get data() {
    return this._data;
  }

  set data(data) {
    this._data = data;
    this.matrix.view.data = this._mapData(data);
    this.reload();
  }

  reload() {
    this.matrix.view.reload();
  }

  object(indexPath: NSIndexPath) {
    return this._data?.[indexPath.section]?.items[indexPath.item];
  }

  insert({ indexPath, value }: { indexPath: NSIndexPath; value: any }) {
    this._data?.[indexPath.section]?.items.splice(indexPath.item, 0, value);
    this.matrix.view.data = this._mapData(this._data);
    this.reload();
  }

  delete(indexPath: NSIndexPath): void {
    this._data?.[indexPath.section]?.items.splice(indexPath.item, 1);
    this.matrix.view.data = this._mapData(this._data);
    this.reload();
  }

  cell(indexPath: NSIndexPath): AllUIView {
    return this.matrix.view.cell($indexPath(indexPath.section, indexPath.item + 1));
  }

  scrollTo({ indexPath, animated }: { indexPath: NSIndexPath; animated?: boolean }): void {
    this.matrix.view.scrollTo({
      indexPath: $indexPath(indexPath.section, indexPath.item + 1),
      animated,
    });
  }
}
