import { DynamicPreferenceModel } from "./internal/dynamic-preference-model";
import { Base } from "./base";
import { PreferenceSection } from "./static-preference-listview";

/** 动态偏好列表的自定义模板布局调整项。 */
export interface DynamicPreferenceListCustomProps {
  /** 文本、密码、数字、整数、列表和日期行右侧内容的左边界，默认为 `120`。 */
  stringLeftInset?: number;
  /** 信息与链接行右侧内容的左边界，默认为 `120`。 */
  infoAndLinkLeftInset?: number;
  /** 滑块区域宽度，默认为 `200`。 */
  sliderWidth?: number;
  /** 分段选择器宽度，默认为 `200`。 */
  tabWidth?: number;
  /** 图标操作行的图标尺寸，默认为 `$size(24, 24)`。 */
  symbolSizeForSymbolAction?: JBSize;
}

/** 动态偏好列表支持的原生 List 属性和模板布局调整项。 */
export type DynamicPreferenceListProps = Omit<UiTypes.ListProps, "data" | "template"> &
  DynamicPreferenceListCustomProps;

/** 动态偏好列表的事件接口。 */
export type DynamicPreferenceListViewEvents<TValues extends object = Record<string, unknown>> = {
  /** 用户修改任意可收集行后接收完整值对象。 */
  changed?: (values: TValues) => void;
};

/**
 * 使用共享模板、可动态替换分区数据的偏好设置列表。
 *
 * 支持与 `PreferenceListView` 相同的 15 种行类型，包括文本与数字输入、开关、步进器、滑块、
 * 列表或日期选择、信息展示、链接和操作行。带 `key` 且不是信息或操作类型的行会汇总到 `values`；
 * 用户修改值后，`changed` 事件会收到完整值对象。
 *
 * 与为每一行创建独立 CView 的 `PreferenceListView` 不同，本组件使用一套 List `template` 映射所有行。
 * 因此可以通过 `sections` setter 整体替换分区并立即刷新，适合配置项会动态增删的设置页或表单。
 * 相应的布局取舍是：标题和右侧内容不能按单个单元格独立分配宽度，文本过长时可能重叠；
 * 不可选状态也由覆盖视图模拟，点击时分隔线仍可能短暂闪动。
 *
 * 模板布局可通过以下属性统一调整：
 *
 * - `stringLeftInset`：文本、密码、数字、整数、列表和日期行的内容左边界，默认为 `120`。
 * - `infoAndLinkLeftInset`：信息和链接行的内容左边界，默认为 `120`。
 * - `sliderWidth` 与 `tabWidth`：滑块和分段选择器宽度，均默认为 `200`。
 * - `symbolSizeForSymbolAction`：图标操作行的图标尺寸，默认为 `$size(24, 24)`。
 *
 * `data` 和 `template` 由组件生成；程序化设置 `sections` 或调用 `set` 会刷新列表，但不会触发 `changed`。
 * @example
 * ```ts
 * const preferences = new DynamicPreferenceListView({
 *   sections: [
 *     {
 *       title: "通用",
 *       rows: [
 *         { type: "string", key: "name", title: "名称", value: "CView" },
 *         { type: "boolean", key: "enabled", title: "启用", value: true },
 *       ],
 *     },
 *   ],
 *   props: {},
 *   layout: $layout.fill,
 *   events: {
 *     changed: (values) => $cache.set("preferences", values),
 *   },
 * });
 * ```
 */
export class DynamicPreferenceListView<TValues extends object = Record<string, unknown>> extends Base<
  UIListView,
  UiTypes.ListOptions
> {
  private readonly _model: DynamicPreferenceModel<TValues>;

  /** 创建可动态替换分区的偏好设置列表。 */
  constructor({
    sections,
    props,
    layout,
    events = {},
  }: {
    sections: PreferenceSection[];
    props: DynamicPreferenceListProps;
    layout?: (make: MASConstraintMaker, view: UIListView) => void;
    events?: DynamicPreferenceListViewEvents<TValues>;
  }) {
    super();
    this._layout = layout;
    this._model = new DynamicPreferenceModel({
      sections,
      props,
      events,
      refresh: () => {
        if (this.view) this.view.data = this._model._defineView().props.data;
      },
    });
  }

  /**
   * 创建原生 List 定义。
   * @returns 原生列表定义。
   */
  protected _defineView = (): UiTypes.ListOptions => ({
    ...this._model._defineView(),
    layout: this._layout,
  });

  /**
   * 当前分区与行数据。
   * @returns 当前分区。
   */
  get sections(): PreferenceSection[] {
    return this._model.sections;
  }
  /**
   * 替换全部分区，不触发 changed。
   * @param sections - 新分区。
   */
  set sections(sections: PreferenceSection[]) {
    this._model.sections = sections;
  }

  /**
   * 收集所有带 key 的可存储行值。
   * @returns 完整值对象。
   */
  get values(): TValues {
    return this._model.values;
  }

  /**
   * 更新所有匹配的行，不触发 changed。
   * @param key - 行键名。
   * @param value - 新值。
   */
  set(key: string, value: any) {
    this._model.set(key, value);
  }
}
