import { Base } from "./base";
import { Matrix } from "./single-views";

/** 动态网格单元格的尺寸计算选项。 */
export interface ItemLayoutOptions {
  /** 期望的最小单元格宽度；容器过窄时会缩小以避免横向溢出。 */
  minItemWidth: number;
  /** 允许显示的最大列数。 */
  maxColumns: number;
  /** 单元格之间以及网格边缘的间距。 */
  spacing: number;
  /** 固定单元格高度，或根据最终单元格宽度计算高度的函数。 */
  itemHeight: number | ((width: number) => number);
}

/**
 * 动态尺寸网格的属性。
 *
 * 单元格尺寸、列数、自动尺寸、瀑布流和重新排序相关属性由组件接管，不能直接配置。
 */
export interface DynamicItemSizeMatrixProps extends Omit<
  UiTypes.MatrixProps,
  "itemSize" | "autoItemSize" | "estimatedItemSize" | "columns" | "square" | "waterfall" | "reorder"
> {
  /** 根据容器宽度计算列数和单元格尺寸的选项。 */
  itemLayoutOptions: ItemLayoutOptions;
}

/**
 * 动态尺寸网格支持的原生 Matrix 事件。
 *
 * `itemSize` 和重新排序相关事件由组件内部处理，不能覆盖。
 */
export type DynamicItemSizeMatrixEvents = Omit<
  UiTypes.MatrixEvents,
  "itemSize" | "reorderBegan" | "reorderMoved" | "canMoveItem" | "reorderFinished"
>;

/**
 * 根据容器宽度计算列数和单元格宽度。
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
 * 根据容器宽度自动调整列数和单元格尺寸的 CView 网格。
 *
 * 组件在原生 Matrix 外增加一层容器。当旋转设备、调整分屏或其他布局变化导致容器宽度改变时，
 * 它会重新计算尺寸并刷新 Matrix；宽度没有变化时不会重复刷新。
 *
 * 尺寸计算遵循以下规则：
 *
 * - 根据 `minItemWidth`、`maxColumns`、`spacing` 和容器宽度选择 `1...maxColumns` 列。
 * - 单元格宽度会填满扣除外边距与列间距后的可用空间；若容器连最小宽度也无法容纳，则使用单列并缩小宽度以避免溢出。
 * - `itemHeight` 可以是固定值，也可以根据最终单元格宽度动态计算。
 * - `heightToWidth` 使用当前数据量和相同的布局规则计算完整网格高度，可用于外部动态高度布局。
 *
 * 无法使用原生 Matrix 的单元格大小及重新排序相关的属性和事件，比如 `itemSize`、`autoItemSize`、`estimatedItemSize`、`columns`、
 * `square`、`waterfall`、`reorder` 等。其他 Matrix 属性和事件仍可正常使用，也可通过 `matrix` 访问底层包装器。
 * @example
 * ```ts
 * const matrix = new DynamicItemSizeMatrix({
 *   props: {
 *     data: [{ label: { text: "A" } }],
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
export class DynamicItemSizeMatrix extends Base<UIView, UiTypes.ViewOptions> {
  /** 当前使用的单元格布局选项。 */
  private _itemLayoutOptions: ItemLayoutOptions;
  /** 原始 Matrix 数据。 */
  private _data: UiTypes.MatrixProps["data"];
  /** 最近一次布局计算得到的单元格宽度。 */
  private _itemSizeWidth: number = 0;
  /** 最近一次布局计算得到的单元格高度。 */
  private _itemSizeHeight: number = 0;
  /** 最近一次测量到的容器宽度。 */
  private _totalWidth: number = 0;
  /** 最近一次布局计算得到的列数。 */
  private _columns: number = 1;
  /** 填满根容器的底层 Matrix 包装器。 */
  matrix: Matrix;
  /** 创建用于监听宽度变化的根容器定义。 */
  _defineView: () => UiTypes.ViewOptions;

  /** 创建根据容器宽度动态调整单元格尺寸的网格。 */
  constructor({
    props,
    layout,
    events = {},
  }: {
    /** Matrix 属性和动态尺寸选项。 */
    props: DynamicItemSizeMatrixProps;
    /** 根容器布局；必须能够确定可用宽度。 */
    layout: (make: MASConstraintMaker, view: UIView) => void;
    /** 未被组件接管的 Matrix 事件。 */
    events: DynamicItemSizeMatrixEvents;
  }) {
    super();
    this._itemLayoutOptions = props.itemLayoutOptions;
    this._data = props.data;
    this.matrix = new Matrix({
      props: {
        ...props,
        spacing: this._itemLayoutOptions.spacing,
      },
      layout: $layout.fill,
      events: {
        ...events,
        itemSize: (sender) => $size(this._itemSizeWidth, this._itemSizeHeight),
      },
    });
    this._defineView = () => {
      return {
        type: "view",
        props: {
          bgcolor: $color("clear"),
          id: this.id,
        },
        layout,
        events: {
          layoutSubviews: (sender) => {
            sender.relayout();
            if (sender.frame.width === this._totalWidth) return;
            this._totalWidth = sender.frame.width;
            this._reload();
          },
        },
        views: [this.matrix.definition],
      };
    };
  }

  /** 使用当前容器宽度重新计算尺寸并刷新底层 Matrix。 */
  private _reload() {
    const { columns, itemSizeWidth } = _getColumnsAndItemSizeWidth(
      this._totalWidth,
      this._itemLayoutOptions.minItemWidth,
      this._itemLayoutOptions.maxColumns,
      this._itemLayoutOptions.spacing,
    );
    this._columns = columns;
    this._itemSizeWidth = itemSizeWidth;
    this._itemSizeHeight =
      typeof this._itemLayoutOptions.itemHeight === "number"
        ? this._itemLayoutOptions.itemHeight
        : this._itemLayoutOptions.itemHeight(this._itemSizeWidth);
    this.matrix.view.reload();
  }

  /**
   * 计算给定宽度下完整网格所需的高度。
   * @param width - 可用容器宽度。
   * @returns 所有数据行及其上下、行间间距的总高度。
   */
  heightToWidth(width: number) {
    const { columns, itemSizeWidth } = _getColumnsAndItemSizeWidth(
      width,
      this._itemLayoutOptions.minItemWidth,
      this._itemLayoutOptions.maxColumns,
      this._itemLayoutOptions.spacing,
    );
    const rows = this._data ? Math.ceil(this._data.length / columns) : 0;
    const itemSizeHeight =
      typeof this._itemLayoutOptions.itemHeight === "number"
        ? this._itemLayoutOptions.itemHeight
        : this._itemLayoutOptions.itemHeight(itemSizeWidth);
    return rows * itemSizeHeight + (rows + 1) * this._itemLayoutOptions.spacing;
  }

  /**
   * 获取原始 Matrix 数据。
   * @returns 当前数据。
   */
  get data() {
    return this._data;
  }

  /**
   * 替换数据并更新已加载的底层 Matrix。
   * @param data - 新的 Matrix 数据。
   */
  set data(data) {
    this._data = data;
    this.matrix.view.data = data;
  }

  /**
   * 获取最近一次计算的单元格尺寸。
   * @returns 当前单元格尺寸；首次完成布局前宽高均为 `0`。
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
   * 获取最近一次计算的单元格宽度。
   * @returns 当前单元格宽度。
   */
  get itemSizeWidth() {
    return this._itemSizeWidth;
  }

  /**
   * 获取最近一次计算的单元格高度。
   * @returns 当前单元格高度。
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
   * 更新可变的单元格布局选项并立即重新计算布局。
   *
   * `spacing` 在 Matrix 创建后保持不变，不能通过此方法修改。
   * @param options - 新的最小宽度、最大列数和高度计算方式。
   */
  resetItemLayoutOptions(options: Omit<ItemLayoutOptions, "spacing">) {
    this._itemLayoutOptions = { ...options, spacing: this._itemLayoutOptions.spacing };
    this._reload();
  }
}
