import { getTextHeight } from "../utils/uitools";
import { Base } from "./base";
import { Matrix } from "./single-views";

export interface DynamicItemSizeSectionMatrixItemLayoutOptions {
  minItemWidth: number;
  maxColumns: number;
  spacing: number;
  itemHeight: number | ((width: number) => number);
  sectionTitleTemplate?: UiTypes.MatrixProps["template"];
}

export interface DynamicItemSizeSectionMatrixSection {
  title?: string | Record<string, unknown>;
  titleHeight?: number;
  items: Record<string, unknown>[];
}

export interface DynamicItemSizeSectionMatrixProps extends Omit<
  UiTypes.MatrixProps,
  "data" | "itemSize" | "autoItemSize" | "estimatedItemSize" | "columns" | "square" | "waterfall" | "reorder" | "menu"
> {
  data: DynamicItemSizeSectionMatrixSection[];
  itemLayoutOptions: DynamicItemSizeSectionMatrixItemLayoutOptions;
}

export type DynamicItemSizeSectionMatrixEvents = Omit<
  UiTypes.MatrixEvents,
  "itemSize" | "reorderBegan" | "reorderMoved" | "canMoveItem" | "reorderFinished"
>;

function _isSectionTitlePresent(title: DynamicItemSizeSectionMatrixSection["title"]): boolean {
  return title !== undefined && title !== "";
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
 *
 * 1. 实现方式：SectionTitle 实际上是一个位于每个 section 首位的全宽 cell。
 * 2. 由特殊属性 itemLayoutOptions 控制整个布局方案。
 * 3. data 属性将重新定义。
 * 4. 不支持matrix原有的重新排序、自动大小功能。为防止sectionTitle和placeholder暴露，也不支持menu属性。
 * 5. 每个section会使用不可见item补齐最后一行，避免原生Flow Layout将未满行居中排列
 * 6. matrix事件会自动过滤sectionTitle和不可见item，并调整indexPath，包括didSelect、didLongPress、forEachItem
 * 7. matrix的方法都在该组件中重新实现，自动调整indexPath
 *
 * ## 特殊属性 itemLayoutOptions:
 *
 * - minItemWidth 最小的 itemSize 宽度
 * - maxColumns 最大列数
 * - spacing
 * - itemHeight: number | ((width: number) => number)
 * - sectionTitleTemplate?: UiTypes.MatrixProps["template"] SectionTitle 的模板
 *
 * 备注：由于sectionTitle必然和底下的item会有spacing，所以不建议spacing设的太大，那样会很违和。
 *
 * ## data 属性 DynamicItemSizeSectionMatrixSection
 *
 * ```
 * {
 *   title?: string | Record<string, unknown>;
 *   titleHeight?: number;
 *   items: Record<string, unknown>[];
 * }
 * ```
 *
 * 1. 根据 title 填入的内容，SectionTitle 有三种模式
 *   - 非空字符串: 仿照 iOS 列表视图的效果实现 section title。字体为font(13)，左右边距为10。
 *   - 自定义视图: 需要实现 sectionTitleTemplate 才会有实际效果，通过 Record<string, unknown> 类型的对象控制模板的实际效果。
 *   - title 为 undefined 或空字符串: 不实现 SectionTitle Cell
 *
 * 2. titleHeight SectionTitle 高度
 *   - 默认高度为 35 减去上下 spacing（如果为首行，只减去一个spacing）
 *   - 如果 title 为字符串且不为空，则添加字符串高度
 *   - 如果spacing过大导致计算高度小于1，高度将调整为1
 *
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
 * props:
 *
 * 可以使用 matrix 的属性，但不包括关于布局和重新排序相关的属性，以及menu:
 *
 * ```
 * "itemSize" | "autoItemSize" | "estimatedItemSize" | "columns" | "square" | "waterfall" | "reorder" | "menu"
 * ```
 *
 * 特殊属性 itemLayoutOptions:
 *
 * - minItemWidth 最小的 itemSize 宽度
 * - maxColumns 最大列数
 * - spacing
 * - itemHeight: number | ((width: number) => number)
 * - sectionTitleTemplate?: UiTypes.MatrixProps["template"] SectionTitle 的模板
 *
 * events:
 *
 * 可以使用 matrix 的事件，但不包括布局和重新排序相关的事件:
 *
 * ```
 * "itemSize" | "reorderBegan" | "reorderMoved" | "canMoveItem" | "reorderFinished"
 * ```
 *
 * 方法:
 * - heightToWidth(width: number): number 计算特定width时的应有的高度
 * - get data
 * - set data
 * - get itemSize: JBSize
 * - get totalWidth: number
 * - get itemSizeWidth: number
 * - get itemSizeHeight: number
 * - get columns: number
 * - resetItemLayoutOptions(options: Omit<DynamicItemSizeSectionMatrixItemLayoutOptions, "spacing"| "sectionTitleTemplate">): void
 *   重新设定ItemLayoutOptions，会触发一次重新布局但是不能更改spacing和sectionTitleTemplate
 * - reload(): void;
 * - object(indexPath: NSIndexPath): any;
 * - insert(args: { indexPath: NSIndexPath;value: any; } ): void;
 * - delete(indexPathOrIndex: NSIndexPath | number): void;
 * - cell(indexPath: NSIndexPath): AllUIView;
 * - scrollTo(args: { indexPath: NSIndexPath; animated?: boolean }): void;
 */
export class DynamicItemSizeSectionMatrix extends Base<UIView, UiTypes.ViewOptions> {
  _defineView: () => UiTypes.ViewOptions;
  private _itemLayoutOptions: DynamicItemSizeSectionMatrixItemLayoutOptions;
  private _data: DynamicItemSizeSectionMatrixSection[];
  private _itemSizeWidth: number;
  private _itemSizeHeight: number;
  private _totalWidth: number = 0;
  private _columns: number = 1;
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
    const { itemLayoutOptions, data, ...matrixProps } = props;
    this._itemLayoutOptions = itemLayoutOptions;
    this._data = data ?? [];
    this._itemSizeWidth = 0;
    this._itemSizeHeight = 0;
    const { didSelect, didLongPress, forEachItem, ...otherEvents } = events;
    this.matrix = new Matrix({
      props: {
        ...matrixProps,
        spacing: this._itemLayoutOptions.spacing,
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
          if (this._hasSectionTitle(indexPath.section) && indexPath.item === 0) {
            const width = Math.max(this._totalWidth - 2 * this._itemLayoutOptions.spacing, 32);
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
                $indexPath(indexPath.section, this._originalItemIndex(indexPath)),
                this._data[indexPath.section].items[this._originalItemIndex(indexPath)],
              );
            }
          : undefined,
        didLongPress: didLongPress
          ? (sender, indexPath) => {
              if (!this._isOriginalItem(indexPath)) return;
              didLongPress(
                sender,
                $indexPath(indexPath.section, this._originalItemIndex(indexPath)),
                this._data[indexPath.section].items[this._originalItemIndex(indexPath)],
              );
            }
          : undefined,
        forEachItem: forEachItem
          ? (sender, indexPath) => {
              if (!this._isOriginalItem(indexPath)) return;
              forEachItem(sender, $indexPath(indexPath.section, this._originalItemIndex(indexPath)));
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
            this._reload();
          },
        },
      };
    };
  }

  private _reload() {
    const { columns, itemSizeWidth } = _getColumnsAndItemSizeWidth(
      this._totalWidth,
      this._itemLayoutOptions.minItemWidth,
      this._itemLayoutOptions.maxColumns,
      this._itemLayoutOptions.spacing,
    );
    const columnsChanged = columns !== this._columns;
    this._columns = columns;
    this._itemSizeWidth = itemSizeWidth;
    this._itemSizeHeight =
      typeof this._itemLayoutOptions.itemHeight === "number"
        ? this._itemLayoutOptions.itemHeight
        : this._itemLayoutOptions.itemHeight(this._itemSizeWidth);
    if (columnsChanged) {
      this.matrix.view.data = this._mapData(this._data);
    }
    this.matrix.view.reload();
  }

  private _isOriginalItem(indexPath: NSIndexPath) {
    const itemCount = this._data[indexPath.section]?.items.length ?? 0;
    const originalItemIndex = this._originalItemIndex(indexPath);
    return originalItemIndex >= 0 && originalItemIndex < itemCount;
  }

  private _hasSectionTitle(section: number) {
    return _isSectionTitlePresent(this._data[section]?.title);
  }

  private _sectionTitleOffset(section: number) {
    return this._hasSectionTitle(section) ? 1 : 0;
  }

  private _originalItemIndex(indexPath: NSIndexPath) {
    return indexPath.item - this._sectionTitleOffset(indexPath.section);
  }

  private _getSectionTitleHeight(section: number, width: number): number {
    const sectionData = this._data[section];
    if (sectionData.titleHeight !== undefined) {
      return Math.max(sectionData.titleHeight, 1);
    } else if (typeof sectionData.title === "string" && sectionData.title) {
      const textHeight = _getTextHeight(sectionData.title, width - _defaultSectionTitleHorizontalInset * 2);
      return Math.max(textHeight + 35 - this._itemLayoutOptions.spacing * (section === 0 ? 1 : 2), 1);
    } else {
      return Math.max(35 - this._itemLayoutOptions.spacing * (section === 0 ? 1 : 2), 1);
    }
  }

  private _mapData(data: DynamicItemSizeSectionMatrixSection[]) {
    return data.map((n) => {
      const mappedItems = n.items.map((n) => {
        return {
          __section_title__: { hidden: true },
          __section_title_custom_view__: { hidden: true },
          __placeholder__: { hidden: true },
          __original_template__: { hidden: false },
          ...n,
        };
      });
      const placeholderCount = (this._columns - (n.items.length % this._columns)) % this._columns;
      const placeholders = Array.from({ length: placeholderCount }, () => ({
        __section_title__: { hidden: true },
        __section_title_custom_view__: { hidden: true },
        __placeholder__: { hidden: false },
        __original_template__: { hidden: true },
      }));
      const titleData =
        typeof n.title === "object"
          ? {
              ...n.title,
              __section_title__: { hidden: true },
              __section_title_custom_view__: { hidden: false },
              __placeholder__: { hidden: true },
              __original_template__: { hidden: true },
            }
          : {
              __section_title__: { hidden: false },
              __section_title_custom_view__: { hidden: true },
              __placeholder__: { hidden: true },
              __section_title_label__: {
                hidden: false,
                text: n.title,
              },
              __original_template__: { hidden: true },
            };
      return {
        title: "",
        items: [...(_isSectionTitlePresent(n.title) ? [titleData] : []), ...mappedItems, ...placeholders],
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
            ...this._itemLayoutOptions.sectionTitleTemplate?.props,
            id: "__section_title_custom_view__",
          },
          layout: $layout.fill,
          views: this._itemLayoutOptions.sectionTitleTemplate?.views ?? [],
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

  get itemSize() {
    return $size(this._itemSizeWidth, this._itemSizeHeight);
  }

  get totalWidth() {
    return this._totalWidth;
  }

  get itemSizeWidth() {
    return this._itemSizeWidth;
  }

  get itemSizeHeight() {
    return this._itemSizeHeight;
  }

  get columns() {
    return this._columns;
  }

  heightToWidth(width: number): number {
    if (width <= 0) return 0;

    const { columns, itemSizeWidth } = _getColumnsAndItemSizeWidth(
      width,
      this._itemLayoutOptions.minItemWidth,
      this._itemLayoutOptions.maxColumns,
      this._itemLayoutOptions.spacing,
    );
    const itemSizeHeight =
      typeof this._itemLayoutOptions.itemHeight === "number"
        ? this._itemLayoutOptions.itemHeight
        : this._itemLayoutOptions.itemHeight(itemSizeWidth);
    const sectionTitleWidth = Math.max(width - 2 * this._itemLayoutOptions.spacing, 32);

    return this._data.reduce((totalHeight, section, sectionIndex) => {
      const itemRows = Math.ceil(section.items.length / columns);
      const hasSectionTitle = _isSectionTitlePresent(section.title);
      const sectionTitleHeight = hasSectionTitle ? this._getSectionTitleHeight(sectionIndex, sectionTitleWidth) : 0;
      const rows = itemRows + (hasSectionTitle ? 1 : 0);
      return (
        totalHeight + itemRows * itemSizeHeight + sectionTitleHeight + (rows + 1) * this._itemLayoutOptions.spacing
      );
    }, 0);
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
    return this.matrix.view.cell(
      $indexPath(indexPath.section, indexPath.item + this._sectionTitleOffset(indexPath.section)),
    );
  }

  scrollTo({ indexPath, animated }: { indexPath: NSIndexPath; animated?: boolean }): void {
    this.matrix.view.scrollTo({
      indexPath: $indexPath(indexPath.section, indexPath.item + this._sectionTitleOffset(indexPath.section)),
      animated,
    });
  }

  resetItemLayoutOptions(
    options: Omit<DynamicItemSizeSectionMatrixItemLayoutOptions, "spacing" | "sectionTitleTemplate">,
  ) {
    this._itemLayoutOptions = {
      ...options,
      spacing: this._itemLayoutOptions.spacing,
      sectionTitleTemplate: this._itemLayoutOptions.sectionTitleTemplate,
    };
    this._reload();
  }
}
