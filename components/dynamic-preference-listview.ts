import { Base } from "./base";
import {
  PreferenceSection,
  PrefsRow,
  PrefsRowSlider,
  selectableTypes,
  excludedTypes,
  dateToString,
} from "./static-preference-listview";

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

/** 动态列表中额外保存原始控件位置的滑块行。 */
interface DynamicPrefsRowSlider extends PrefsRowSlider {
  /** 共享模板 Slider 使用的 0～1 原始值，不参与对外的 `values`。 */
  innerValue: number;
}

/** 动态列表内部使用的行类型。 */
type DynamicPrefsRow = Exclude<PrefsRow, PrefsRowSlider> | DynamicPrefsRowSlider;

/** 动态列表内部使用的分区类型。 */
interface DynamicPreferenceSection extends Omit<PreferenceSection, "rows"> {
  rows: DynamicPrefsRow[];
}

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
  /** 根视图定义。 */
  _defineView: () => UiTypes.ListOptions;
  /** 组件内部持有的浅拷贝分区和行数据。 */
  private _sections: DynamicPreferenceSection[];
  /** 动态偏好列表的自定义模板布局调整项。 */
  private _customProps: Required<DynamicPreferenceListCustomProps>;

  /** 创建可动态替换分区的偏好设置列表。 */
  constructor({
    sections,
    props,
    layout,
    events = {},
  }: {
    /** 初始偏好设置分区。 */
    sections: PreferenceSection[];
    /** 原生 List 属性和共享模板布局调整项。 */
    props: DynamicPreferenceListProps;
    /** List 布局，默认使用 Base 中未设置的布局。 */
    layout?: (make: MASConstraintMaker, view: UIListView) => void;
    /** 值变化事件。 */
    events?: DynamicPreferenceListViewEvents<TValues>;
  }) {
    super();
    this._sections = this._cloneSections(sections);

    const {
      stringLeftInset = 120,
      infoAndLinkLeftInset = 120,
      sliderWidth = 200,
      tabWidth = 200,
      symbolSizeForSymbolAction = $size(24, 24),
      ...otherProps
    } = props;

    this._customProps = {
      stringLeftInset,
      infoAndLinkLeftInset,
      sliderWidth,
      tabWidth,
      symbolSizeForSymbolAction,
    };
    this._layout = layout;
    this._defineView = () => {
      return {
        type: "list",
        props: {
          style: 2,
          ...otherProps,
          template: {
            views: [
              {
                type: "view",
                props: {
                  id: "bgview",
                  bgcolor: $color("secondarySurface"),
                },
                layout: $layout.fill,
              },
              {
                type: "label",
                props: {
                  id: "title",
                  font: $font(17),
                },
                layout: (make, view) => {
                  make.top.bottom.inset(0);
                  make.left.right.inset(15);
                },
              },
              {
                type: "view",
                props: {},
                layout: (make, view) => {
                  make.top.bottom.inset(0);
                  make.left.right.inset(15);
                },
                views: [
                  {
                    type: "view",
                    props: {
                      id: "label_and_chevron",
                    },
                    layout: $layout.fill,
                    views: [
                      {
                        type: "image",
                        props: {
                          symbol: "chevron.right",
                          tintColor: $color("lightGray", "darkGray"),
                          contentMode: 1,
                        },
                        layout: (make, view) => {
                          make.centerY.equalTo(view.super);
                          make.size.equalTo($size(17, 17));
                          make.right.inset(0);
                        },
                      },
                      {
                        type: "label",
                        props: {
                          id: "label_before_chevron",
                          align: $align.right,
                          font: $font(17),
                        },
                        layout: (make, view) => {
                          make.centerY.equalTo(view.super);
                          make.left.inset(this._customProps.stringLeftInset - 15);
                          make.right.equalTo(view.prev.left).inset(5);
                        },
                      },
                    ],
                  },
                  {
                    type: "view",
                    props: {
                      id: "number_and_stepper",
                    },
                    layout: $layout.fill,
                    views: [
                      {
                        type: "stepper",
                        props: {
                          id: "stepper",
                        },
                        layout: (make, view) => {
                          make.centerY.equalTo(view.super);
                          make.right.inset(0);
                        },
                        events: {
                          changed: (sender) => {
                            const { section, row } = sender.info;
                            this._sections[section].rows[row].value = sender.value;
                            this.view.data = this._map(this._sections);
                            if (events.changed) events.changed(this.values);
                          },
                        },
                      },
                      {
                        type: "label",
                        props: {
                          id: "label_stepper",
                          align: $align.right,
                        },
                        layout: (make, view) => {
                          make.top.bottom.inset(0);
                          make.right.equalTo(view.prev.left).inset(10);
                          make.width.equalTo(100);
                        },
                      },
                    ],
                  },
                  {
                    type: "view",
                    props: {
                      id: "slider_and_number",
                    },
                    layout: $layout.fill,
                    views: [
                      {
                        type: "slider",
                        props: {
                          id: "slider",
                          min: 0,
                          max: 1,
                        },
                        layout: (make, view) => {
                          make.centerY.equalTo(view.super);
                          make.right.inset(40);
                          make.width.equalTo(this._customProps.sliderWidth - 40);
                        },
                        events: {
                          changed: (sender) => {
                            const { section, row } = sender.info;
                            const options = this._sections[section].rows[row] as DynamicPrefsRowSlider;
                            options.innerValue = sender.value;
                            const label = sender.next as UILabelView;
                            label.text = this._handleSliderValue(
                              this._sliderInnerValueToValue(options.innerValue, options.min, options.max),
                              options.decimal,
                              options.min,
                              options.max,
                            ).toString();
                          },
                          touchesEnded: (sender) => {
                            const { section, row } = sender.info;
                            const options = this._sections[section].rows[row] as DynamicPrefsRowSlider;
                            options.innerValue = sender.value;
                            options.value = this._handleSliderValue(
                              this._sliderInnerValueToValue(options.innerValue, options.min, options.max),
                              options.decimal,
                              options.min,
                              options.max,
                            );
                            this.view.data = this._map(this._sections);
                            if (events.changed) events.changed(this.values);
                          },
                        },
                      },
                      {
                        type: "label",
                        props: {
                          id: "label_slider",
                          align: $align.center,
                        },
                        layout: (make, view) => {
                          make.top.bottom.inset(0);
                          make.right.inset(0);
                          make.width.equalTo(44);
                        },
                      },
                    ],
                  },
                  {
                    type: "switch",
                    props: {
                      id: "switch",
                    },
                    layout: (make, view) => {
                      make.centerY.equalTo(view.super);
                      make.right.inset(0);
                    },
                    events: {
                      changed: (sender) => {
                        const { section, row } = sender.info;
                        this._sections[section].rows[row].value = sender.on;
                        this.view.data = this._map(this._sections);
                        if (events.changed) events.changed(this.values);
                      },
                    },
                  },
                  {
                    type: "tab",
                    props: {
                      id: "tab",
                    },
                    layout: (make, view) => {
                      make.centerY.equalTo(view.super);
                      make.height.equalTo(32);
                      make.width.equalTo(this._customProps.tabWidth);
                      make.right.inset(0);
                    },
                    events: {
                      changed: (sender) => {
                        const { section, row } = sender.info;
                        this._sections[section].rows[row].value = sender.index;
                        this.view.data = this._map(this._sections);
                        if (events.changed) events.changed(this.values);
                      },
                    },
                  },
                  {
                    type: "label",
                    props: {
                      id: "label_info_link",
                      align: $align.right,
                    },
                    layout: (make, view) => {
                      make.top.bottom.inset(0);
                      make.left.inset(this._customProps.infoAndLinkLeftInset);
                      make.right.inset(0);
                    },
                  },
                  {
                    type: "image",
                    props: {
                      id: "symbol",
                    },
                    layout: (make, view) => {
                      make.centerY.equalTo(view.super);
                      make.size.equalTo(this._customProps.symbolSizeForSymbolAction);
                      make.right.inset(0);
                    },
                  },
                ],
              },
            ],
          },
          data: this._map(this._sections),
        },
        layout: this._layout,
        events: {
          didSelect: (sender, indexPath, data) => {
            const row = this._sections[indexPath.section].rows[indexPath.row];
            if (!selectableTypes.includes(row.type)) return;
            switch (row.type) {
              case "string": {
                $input.text({
                  text: row.value,
                  type: $kbType.default,
                  placeholder: row.placeholder,
                  handler: (text) => {
                    row.value = text;
                    sender.data = this._map(this._sections);
                    if (events.changed) events.changed(this.values);
                  },
                });
                break;
              }
              case "secure": {
                $input.text({
                  text: "", // 密码框不填充之前的value
                  type: $kbType.default,
                  placeholder: row.placeholder,
                  handler: (text) => {
                    row.value = text;
                    sender.data = this._map(this._sections);
                    if (events.changed) events.changed(this.values);
                  },
                });
                break;
              }
              case "number": {
                $input.text({
                  text: row.value?.toString(),
                  type: $kbType.decimal,
                  placeholder: row.placeholder,
                  handler: (text) => {
                    let num = this._handleText(text, row.type);
                    if (num === undefined) return;
                    if (row.min !== undefined && num < row.min) num = row.min;
                    if (row.max !== undefined && num > row.max) num = row.max;
                    row.value = num;
                    sender.data = this._map(this._sections);
                    if (events.changed) events.changed(this.values);
                  },
                });
                break;
              }
              case "integer": {
                $input.text({
                  text: row.value?.toString(),
                  type: $kbType.number,
                  placeholder: row.placeholder,
                  handler: (text) => {
                    let num = this._handleText(text, row.type);
                    if (num === undefined) return;
                    if (row.min !== undefined && num < row.min) num = row.min;
                    if (row.max !== undefined && num > row.max) num = row.max;
                    row.value = num;
                    sender.data = this._map(this._sections);
                    if (events.changed) events.changed(this.values);
                  },
                });
                break;
              }
              case "list": {
                $ui.menu({
                  items: row.items,
                  handler: (title, index) => {
                    row.value = index;
                    sender.data = this._map(this._sections);
                    if (events.changed) events.changed(this.values);
                  },
                });
                break;
              }
              case "date": {
                const props: {
                  date?: Date;
                  min?: Date;
                  max?: Date;
                  mode?: number;
                  interval?: number;
                } = {};
                if (row.value) props.date = row.value;
                if (row.min) props.min = row.min;
                if (row.max) props.max = row.max;
                props.mode = row.mode ?? 2;
                if (row.interval) props.interval = row.interval;
                $picker.date({
                  props: props,
                  handler: (date: Date) => {
                    row.value = date;
                    sender.data = this._map(this._sections);
                    if (events.changed) events.changed(this.values);
                  },
                });
                break;
              }
              case "interactive-info": {
                if (row.copyable) {
                  $ui.alert({
                    title: row.title,
                    message: row.value,
                    actions: [
                      {
                        title: "取消",
                      },
                      {
                        title: "复制",
                        handler: () => {
                          $clipboard.text = row.value || "";
                        },
                      },
                    ],
                  });
                } else {
                  $ui.alert({
                    title: row.title,
                    message: row.value,
                  });
                }
                break;
              }
              case "link": {
                if (row.value) $safari.open({ url: row.value });
                break;
              }
              case "symbol-action": {
                if (row.value) row.value();
                break;
              }
              case "action": {
                if (row.value) row.value();
                break;
              }
              default:
                break;
            }
          },
        },
      };
    };
  }

  /**
   * 将输入文本转换为指定数字类型。
   * @param text - 用户输入文本。
   * @param type - `number`、`integer` 或 `stepper`。
   * @returns 转换后的数字；输入无效时返回 `undefined`。
   * @throws 传入不支持的类型时抛出错误。
   */
  private _handleText(text: string, type: string) {
    switch (type) {
      case "number": {
        const number = parseFloat(text);
        if (isNaN(number)) return;
        return number;
      }
      case "integer": {
        const number = parseInt(text);
        if (isNaN(number)) return;
        return number;
      }
      case "stepper": {
        const number = parseInt(text);
        if (isNaN(number)) return;
        return number;
      }
      default:
        throw new Error("Invalid type");
    }
  }

  /**
   * 将滑块值限制到有效范围并按精度取整。
   * @param num - 原始滑块值。
   * @param decimal - 保留的小数位数，默认为 `1`。
   * @param min - 可选最小值。
   * @param max - 可选最大值。
   * @returns 调整后的滑块值。
   */
  private _handleSliderValue(num?: number, decimal?: number, min?: number, max?: number): number {
    if (num === undefined) return min ?? 0;
    if (decimal === undefined) decimal = 1;
    if (isNaN(num)) num = min || 0;
    if (min !== undefined && num < min) num = min;
    if (max !== undefined && num > max) num = max;
    const adjustedValue = parseFloat(num.toFixed(decimal));
    return adjustedValue;
  }

  /**
   * 将对外滑块值转换为共享模板使用的 0～1 原始值。
   * @param value - 对外滑块值。
   * @param decimal - 对外值的小数位数。
   * @param minValue - 可选最小值。
   * @param maxValue - 可选最大值。
   * @returns Slider 控件使用的原始值。
   */
  private _sliderValueToInnerValue(value?: number, decimal?: number, minValue?: number, maxValue?: number) {
    const min = minValue ?? 0;
    const max = maxValue ?? 1;
    const range = max - min;
    if (range === 0) return 0;
    return (this._handleSliderValue(value, decimal, min, max) - min) / range;
  }

  /**
   * 将共享模板 Slider 的 0～1 原始值换算为对外数值域中的值。
   * @param innerValue - Slider 控件使用的原始值。
   * @param minValue - 可选最小值。
   * @param maxValue - 可选最大值。
   * @returns 尚未按 `decimal` 舍入的对外值。
   */
  private _sliderInnerValueToValue(innerValue: number, minValue?: number, maxValue?: number) {
    const min = minValue ?? 0;
    const max = maxValue ?? 1;
    return innerValue * (max - min) + min;
  }

  /**
   * 浅拷贝分区和行，并为每个滑块初始化独立的原始控件值。
   * @param sections - 对外传入的偏好设置分区。
   * @returns 动态列表内部使用的分区。
   */
  private _cloneSections(sections: PreferenceSection[]): DynamicPreferenceSection[] {
    return sections.map((section) => ({
      title: section.title,
      rows: section.rows.map((row): DynamicPrefsRow => {
        switch (row.type) {
          case "stepper":
            return { ...row, value: row.value ?? row.min ?? 0 };
          case "boolean":
            return { ...row, value: row.value ?? false };
          case "slider": {
            const value = this._handleSliderValue(row.value, row.decimal, row.min, row.max);
            return {
              ...row,
              value,
              innerValue: this._sliderValueToInnerValue(value, row.decimal, row.min, row.max),
            };
          }
          case "tab":
            return { ...row, value: row.value ?? -1 };
          default:
            return { ...row };
        }
      }),
    }));
  }

  /**
   * 将偏好设置分区映射为共享 List 模板使用的数据。
   * @param sections - 原始偏好设置分区。
   * @returns 可直接赋给 List `data` 的映射结果。
   */
  private _map(sections: DynamicPreferenceSection[]) {
    function generateDefaultRow(options: PrefsRow): any {
      return {
        bgview: { hidden: selectableTypes.includes(options.type) },
        // bgview其实是用于调整selectable, 显示此视图就没有highlight效果
        title: {
          text: options.title,
          textColor: options.titleColor || $color("primaryText"),
        }, // 标题, 同时用于action
        label_and_chevron: { hidden: true },
        // 用于string, secure, number, integer, list, date
        number_and_stepper: { hidden: true }, // 用于stepper
        slider_and_number: { hidden: true }, // 用于slider
        switch: { hidden: true }, // 用于boolean
        tab: { hidden: true }, // 用于tab
        label_info_link: { hidden: true }, // 用于info, link
        symbol: { hidden: true },
      };
    }
    return sections.map((section, sectionIndex) => ({
      title: section.title,
      rows: section.rows.map((n, rowIndex) => {
        const data = generateDefaultRow(n);
        switch (n.type) {
          case "string": {
            data.label_and_chevron.hidden = false;
            data.label_before_chevron = {
              textColor: n.textColor || $color("primaryText"),
              text: n.value === undefined ? "" : n.value,
            };
            break;
          }
          case "secure": {
            data.label_and_chevron.hidden = false;
            data.label_before_chevron = {
              textColor: n.textColor || $color("secondaryText"),
              text: n.value ? "******" : "",
            };
            break;
          }
          case "number": {
            data.label_and_chevron.hidden = false;
            data.label_before_chevron = {
              textColor: n.textColor || $color("primaryText"),
              text: n.value === undefined ? "" : n.value,
            };
            break;
          }
          case "integer": {
            data.label_and_chevron.hidden = false;
            data.label_before_chevron = {
              textColor: n.textColor || $color("primaryText"),
              text: n.value === undefined ? "" : n.value,
            };
            break;
          }
          case "stepper": {
            data.number_and_stepper.hidden = false;
            data.label_stepper = {
              textColor: $color("primaryText"),
              text: n.value === undefined ? "" : n.value,
            };
            data.stepper = {
              min: n.min,
              max: n.max,
              value: n.value,
              info: { section: sectionIndex, row: rowIndex, key: n.key },
            };
            break;
          }
          case "boolean": {
            data.switch = {
              hidden: false,
              on: n.value,
              onColor: n.onColor || $color("#34C85A"),
              thumbColor: n.thumbColor,
              info: { section: sectionIndex, row: rowIndex, key: n.key },
            };
            break;
          }
          case "slider": {
            data.slider_and_number.hidden = false;
            const adjustedValue = this._handleSliderValue(
              this._sliderInnerValueToValue(n.innerValue, n.min, n.max),
              n.decimal,
              n.min,
              n.max,
            );
            data.label_slider = {
              textColor: $color("primaryText"),
              text: adjustedValue,
            };
            data.slider = {
              value: n.innerValue,
              info: { section: sectionIndex, row: rowIndex, key: n.key },
              //min: n.min, // 不可用，否则会出现slider滑动结束变为0点的bug
              //max: n.max,
              minColor: n.minColor || $color("systemLink"),
              maxColor: n.maxColor,
              thumbColor: n.thumbColor,
            };
            break;
          }
          case "list": {
            data.label_and_chevron.hidden = false;
            data.label_before_chevron = {
              textColor: $color("secondaryText"),
              text: n.value === undefined ? "" : (n.items[n.value] ?? ""),
            };
            break;
          }
          case "tab": {
            data.tab = {
              hidden: false,
              items: n.items,
              index: n.value,
              info: { section: sectionIndex, row: rowIndex, key: n.key },
            };
            break;
          }
          case "date": {
            data.label_and_chevron.hidden = false;
            data.label_before_chevron = {
              hidden: false,
              textColor: $color("secondaryText"),
              text: dateToString(n.mode ?? 2, n.value),
            };
            break;
          }
          case "info": {
            data.label_info_link = {
              hidden: false,
              textColor: $color("secondaryText"),
              text: n.value,
            };
            break;
          }
          case "interactive-info": {
            data.label_info_link = {
              hidden: false,
              textColor: $color("secondaryText"),
              text: n.value,
            };
            break;
          }
          case "link": {
            data.label_info_link = {
              hidden: false,
              styledText: `[${n.value}]()`,
            };
            break;
          }
          case "symbol-action": {
            data.symbol = {
              hidden: n.symbol ? false : true,
              symbol: n.symbol,
              tintColor: n.tintColor ?? $color("primaryText"),
              contentMode: n.contentMode ?? 1,
            };
            break;
          }
          case "action": {
            data.title.textColor = n.destructive ? $color("red") : $color("systemLink");
            break;
          }
          default:
            break;
        }
        return data;
      }),
    }));
  }

  /**
   * 获取组件当前持有的偏好设置分区。
   * @returns 当前分区和行数据。
   */
  get sections(): PreferenceSection[] {
    return this._sections;
  }

  /**
   * 浅拷贝新的分区与行数据并刷新列表。
   * @param sections - 新的偏好设置分区。
   */
  set sections(sections: PreferenceSection[]) {
    this._sections = this._cloneSections(sections);
    this.view.data = this._map(this._sections);
  }

  /**
   * 收集所有带 `key` 的可存储行值。
   *
   * `info`、`interactive-info`、`link`、`symbol-action` 和 `action` 不会包含在结果中。
   * @returns 以行 `key` 为属性名的值对象。
   */
  get values(): TValues {
    const values: { [key: string]: any } = {};
    this._sections.forEach((section) => {
      section.rows.forEach((row) => {
        if (row.key && !excludedTypes.includes(row.type)) {
          values[row.key] = row.value;
        }
      });
    });
    return values as TValues;
  }

  /**
   * 更新所有匹配 `key` 的行并刷新列表。
   *
   * 此操作不会触发 `changed` 事件。
   * @param key - 目标行键名。
   * @param value - 新值。
   */
  set(key: string, value: any) {
    this._sections.forEach((section) => {
      section.rows.forEach((row) => {
        if (row.key !== key) return;
        row.value = value;
        if (row.type === "slider") {
          row.innerValue = this._sliderValueToInnerValue(value, row.decimal, row.min, row.max);
        }
      });
    });
    this.view.data = this._map(this._sections);
  }
}
