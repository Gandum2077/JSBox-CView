import { getTextHeight } from "../utils/uitools";
import { Base } from "./base";
import { Matrix } from "./single-views";

/** 分区动态网格的单元格与标题布局选项。 */
export interface DynamicItemSizeSectionMatrixItemLayoutOptions {
  /** 期望的最小单元格宽度；容器过窄时会缩小以避免横向溢出。 */
  minItemWidth: number;
  /** 允许显示的最大列数。 */
  maxColumns: number;
  /** 单元格之间以及网格边缘的间距。 */
  spacing: number;
  /** 固定单元格高度，或根据最终单元格宽度计算高度的函数。 */
  itemHeight: number | ((width: number) => number);
  /** 对象形式分区标题使用的 Matrix 模板。 */
  sectionTitleTemplate?: UiTypes.MatrixProps["template"];
}

/** 分区动态网格中的一个原始数据分区。 */
export interface DynamicItemSizeSectionMatrixSection {
  /** 文本标题、自定义标题模板数据；为空字符串或 `undefined` 时不创建标题单元格。 */
  title?: string | Record<string, unknown>;
  /** 标题单元格的显式高度；仅在标题存在时生效，最小值为 `1`。 */
  titleHeight?: number;
  /** 分区内的原始 Matrix 数据项。 */
  items: Record<string, unknown>[];
}

/**
 * 分区动态网格的属性。
 *
 * 数据映射、单元格尺寸、列数、自动尺寸、瀑布流、重新排序和菜单由组件接管。
 */
export interface DynamicItemSizeSectionMatrixProps extends Omit<
  UiTypes.MatrixProps,
  "data" | "itemSize" | "autoItemSize" | "estimatedItemSize" | "columns" | "square" | "waterfall" | "reorder" | "menu"
> {
  /** 按分区组织的原始数据。 */
  data: DynamicItemSizeSectionMatrixSection[];
  /** 根据容器宽度计算列数、单元格和标题尺寸的选项。 */
  itemLayoutOptions: DynamicItemSizeSectionMatrixItemLayoutOptions;
}

/**
 * 分区动态网格支持的原生 Matrix 事件。
 *
 * `itemSize` 和重新排序相关事件由组件内部处理，不能覆盖。
 */
export type DynamicItemSizeSectionMatrixEvents = Omit<
  UiTypes.MatrixEvents,
  "itemSize" | "reorderBegan" | "reorderMoved" | "canMoveItem" | "reorderFinished"
>;

/**
 * 判断分区是否需要标题单元格。
 * @param title - 分区标题数据。
 * @returns 标题既不是 `undefined` 也不是空字符串时返回 `true`。
 */
function _isSectionTitlePresent(title: DynamicItemSizeSectionMatrixSection["title"]): boolean {
  return title !== undefined && title !== "";
}

/**
 * 根据容器宽度计算列数和普通单元格宽度。
 * @param containerWidth - 网格容器宽度。
 * @param minItemWidth - 期望的最小单元格宽度。
 * @param maxColumns - 最大列数。
 * @param spacing - 单元格和边缘间距。
 * @returns 至少一列的列数以及填充可用空间后的单元格宽度。
 */
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

/**
 * 使用默认分区标题字体测量文本高度。
 * @param text - 标题文本。
 * @param width - 标题文本可用宽度。
 * @returns 标题文本高度。
 */
function _getTextHeight(text: string, width: number) {
  return getTextHeight(text, {
    width,
    font: $font(13),
    inset: 0,
  });
}

const _defaultSectionTitleHorizontalInset = 10;

/**
 * 支持分区标题并根据容器宽度自动调整单元格尺寸的 CView 网格。
 *
 * 普通单元格使用与 `DynamicItemSizeMatrix` 相同的响应式列宽算法。分区标题并非原生 Matrix 标题，
 * 而是插入每个分区首位的全宽单元格；组件还会用不可见占位项补齐末行，避免原生 Flow Layout
 * 将不足一行的单元格居中。因此使用者始终通过本组件公开的数据、事件和方法操作原始索引：
 * `didSelect`、`didLongPress`、`forEachItem` 会过滤标题与占位项，并把 `indexPath` 还原到原始数据。
 *
 * 分区标题有三种模式：
 *
 * - 非空字符串使用内置的 `13` 号字体和 `10` 点水平边距；未指定 `titleHeight` 时按文本高度动态计算。
 * - 对象作为 `sectionTitleTemplate` 的数据源；应同时提供模板，未指定高度时使用默认标题高度。
 * - `undefined` 或空字符串不创建标题单元格，即使设置了 `titleHeight` 也不会生效。
 *
 * 显式 `titleHeight` 的最小值为 `1`。自动高度以 `35` 为基础，并扣除标题行周围由 Matrix
 * 额外产生的间距；字符串标题还会叠加实际文本高度。因此不建议使用过大的 `spacing`。
 *
 * 组件接管 `data`、`itemSize`、自动尺寸、列数、瀑布流、重新排序和 `menu`。宽度变化时会重新计算尺寸，
 * 并在列数变化时重建所需占位项；其他可用 Matrix 属性和事件仍可传入构造函数。
 * @example
 * ```ts
 * const matrix = new DynamicItemSizeSectionMatrix({
 *   props: {
 *     data: [{ title: "收藏", items: [{ label: { text: "A" } }] }],
 *     template: {
 *       views: [{ type: "label", props: { id: "label" }, layout: $layout.fill }],
 *     },
 *     itemLayoutOptions: {
 *       minItemWidth: 120,
 *       maxColumns: 4,
 *       spacing: 8,
 *       itemHeight: (width) => width * 0.75,
 *     },
 *   },
 *   layout: $layout.fill,
 *   events: {},
 * });
 * ```
 */
export class DynamicItemSizeSectionMatrix extends Base<UIView, UiTypes.ViewOptions> {
  /** 创建用于监听宽度变化的根容器定义。 */
  _defineView: () => UiTypes.ViewOptions;
  /** 当前使用的单元格和分区标题布局选项。 */
  private _itemLayoutOptions: DynamicItemSizeSectionMatrixItemLayoutOptions;
  /** 未插入标题与占位项的原始分区数据。 */
  private _data: DynamicItemSizeSectionMatrixSection[];
  /** 最近一次布局计算得到的普通单元格宽度。 */
  private _itemSizeWidth: number;
  /** 最近一次布局计算得到的普通单元格高度。 */
  private _itemSizeHeight: number;
  /** 最近一次测量到的容器宽度。 */
  private _totalWidth: number = 0;
  /** 最近一次布局计算得到的列数。 */
  private _columns: number = 1;
  /** 填满根容器的底层 Matrix 包装器。 */
  matrix: Matrix;

  /** 创建支持分区标题的动态尺寸网格。 */
  constructor({
    props,
    layout,
    events,
  }: {
    /** 分区数据、Matrix 属性和动态尺寸选项。 */
    props: DynamicItemSizeSectionMatrixProps;
    /** 根容器布局；必须能够确定可用宽度。 */
    layout: (make: MASConstraintMaker, view: UIView) => void;
    /** 未被组件接管的 Matrix 事件。 */
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

  /** 重新计算普通单元格尺寸，并在列数变化时重建内部占位项。 */
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

  /**
   * 判断内部索引是否指向原始数据项。
   * @param indexPath - 底层 Matrix 的内部索引。
   * @returns 索引未指向标题或占位项时返回 `true`。
   */
  private _isOriginalItem(indexPath: NSIndexPath) {
    const itemCount = this._data[indexPath.section]?.items.length ?? 0;
    const originalItemIndex = this._originalItemIndex(indexPath);
    return originalItemIndex >= 0 && originalItemIndex < itemCount;
  }

  /**
   * 判断指定分区是否包含标题单元格。
   * @param section - 分区索引。
   * @returns 分区标题存在时返回 `true`。
   */
  private _hasSectionTitle(section: number) {
    return _isSectionTitlePresent(this._data[section]?.title);
  }

  /**
   * 获取标题单元格造成的内部索引偏移。
   * @param section - 分区索引。
   * @returns 存在标题时返回 `1`，否则返回 `0`。
   */
  private _sectionTitleOffset(section: number) {
    return this._hasSectionTitle(section) ? 1 : 0;
  }

  /**
   * 将底层 Matrix 索引转换为原始数据项索引。
   * @param indexPath - 底层 Matrix 的内部索引。
   * @returns 扣除标题单元格偏移后的项目索引。
   */
  private _originalItemIndex(indexPath: NSIndexPath) {
    return indexPath.item - this._sectionTitleOffset(indexPath.section);
  }

  /**
   * 计算分区标题单元格高度。
   * @param section - 分区索引。
   * @param width - 标题单元格宽度。
   * @returns 显式高度或根据标题内容与间距计算出的高度，最小为 `1`。
   */
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

  /**
   * 将原始分区数据映射为底层 Matrix 使用的标题、项目和占位项。
   * @param data - 原始分区数据。
   * @returns 底层 Matrix 数据。
   */
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

  /**
   * 将调用方模板包装为可切换标题、占位项和原始内容的内部模板。
   * @param template - 原始 Matrix 项目模板。
   * @returns 供底层 Matrix 使用的组合模板；未提供模板时返回 `undefined`。
   */
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

  /**
   * 获取未插入标题与占位项的原始分区数据。
   * @returns 当前分区数据。
   */
  get data() {
    return this._data;
  }

  /**
   * 替换分区数据、重建内部数据并刷新底层 Matrix。
   * @param data - 新的原始分区数据。
   */
  set data(data) {
    this._data = data;
    this.matrix.view.data = this._mapData(data);
    this.reload();
  }

  /**
   * 获取最近一次计算的普通单元格尺寸。
   * @returns 当前普通单元格尺寸；首次完成布局前宽高均为 `0`。
   */
  get itemSize() {
    return $size(this._itemSizeWidth, this._itemSizeHeight);
  }

  /**
   * 获取最近一次测量到的容器宽度。
   * @returns 当前参与布局计算的总宽度。
   */
  get totalWidth() {
    return this._totalWidth;
  }

  /**
   * 获取最近一次计算的普通单元格宽度。
   * @returns 当前普通单元格宽度。
   */
  get itemSizeWidth() {
    return this._itemSizeWidth;
  }

  /**
   * 获取最近一次计算的普通单元格高度。
   * @returns 当前普通单元格高度。
   */
  get itemSizeHeight() {
    return this._itemSizeHeight;
  }

  /**
   * 获取最近一次计算的列数。
   * @returns 当前列数，首次完成布局前为 `1`。
   */
  get columns() {
    return this._columns;
  }

  /**
   * 计算给定宽度下所有分区所需的完整网格高度。
   *
   * 结果包含普通项目行、存在的标题行，以及每个分区内的行间和边缘间距。
   * @param width - 可用容器宽度。
   * @returns 完整网格高度；宽度不大于 `0` 时返回 `0`。
   */
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

  /** 刷新底层 Matrix 当前显示的内容。 */
  reload() {
    this.matrix.view.reload();
  }

  /**
   * 获取原始索引对应的数据项。
   * @param indexPath - 基于原始分区数据的索引。
   * @returns 对应的数据项；索引不存在时返回 `undefined`。
   */
  object(indexPath: NSIndexPath) {
    return this._data?.[indexPath.section]?.items[indexPath.item];
  }

  /**
   * 在原始分区中插入数据项并重建内部数据。
   * @param args - 插入位置和数据值。
   * @param args.indexPath - 基于原始分区数据的插入位置。
   * @param args.value - 待插入的数据值。
   */
  insert({ indexPath, value }: { indexPath: NSIndexPath; value: any }) {
    this._data?.[indexPath.section]?.items.splice(indexPath.item, 0, value);
    this.matrix.view.data = this._mapData(this._data);
    this.reload();
  }

  /**
   * 删除原始索引对应的数据项并重建内部数据。
   * @param indexPath - 基于原始分区数据的索引。
   */
  delete(indexPath: NSIndexPath): void {
    this._data?.[indexPath.section]?.items.splice(indexPath.item, 1);
    this.matrix.view.data = this._mapData(this._data);
    this.reload();
  }

  /**
   * 获取原始索引对应的已加载单元格。
   * @param indexPath - 基于原始分区数据的索引。
   * @returns 底层 Matrix 单元格视图。
   */
  cell(indexPath: NSIndexPath): AllUIView {
    return this.matrix.view.cell(
      $indexPath(indexPath.section, indexPath.item + this._sectionTitleOffset(indexPath.section)),
    );
  }

  /**
   * 滚动到原始索引对应的单元格。
   * @param args - 目标索引和滚动选项。
   * @param args.indexPath - 基于原始分区数据的目标索引。
   * @param args.animated - 是否播放滚动动画。
   */
  scrollTo({ indexPath, animated }: { indexPath: NSIndexPath; animated?: boolean }): void {
    this.matrix.view.scrollTo({
      indexPath: $indexPath(indexPath.section, indexPath.item + this._sectionTitleOffset(indexPath.section)),
      animated,
    });
  }

  /**
   * 更新可变的普通单元格布局选项并立即重新计算布局。
   *
   * `spacing` 和 `sectionTitleTemplate` 在 Matrix 创建后保持不变，不能通过此方法修改。
   * @param options - 新的最小宽度、最大列数和高度计算方式。
   */
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
