import { getTextHeight } from "../utils/uitools";
import { Base } from "./base";
import { Matrix } from "./single-views";

export interface DynamicItemSizeSectionMatrixSection {
  title: string;
  items: Record<string, unknown>[];
}

export interface DynamicItemSizeSectionMatrixCustomSection {
  title: Record<string, unknown>;
  titleHeight: number;
  items: Record<string, unknown>[];
}

export type DynamicItemSizeSectionMatrixAnySection =
  | DynamicItemSizeSectionMatrixSection
  | DynamicItemSizeSectionMatrixCustomSection;

export type DynamicItemSizeSectionMatrixTitleTemplate = NonNullable<UiTypes.MatrixProps["template"]>;

interface BaseProps extends Omit<
  UiTypes.MatrixProps,
  "data" | "itemSize" | "autoItemSize" | "estimatedItemSize" | "columns" | "square" | "waterfall" | "reorder" | "menu"
> {
  fixedItemHeight?: number;
  minItemWidth?: number;
  maxColumns?: number;
  spacing?: number;
}

type TitleProps<T extends DynamicItemSizeSectionMatrixAnySection> = [T] extends [
  DynamicItemSizeSectionMatrixCustomSection,
]
  ? { sectionTitleTemplate: DynamicItemSizeSectionMatrixTitleTemplate }
  : [T] extends [DynamicItemSizeSectionMatrixSection]
    ? { sectionTitleTemplate?: never }
    : never;

export type DynamicItemSizeSectionMatrixProps<
  T extends DynamicItemSizeSectionMatrixAnySection = DynamicItemSizeSectionMatrixSection,
> = BaseProps &
  TitleProps<T> & {
    data?: T[];
  };

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

const _defaultSectionTitleHorizontalInset = 10;

/**
 * # CView Dynamic ItemSize Section Matrix
 *
 * 此组件是为了在 Dynamic ItemSize Matrix 的基础上添加 SectionTitle。
 * SectionTitle 实际上是一个位于每个 section 首位的全宽 header cell，为兼容现有API继续使用title命名。
 *
 * 注意事项：
 * 1. 默认模式中每个section的title为字符串；空字符串依然添加高度35的空格(该高度包含spacing)
 * 2. 默认title的字体为font(13)，左右边距为10，即文本宽度为 totalWidth - 2 * spacing - 20
 * 3. 提供sectionTitleTemplate后进入自定义模式，title为模板数据，titleHeight为标题cell的实际高度（不包含spacing）
 * 4. sectionTitle会使得section之间的间隔增加自身的高度
 * 5. 由于sectionTitle必然和底下的item会有spacing，所以不建议spacing设的太大，那样会很违和
 * 6. 每个section会使用不可见item补齐最后一行，避免原生Flow Layout将未满行居中排列
 * 7. matrix事件会自动过滤sectionTitle和不可见item，并调整indexPath，包括didSelect、didLongPress、forEachItem
 * 8. matrix的方法都在该组件中重新实现，自动调整indexPath
 *
 * 不支持：
 * 1. 不支持matrix原有的重新排序、自动大小功能
 * 2. 为防止sectionTitle暴露，也不支持menu
 * 3. 不支持Dynamic ItemSize Matrix的dynamicHeightEnabled、heightToWidth
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
 * 默认模式的data类型为：
 * { title: string; items: Record<string, unknown>[] }
 *
 * 提供sectionTitleTemplate后，自定义模式的data类型为：
 * { title: Record<string, unknown>; titleHeight: number; items: Record<string, unknown>[] }
 *
 * 特殊属性:
 *
 * - sectionTitleTemplate 自定义section title模板；是否提供该属性即为模式开关
 * - fixedItemHeight 固定 itemSize 高度
 * - minItemWidth 最小的 itemSize 宽度
 * - maxColumns 最大列数
 * - spacing
 *
 * events:
 *
 * 可以使用 matrix 事件，但不包括 itemSize 以及与重新排序相关的事件
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
export class DynamicItemSizeSectionMatrix<
  TSection extends DynamicItemSizeSectionMatrixAnySection = DynamicItemSizeSectionMatrixSection,
> extends Base<UIView, UiTypes.ViewOptions> {
  _defineView: () => UiTypes.ViewOptions;
  private _props: DynamicItemSizeSectionMatrixProps<TSection>;
  private _data: TSection[];
  private _events: DynamicItemSizeSectionMatrixEvents;
  private _sectionTitleTemplate?: DynamicItemSizeSectionMatrixTitleTemplate;
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
    props: DynamicItemSizeSectionMatrixProps<TSection>;
    layout: (make: MASConstraintMaker, view: UIView) => void;
    events: DynamicItemSizeSectionMatrixEvents;
  }) {
    super();
    this._props = props;
    this._data = this._props.data ?? [];
    this._events = events;
    this._sectionTitleTemplate = props.sectionTitleTemplate;
    this._itemSizeWidth = 0;
    this._itemSizeHeight = 0;
    this._fixedItemHeight = this._props.fixedItemHeight ?? 96;
    this._minItemWidth = this._props.minItemWidth ?? 96;
    this._maxColumns = this._props.maxColumns ?? 5;
    this._spacing = this._props.spacing ?? 6;
    const { itemHeight, didSelect, didLongPress, forEachItem, ...otherEvents } = this._events;
    const { sectionTitleTemplate, ...matrixProps } = props;
    this.matrix = new Matrix({
      props: {
        ...matrixProps,
        spacing: this._spacing,
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
            const height = this._getSectionTitleHeight(indexPath.section, width);
            return $size(width, height);
          } else {
            return $size(this._itemSizeWidth, this._itemSizeHeight);
          }
        },
        didSelect: didSelect
          ? (sender, indexPath) => {
              if (!this._isOriginalItem(indexPath)) return;
              didSelect(
                sender,
                $indexPath(indexPath.section, indexPath.item - 1),
                this._data[indexPath.section].items[indexPath.item - 1],
              );
            }
          : undefined,
        didLongPress: didLongPress
          ? (sender, indexPath) => {
              if (!this._isOriginalItem(indexPath)) return;
              didLongPress(
                sender,
                $indexPath(indexPath.section, indexPath.item - 1),
                this._data[indexPath.section].items[indexPath.item - 1],
              );
            }
          : undefined,
        forEachItem: forEachItem
          ? (sender, indexPath) => {
              if (!this._isOriginalItem(indexPath)) return;
              forEachItem(sender, $indexPath(indexPath.section, indexPath.item - 1));
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
            const columnsChanged = columns !== this._columns;
            this._columns = columns;
            this._itemSizeWidth = itemSizeWidth;
            this._itemSizeHeight = this._events.itemHeight
              ? this._events.itemHeight(this._itemSizeWidth)
              : this._fixedItemHeight;
            if (columnsChanged) {
              this.matrix.view.data = this._mapData(this._data);
            }
            this.matrix.view.reload();
          },
        },
      };
    };
  }

  private _isOriginalItem(indexPath: NSIndexPath) {
    const itemCount = this._data[indexPath.section]?.items.length ?? 0;
    return indexPath.item > 0 && indexPath.item <= itemCount;
  }

  private _getSectionTitleHeight(section: number, width: number) {
    const sectionData = this._data[section];
    if (this._sectionTitleTemplate) {
      return Math.max((sectionData as DynamicItemSizeSectionMatrixCustomSection).titleHeight, 1);
    }
    const textHeight = _getTextHeight(
      (sectionData as DynamicItemSizeSectionMatrixSection).title,
      width - _defaultSectionTitleHorizontalInset * 2,
    );
    return textHeight + 35 - this._spacing * (section === 0 ? 1 : 2);
  }

  private _mapData(data: TSection[]) {
    return data.map((n) => {
      const mappedItems = n.items.map((n) => {
        return {
          __section_title__: { hidden: true },
          __placeholder__: { hidden: true },
          __original_template__: { hidden: false },
          ...n,
        };
      });
      const placeholderCount = (this._columns - (n.items.length % this._columns)) % this._columns;
      const placeholders = Array.from({ length: placeholderCount }, () => ({
        __section_title__: { hidden: true },
        __placeholder__: { hidden: false },
        __original_template__: { hidden: true },
      }));
      const titleData = this._sectionTitleTemplate
        ? {
            ...(n as DynamicItemSizeSectionMatrixCustomSection).title,
            __section_title__: { hidden: false },
            __placeholder__: { hidden: true },
            __original_template__: { hidden: true },
          }
        : {
            __section_title__: { hidden: false },
            __placeholder__: { hidden: true },
            __section_title_label__: {
              hidden: false,
              text: (n as DynamicItemSizeSectionMatrixSection).title,
            },
            __original_template__: { hidden: true },
          };
      return {
        title: "",
        items: [titleData, ...mappedItems, ...placeholders],
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
          views: this._sectionTitleTemplate
            ? [
                {
                  type: "view",
                  props: this._sectionTitleTemplate.props ?? {},
                  layout: $layout.fill,
                  views: this._sectionTitleTemplate.views,
                },
              ]
            : [
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
                    make.left.right.inset(_defaultSectionTitleHorizontalInset);
                    make.bottom.inset(0);
                  },
                },
                {
                  // 在这里放一个透明且无效果的button，从而取消item自己的highlight效果
                  type: "button",
                  props: {
                    bgcolor: $color("clear"),
                  },
                  layout: $layout.fill,
                },
              ],
        },
        {
          type: "view",
          props: {
            id: "__placeholder__",
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
