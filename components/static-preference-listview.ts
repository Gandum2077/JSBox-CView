import { Base } from "./base";
import { getTextWidth } from "../utils/uitools";

/** 偏好列表支持的行类型标识。 */
type PreferenceCellTypes =
  | "string"
  | "secure"
  | "number"
  | "integer"
  | "stepper"
  | "boolean"
  | "slider"
  | "list"
  | "tab"
  | "date"
  | "info"
  | "interactive-info"
  | "link"
  | "symbol-action"
  | "action";

/** 偏好列表中的一个分区。 */
export interface PreferenceSection {
  /** 分区标题。 */
  title: string;
  /** 分区内的偏好设置行。 */
  rows: PrefsRow[];
}

/** 所有受支持偏好设置行的联合类型。 */
export type PrefsRow =
  | PrefsRowString
  | PrefsRowSecure
  | PrefsRowNumber
  | PrefsRowInteger
  | PrefsRowStepper
  | PrefsRowBoolean
  | PrefsRowSlider
  | PrefsRowList
  | PrefsRowTab
  | PrefsRowDate
  | PrefsRowInfo
  | PrefsRowInteractiveInfo
  | PrefsRowLink
  | PrefsRowSymbolAction
  | PrefsRowAction;

/** 所有偏好设置行共享的属性。 */
interface PrefsRowBase {
  /** 决定行外观和交互方式的类型标识。 */
  type: PreferenceCellTypes;
  /** 值收集键；未设置时该行不会出现在 `values` 中。 */
  key?: string;
  /** 行标题。 */
  title?: string;
  /** 行标题颜色，默认为系统主文本色。 */
  titleColor?: UIColor;
  /** 当前行的值通过控件发生变化后执行的回调。 */
  changedEvent?: () => void;
}

/** 可编辑的普通文本行。 */
export interface PrefsRowString extends PrefsRowBase {
  /** 普通文本行标识。 */
  type: "string";
  /** 当前文本值。 */
  value?: string;
  /** 输入提示文本。 */
  placeholder?: string;
  /** 右侧文本颜色，默认为系统主文本色。 */
  textColor?: UIColor;
}

/** 以掩码显示当前值的文本行。 */
export interface PrefsRowSecure extends PrefsRowBase {
  /** 密码文本行标识。 */
  type: "secure";
  /** 当前文本值；列表中仅显示掩码。 */
  value?: string;
  /** 输入提示文本。 */
  placeholder?: string;
  /** 右侧掩码文本颜色，默认为系统次要文本色。 */
  textColor?: UIColor;
}

/** 可编辑的浮点数行。 */
export interface PrefsRowNumber extends PrefsRowBase {
  /** 浮点数行标识。 */
  type: "number";
  /** 当前数值。 */
  value?: number;
  /** 输入提示文本。 */
  placeholder?: string;
  /** 右侧数值文本颜色，默认为系统主文本色。 */
  textColor?: UIColor;
  /** 允许的最小值。 */
  min?: number;
  /** 允许的最大值。 */
  max?: number;
}

/** 可编辑的整数行。 */
export interface PrefsRowInteger extends PrefsRowBase {
  /** 整数行标识。 */
  type: "integer";
  /** 当前整数值。 */
  value?: number;
  /** 输入提示文本。 */
  placeholder?: string;
  /** 右侧数值文本颜色，默认为系统主文本色。 */
  textColor?: UIColor;
  /** 允许的最小值。 */
  min?: number;
  /** 允许的最大值。 */
  max?: number;
}

/** 使用步进器调整数字的行。 */
export interface PrefsRowStepper extends PrefsRowBase {
  /** 步进器行标识。 */
  type: "stepper";
  /** 当前数值。 */
  value?: number;
  /** 允许的最小值，默认为 `0`。 */
  min?: number;
  /** 允许的最大值。 */
  max?: number;
}

/** 使用开关编辑布尔值的行。 */
export interface PrefsRowBoolean extends PrefsRowBase {
  /** 布尔开关行标识。 */
  type: "boolean";
  /** 当前开关状态。 */
  value?: boolean;
  /** 开启状态颜色，默认为 `#34C85A`。 */
  onColor?: UIColor;
  /** 开关滑块颜色。 */
  thumbColor?: UIColor;
}

/** 使用滑块调整数字的行。 */
export interface PrefsRowSlider extends PrefsRowBase {
  /** 滑块行标识。 */
  type: "slider";
  /** 当前滑块值。 */
  value?: number;
  /** 滑块最小值，默认为 `0`。 */
  min?: number;
  /** 滑块最大值，默认为 `1`。 */
  max?: number;
  /** 显示和保存时保留的小数位数，默认为 `1`。 */
  decimal?: number;
  /** 滑块已填充部分的颜色，默认为系统链接色。 */
  minColor?: UIColor;
  /** 滑块未填充部分的颜色。 */
  maxColor?: UIColor;
  /** 滑块按钮颜色。 */
  thumbColor?: UIColor;
}

/** 点击后从菜单中选择一个选项的行。 */
export interface PrefsRowList extends PrefsRowBase {
  /** 菜单选择行标识。 */
  type: "list";
  /** 当前选中项索引。 */
  value?: number;
  /** 可选文本列表。 */
  items: string[];
}

/** 使用分段选择器切换选项的行。 */
export interface PrefsRowTab extends PrefsRowBase {
  /** 分段选择行标识。 */
  type: "tab";
  /** 当前选中项索引；可使用 `-1` 表示不选中。 */
  value?: number;
  /** 分段选择器项目。 */
  items: string[];
}

/** 点击后通过日期选择器编辑日期的行。 */
export interface PrefsRowDate extends PrefsRowBase {
  /** 日期选择行标识。 */
  type: "date";
  /** 当前日期。 */
  value?: Date;
  /** 可选择的最早日期。 */
  min?: Date;
  /** 可选择的最晚日期。 */
  max?: Date;
  /** JSBox 日期选择模式，默认为 `2`。 */
  mode?: number;
  /** 日期选择器的分钟间隔。 */
  interval?: number;
}

/** 只读信息展示行。 */
export interface PrefsRowInfo extends PrefsRowBase {
  /** 只读信息行标识。 */
  type: "info";
  /** 右侧显示的信息文本。 */
  value?: string;
}

/** 点击后用弹窗展示信息的只读行。 */
export interface PrefsRowInteractiveInfo extends PrefsRowBase {
  /** 可交互信息行标识。 */
  type: "interactive-info";
  /** 右侧显示并在弹窗中展开的信息文本。 */
  value?: string;
  /** 弹窗是否提供复制操作，默认为 `false`。 */
  copyable?: boolean;
}

/** 点击后在 Safari 中打开 URL 的行。 */
export interface PrefsRowLink extends PrefsRowBase {
  /** 链接行标识。 */
  type: "link";
  /** 显示并打开的 URL。 */
  value?: string;
}

/** 在右侧显示 SF Symbol 并执行操作的行。 */
export interface PrefsRowSymbolAction extends PrefsRowBase {
  /** 图标操作行标识。 */
  type: "symbol-action";
  /** SF Symbol 名称。 */
  symbol?: string;
  /** 图标颜色，默认为系统主文本色。 */
  tintColor?: UIColor;
  /** 图标内容模式，默认为 `1`。 */
  contentMode?: number;
  /** 图标尺寸，默认为 `$size(24, 24)`。 */
  symbolSize?: JBSize;
  /** 点击该行时执行的操作。 */
  value?: () => void;
}

/** 以居中文本显示并执行操作的行。 */
export interface PrefsRowAction extends PrefsRowBase {
  /** 文本操作行标识。 */
  type: "action";
  /** 点击该行时执行的操作。 */
  value?: () => void;
  /** 是否使用红色危险操作样式，默认为 `false`。 */
  destructive?: boolean;
}

/** 点击行本身会触发交互的行类型。 */
export const selectableTypes = [
  "string",
  "secure",
  "number",
  "integer",
  "stepper",
  "list",
  "date",
  "interactive-info",
  "link",
  "symbol-action",
  "action",
];

/** 不参与 `values` 收集的展示与操作行类型。 */
export const excludedTypes = ["info", "interactive-info", "link", "symbol-action", "action"];

/** 以偏好设置行键名索引的值集合。 */
type PreferenceValues = { [key: string]: any };

/** 静态偏好列表支持的所有内部 Cell 实例。 */
type AllCells =
  | StringCell
  | SecureCell
  | NumberCell
  | IntegerCell
  | StepperCell
  | BooleanCell
  | SliderCell
  | ListCell
  | TabCell
  | DateCell
  | InteractiveInfoCell
  | InfoCell
  | LinkCell
  | SymbolActionCell
  | ActionCell;

/** 静态偏好设置行的基础 CView Cell。 */
abstract class Cell extends Base<UIView, UiTypes.ViewOptions> {
  abstract _type: string;
  _key?: string;
  _title?: string;
  _value?: any;
  _values: PreferenceValues;
  _titleColor: UIColor;
  _changedEvent?: () => void;
  _defineView: () => UiTypes.ViewOptions;
  constructor(
    {
      key,
      title,
      value,
      titleColor = $color("primaryText"),
      changedEvent,
    }: {
      key?: string;
      title?: string;
      value?: any;
      titleColor?: UIColor;
      changedEvent?: () => void;
    },
    values: PreferenceValues,
  ) {
    super();
    this._key = key;
    this._title = title;
    this._value = value;
    this._titleColor = titleColor;
    this._changedEvent = changedEvent;
    this._values = values;
    this._defineView = () => {
      return {
        type: "view",
        props: {
          selectable: selectableTypes.includes(this._type),
        },
        layout: $layout.fill,
        views: [this._defineTitleView(), this._defineValueView()],
      };
    };
  }

  set value(value) {
    if (this._handleValue) value = this._handleValue(value);
    if (this._key) this._values[this._key] = value;
    this._value = value;
  }

  get value() {
    return this._value;
  }

  get type() {
    return this._type;
  }

  get key() {
    return this._key;
  }

  abstract _handleValue(value: any): any;

  abstract _defineValueView(): UiTypes.AllViewOptions;

  _defineTitleView(): UiTypes.LabelOptions {
    return {
      type: "label",
      props: {
        id: "title",
        text: this._title,
        textColor: this._titleColor,
        font: $font(17),
      },
      layout: (make, view) => {
        make.centerY.equalTo(view.super);
        make.width.equalTo(getTextWidth(this._title || ""));
        make.left.inset(15);
      },
    };
  }
}

/** 文本、密码和数字输入行共享的基础 Cell。 */
abstract class BaseStringCell extends Cell {
  abstract _type: string;
  _placeholder?: string;
  _textColor?: UIColor;
  constructor(props: PrefsRowString | PrefsRowSecure | PrefsRowNumber | PrefsRowInteger, values: PreferenceValues) {
    super(props, values);
    const { placeholder, textColor } = props;
    this._placeholder = placeholder;
    this._textColor = textColor;
  }

  _defineValueView(): UiTypes.AllViewOptions {
    return {
      type: "view",
      props: {},
      layout: (make, view) => {
        make.top.bottom.inset(0);
        make.left.equalTo(view.prev.right).inset(10);
        make.right.inset(15);
      },
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
            id: "label",
            text: this._handleText(this._value)?.toString(),
            align: $align.right,
            font: $font(17),
            textColor: this._textColor,
            bgcolor: $color("clear"),
            userInteractionEnabled: false,
          },
          layout: (make, view) => {
            make.centerY.equalTo(view.super);
            make.left.inset(0);
            make.right.equalTo(view.prev.left).inset(5);
          },
        },
      ],
    };
  }

  _handleValue(text: string) {
    const result = this._handleText(text);
    const label = this.view.get("label") as UILabelView;
    if (result === undefined) label.text = "";
    else label.text = result.toString();
    return result;
  }

  abstract _handleText(text: string): string | number | undefined;
}

/** 普通文本输入 Cell。 */
class StringCell extends BaseStringCell {
  readonly _type = "string";
  constructor(props: PrefsRowString, values: PreferenceValues) {
    super(props, values);
  }

  _handleText(text: string) {
    return text;
  }
}

/** 使用掩码展示值的文本输入 Cell。 */
class SecureCell extends BaseStringCell {
  readonly _type = "secure";
  constructor(props: PrefsRowSecure, values: PreferenceValues) {
    super({ ...props, textColor: props.textColor ?? $color("secondaryText") }, values);
  }

  _handleText(text: string) {
    if (text) return "******";
    else return "";
  }

  _handleValue(text: string): string | undefined {
    const label = this.view.get("label") as UILabelView;
    label.text = this._handleText(text);
    return text;
  }
}

/** 浮点数输入 Cell。 */
class NumberCell extends BaseStringCell {
  readonly _type = "number";
  _min?: number;
  _max?: number;
  constructor(props: PrefsRowNumber, values: PreferenceValues) {
    super(props, values);
    const { min, max } = props;
    this._min = min;
    this._max = max;
  }

  _handleText(text: string): number | undefined {
    if (!text) return;
    const result = parseFloat(text);
    if (isNaN(result)) return;
    if (this._min !== undefined && result < this._min) return;
    if (this._max !== undefined && result > this._max) return;
    return result;
  }
}

/** 整数输入 Cell。 */
class IntegerCell extends BaseStringCell {
  readonly _type = "integer";
  _min: number;
  _max?: number;
  constructor(props: PrefsRowInteger, values: PreferenceValues) {
    super(props, values);
    const { min, max } = props;
    this._min = min || 0;
    this._max = max;
  }

  _handleText(text: string): number | undefined {
    if (!text) return;
    const result = parseInt(text);
    if (isNaN(result)) return;
    if (this._min !== undefined && result < this._min) return;
    if (this._max !== undefined && result > this._max) return;
    return result;
  }
}

/** 步进器 Cell。 */
class StepperCell extends Cell {
  readonly _type = "stepper";
  _max?: number;
  _min: number;
  constructor(props: PrefsRowStepper, values: PreferenceValues) {
    super(props, values);
    const { max, min } = props;
    this._max = max;
    this._min = min || 0;
  }

  _defineValueView(): UiTypes.ViewOptions {
    return {
      type: "view",
      props: {},
      views: [
        {
          type: "stepper",
          props: {
            id: "stepper",
            value: this._value || this._min,
            max: this._max,
            min: this._min,
          },
          layout: (make, view) => {
            make.centerY.equalTo(view.super);
            make.right.inset(0);
          },
          events: {
            changed: (sender) => {
              this.value = sender.value;
              if (this._changedEvent) this._changedEvent();
            },
          },
        },
        {
          type: "label",
          props: {
            id: "label",
            text: this._value || this._min,
            align: $align.right,
          },
          layout: (make, view) => {
            make.top.bottom.inset(0);
            make.right.equalTo(view.prev.left).inset(10);
            make.width.equalTo(30);
          },
        },
      ],
      layout: (make, view) => {
        make.top.bottom.inset(0);
        make.left.equalTo(view.prev.right).inset(10);
        make.right.inset(15);
      },
    };
  }

  _handleValue(num: number) {
    if (isNaN(num)) num = this._min;
    if (this._min !== undefined && num < this._min) num = this._min;
    if (this._max !== undefined && num > this._max) num = this._max;
    const label = this.view.get("label") as UILabelView;
    label.text = num.toString();
    const stepper = this.view.get("stepper") as UIStepperView;
    stepper.value = num;
    return num;
  }
}

/** 布尔开关 Cell。 */
class BooleanCell extends Cell {
  readonly _type = "boolean";
  _onColor: UIColor;
  _thumbColor?: UIColor;
  constructor(props: PrefsRowBoolean, values: PreferenceValues) {
    super(props, values);
    const { onColor = $color("#34C85A"), thumbColor } = props;
    this._onColor = onColor;
    this._thumbColor = thumbColor;
  }

  _defineValueView(): UiTypes.SwitchOptions {
    return {
      type: "switch",
      props: {
        id: "switch",
        on: this._value,
        onColor: this._onColor,
        thumbColor: this._thumbColor,
      },
      layout: (make, view) => {
        make.size.equalTo($size(51, 31));
        make.centerY.equalTo(view.super);
        make.right.inset(15);
      },
      events: {
        changed: (sender) => {
          this.value = sender.on;
          if (this._changedEvent) this._changedEvent();
        },
      },
    };
  }

  _handleValue(bool: boolean) {
    const switchView = this.view.get("switch") as UISwitchView;
    switchView.on = bool;
    return bool;
  }
}

/** 数值滑块 Cell。 */
class SliderCell extends Cell {
  readonly _type = "slider";
  _decimal: number;
  _min: number;
  _max: number;
  _minColor: UIColor;
  _maxColor?: UIColor;
  _thumbColor?: UIColor;
  constructor(props: PrefsRowSlider, values: PreferenceValues) {
    super(props, values);
    const { decimal = 1, min = 0, max = 1, minColor = $color("systemLink"), maxColor, thumbColor } = props;
    this._decimal = decimal;
    this._min = min;
    this._max = max;
    this._minColor = minColor;
    this._maxColor = maxColor;
    this._thumbColor = thumbColor;
  }

  _defineValueView(): UiTypes.ViewOptions {
    return {
      type: "view",
      props: {},
      views: [
        {
          type: "label",
          props: {
            id: "label",
            text: this._value.toFixed(this._decimal),
            align: $align.center,
          },
          layout: (make, view) => {
            make.top.right.bottom.inset(0);
            make.width.equalTo(44);
          },
        },
        {
          type: "slider",
          props: {
            id: "slider",
            value: this._value,
            max: this._max,
            min: this._min,
            minColor: this._minColor,
            maxColor: this._maxColor,
            thumbColor: this._thumbColor,
            continuous: true,
          },
          layout: (make, view) => {
            make.top.left.bottom.inset(0);
            make.right.equalTo(view.prev.left);
          },
          events: {
            changed: (sender) => {
              const adjustedValue = parseFloat(sender.value.toFixed(this._decimal));
              const label = sender.prev as UILabelView;
              label.text = adjustedValue.toString();
              if (this._key) {
                this._values[this._key] = adjustedValue;
                this._value = adjustedValue;
              }
            },
            touchesEnded: (sender) => {
              const adjustedValue = parseFloat(sender.value.toFixed(this._decimal));
              this.value = adjustedValue;
              if (this._changedEvent) this._changedEvent();
            },
          },
        },
      ],
      layout: (make, view) => {
        make.top.bottom.inset(0);
        make.left.lessThanOrEqualTo(view.prev.right).inset(10).priority(999);
        make.width.lessThanOrEqualTo(250);
        make.right.inset(15);
      },
    };
  }

  _handleValue(num: number) {
    if (isNaN(num)) num = this._min;
    if (this._min !== undefined && num < this._min) num = this._min;
    if (this._max !== undefined && num > this._max) num = this._max;
    const adjustedValue = parseFloat(num.toFixed(this._decimal));
    const label = this.view.get("label") as UILabelView;
    label.text = adjustedValue.toString();
    const slider = this.view.get("slider") as UISliderView;
    slider.value = adjustedValue;
    return adjustedValue;
  }
}

/** 菜单选择 Cell。 */
class ListCell extends Cell {
  readonly _type = "list";
  _items: string[];
  constructor(props: PrefsRowList, values: PreferenceValues) {
    super(props, values);
    const { items } = props;
    this._items = items;
  }

  _defineValueView(): UiTypes.ViewOptions {
    return {
      type: "view",
      props: {},
      layout: (make, view) => {
        make.top.bottom.inset(0);
        make.left.equalTo(view.prev.right).inset(10);
        make.right.inset(15);
      },
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
            id: "label",
            text: this._items[this._value],
            textColor: $color("secondaryText"),
            align: $align.right,
          },
          layout: (make, view) => {
            make.centerY.equalTo(view.super);
            make.left.inset(0);
            make.right.equalTo(view.prev.left).inset(5);
          },
        },
      ],
    };
  }

  _handleValue(num: number) {
    const label = this.view.get("label") as UILabelView;
    label.text = this._items[num];
    return num;
  }
}

/** 分段选择器 Cell。 */
class TabCell extends Cell {
  readonly _type = "tab";
  _items: string[];
  constructor(props: PrefsRowTab, values: PreferenceValues) {
    super(props, values);
    const { items, value = -1 } = props;
    this._items = items;
    this._value = value;
  }

  _defineValueView(): UiTypes.TabOptions {
    return {
      type: "tab",
      props: {
        id: "tab",
        items: this._items,
        index: this._value,
      },
      layout: (make, view) => {
        make.centerY.equalTo(view.super);
        make.height.equalTo(34);
        make.left.lessThanOrEqualTo(view.prev.right).inset(10).priority(999);
        make.width.lessThanOrEqualTo(250);
        make.right.inset(15);
      },
      events: {
        changed: (sender) => {
          this.value = sender.index;
          if (this._changedEvent) this._changedEvent();
        },
      },
    };
  }

  _handleValue(num: number) {
    const tab = this.view.get("tab") as UITabView;
    tab.index = num;
    return num;
  }
}

/**
 * 按 JSBox 日期选择模式格式化日期。
 * @param mode - 日期选择模式；`0` 和 `3` 输出时间，`1` 输出日期，其他值输出日期和时间。
 * @param date - 待格式化日期。
 * @returns 格式化结果；未提供日期时返回空字符串。
 */
export function dateToString(mode: number, date?: Date) {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  if (mode === 0 || mode === 3) {
    return `${hours}:${minutes}`;
  } else if (mode === 1) {
    return `${year}-${month}-${day}`;
  } else {
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }
}

/** 日期选择 Cell。 */
class DateCell extends Cell {
  readonly _type = "date";
  _mode: number;
  _interval?: number;
  _min?: Date;
  _max?: Date;
  constructor(props: PrefsRowDate, values: PreferenceValues) {
    super(props, values);
    const { mode, min, max, interval } = props;
    this._mode = mode || 2;
    this._min = min;
    this._max = max;
    this._interval = interval;
  }

  _defineValueView(): UiTypes.ViewOptions {
    return {
      type: "view",
      props: {},
      layout: (make, view) => {
        make.top.bottom.inset(0);
        make.left.equalTo(view.prev.right).inset(10);
        make.right.inset(15);
      },
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
            id: "label",
            text: dateToString(this._mode, this._value),
            textColor: $color("secondaryText"),
            align: $align.right,
          },
          layout: (make, view) => {
            make.centerY.equalTo(view.super);
            make.left.inset(0);
            make.right.equalTo(view.prev.left).inset(5);
          },
        },
      ],
    };
  }

  _handleValue(date: Date) {
    const label = this.view.get("label") as UILabelView;
    label.text = dateToString(this._mode, date);
    return date;
  }
}

/** 只读信息 Cell。 */
class InfoCell extends Cell {
  readonly _type = "info";
  constructor(props: PrefsRowInfo, values: PreferenceValues) {
    super(props, values);
  }

  _defineValueView(): UiTypes.LabelOptions {
    return {
      type: "label",
      props: {
        id: "label",
        text: this._value,
        textColor: $color("secondaryText"),
        align: $align.right,
      },
      layout: (make, view) => {
        make.top.bottom.inset(0);
        make.left.equalTo(view.prev.right).inset(10);
        make.right.inset(15);
      },
    };
  }

  _handleValue(text: string) {
    const label = this.view.get("label") as UILabelView;
    label.text = text;
    return text;
  }
}

/** 点击后用弹窗展开内容的只读信息 Cell。 */
class InteractiveInfoCell extends Cell {
  readonly _type = "interactive-info";
  _copyable: boolean;
  constructor(props: PrefsRowInteractiveInfo, values: PreferenceValues) {
    super(props, values);
    const { copyable = false } = props;
    this._copyable = copyable;
  }

  _defineValueView(): UiTypes.LabelOptions {
    return {
      type: "label",
      props: {
        id: "label",
        text: this._value,
        textColor: $color("secondaryText"),
        align: $align.right,
      },
      layout: (make, view) => {
        make.top.bottom.inset(0);
        make.left.equalTo(view.prev.right).inset(10);
        make.right.inset(15);
      },
    };
  }

  _handleValue(text: string) {
    const label = this.view.get("label") as UILabelView;
    label.text = text;
    return text;
  }
}

/** 使用 Safari 打开 URL 的链接 Cell。 */
class LinkCell extends Cell {
  readonly _type = "link";
  constructor(props: PrefsRowLink, values: PreferenceValues) {
    super(props, values);
  }

  _defineValueView(): UiTypes.LabelOptions {
    return {
      type: "label",
      props: {
        id: "label",
        styledText: {
          text: this._value,
          font: $font(17),
          styles: [
            {
              range: $range(0, this._value.length),
              link: this._value,
            },
          ],
        },
        align: $align.right,
      },
      layout: (make, view) => {
        make.top.bottom.inset(0);
        make.left.equalTo(view.prev.right).inset(10);
        make.right.inset(15);
      },
    };
  }

  _handleValue(text: string) {
    const label = this.view.get("label") as UILabelView;
    label.styledText = {
      text,
      font: $font(17),
      styles: [
        {
          range: $range(0, text.length),
          link: text,
        },
      ],
    };
    return text;
  }
}

/** 在右侧显示 SF Symbol 的操作 Cell。 */
class SymbolActionCell extends Cell {
  readonly _type = "symbol-action";
  _symbol: string;
  _tintColor: UIColor;
  _contentMode: number;
  _symbolSize: JBSize;
  constructor(props: PrefsRowSymbolAction, values: PreferenceValues) {
    super(props, values);
    this._symbol = props.symbol || "";
    this._tintColor = props.tintColor ?? $color("primaryText");
    this._contentMode = props.contentMode ?? 1;
    this._symbolSize = props.symbolSize ?? $size(24, 24);
  }

  _defineValueView(): UiTypes.ImageOptions {
    return {
      type: "image",
      props: {
        id: "image",
        symbol: this._symbol,
        tintColor: this._tintColor,
        contentMode: this._contentMode,
      },
      layout: (make, view) => {
        make.centerY.equalTo(view.super);
        make.size.equalTo(this._symbolSize);
        make.right.inset(15);
      },
    };
  }

  _handleValue() {
    return;
  }
}

/** 可操作的 Cell。 */
class ActionCell extends Cell {
  readonly _type = "action";
  _destructive: boolean;
  constructor(props: PrefsRowAction, values: PreferenceValues) {
    super(props, values);
    const { destructive = false } = props;
    this._destructive = destructive;
    this._values = values;
  }

  _defineTitleView(): UiTypes.LabelOptions {
    return {
      type: "label",
      props: {},
      layout: (make) => make.width.equalTo(0),
    };
  }

  _defineValueView(): UiTypes.LabelOptions {
    return {
      type: "label",
      props: {
        text: this._title,
        textColor: this._destructive ? $color("red") : $color("systemLink"),
      },
      layout: (make, view) => {
        make.top.bottom.inset(0);
        make.left.equalTo(view.prev.left);
        make.left.right.inset(15);
      },
    };
  }

  _handleValue() {
    return;
  }
}

/** PreferenceListView 属性接口。 */
export type PreferenceListViewProps = Omit<UiTypes.ListProps, "data" | "template">;

/** PreferenceListView 事件接口。 */
export type PreferenceListViewEvents = {
  /** 用户修改任意可收集行后接收完整值对象。 */
  changed?: (values: { [key: string]: any }) => void;
};

/**
 * 使用独立 CView Cell 构建的静态偏好设置列表。
 *
 * 每一行都拥有独立视图和布局约束，标题宽度会按文本测量，右侧内容从标题之后开始布局；
 * 这比共享模板的 `DynamicPreferenceListView` 更适合标题或内容宽度差异较大的固定设置页。
 * 分区和 Cell 在构造时创建，组件不提供整体替换 `sections` 的能力；需要动态增删分区或行时应使用动态版本。
 *
 * 支持的行类型分为：
 *
 * - 输入：`string`、`secure`、`number`、`integer`。
 * - 直接控件：`stepper`、`boolean`、`slider`、`tab`。
 * - 选择器：`list`、`date`。
 * - 展示与操作：`info`、`interactive-info`、`link`、`symbol-action`、`action`。
 *
 * 带 `key` 且不是展示或操作类型的行会写入 `values`。用户修改值后，`changed` 事件会收到完整值对象；
 * `set` 用于程序化更新所有匹配键的 Cell，但不会触发 `changed`。List 的 `data` 和行点击处理由组件生成，
 * 不应通过 `props` 或其他事件覆盖。
 * @example
 * ```ts
 * const preferences = new PreferenceListView({
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
export class PreferenceListView extends Base<UIListView, UiTypes.ListOptions> {
  /** 根视图定义。 */
  _defineView: () => UiTypes.ListOptions;
  /** 构造时传入的固定分区数据。 */
  _sections: PreferenceSection[];
  /** 原生 List 属性，`data` 和 `template` 由组件生成。 */
  _props: PreferenceListViewProps;
  /** List 布局。 */
  _layout?: (make: MASConstraintMaker, view: UIListView) => void;
  /** 以行键名索引的当前值集合。 */
  _values: PreferenceValues;
  /** 按分区组织的内部静态 Cell。 */
  _cells: {
    /** 分区标题。 */
    title: string;
    /** 分区内的静态 Cell。 */
    rows: AllCells[];
  }[];

  /** 创建使用独立 CView Cell 的静态偏好设置列表。 */
  constructor({
    sections,
    props = {},
    layout,
    events = {},
  }: {
    /** 构造时固定的偏好设置分区。 */
    sections: PreferenceSection[];
    /** 原生 List 属性，`data` 和 `template` 由组件生成。 */
    props?: PreferenceListViewProps;
    /** List 布局。 */
    layout?: (make: MASConstraintMaker, view: UIListView) => void;
    /** 值变化事件。 */
    events?: PreferenceListViewEvents;
  }) {
    super();
    this._sections = sections;
    this._values = {};
    sections.forEach((section) => {
      section.rows.forEach((row) => {
        if (row.key && !excludedTypes.includes(row.type)) {
          this._values[row.key] = row.value;
        }
      });
    });
    this._props = props;
    this._layout = layout;
    this._cells = this._sections.map((section) => ({
      title: section.title,
      rows: section.rows.map((props) => {
        if (events.changed)
          props.changedEvent = () => {
            if (events.changed) events.changed(this.values);
          };
        return this._createCell(props);
      }),
    }));
    this._defineView = () => {
      return {
        type: "list",
        props: {
          style: 2,
          ...this._props,
          data: this._cells.map((section) => ({
            title: section.title,
            rows: section.rows.map((cell) => cell.definition),
          })),
        },
        layout: this._layout,
        events: {
          didSelect: (sender, indexPath, data) => {
            const cell = this._cells[indexPath.section].rows[indexPath.row];
            switch (cell._type) {
              case "string": {
                $input.text({
                  text: cell.value,
                  type: $kbType.default,
                  placeholder: cell._placeholder,
                  handler: (text) => {
                    cell.value = text;
                    if (cell._changedEvent) cell._changedEvent();
                  },
                });
                break;
              }
              case "secure": {
                $input.text({
                  text: "", // 密码框不填充之前的value
                  type: $kbType.default,
                  placeholder: cell._placeholder,
                  handler: (text) => {
                    cell.value = text;
                    if (cell._changedEvent) cell._changedEvent();
                  },
                });
                break;
              }
              case "number": {
                $input.text({
                  text: cell.value,
                  type: $kbType.decimal,
                  placeholder: cell._placeholder,
                  handler: (text) => {
                    cell.value = parseFloat(text);
                    if (cell._changedEvent) cell._changedEvent();
                  },
                });
                break;
              }
              case "integer": {
                $input.text({
                  text: cell.value,
                  type: $kbType.number,
                  placeholder: cell._placeholder,
                  handler: (text) => {
                    cell.value = parseInt(text);
                    if (cell._changedEvent) cell._changedEvent();
                  },
                });
                break;
              }
              case "list": {
                $ui.menu({
                  items: cell._items,
                  handler: (title, index) => {
                    cell.value = index;
                    if (cell._changedEvent) cell._changedEvent();
                  },
                });
                break;
              }
              case "date": {
                const props: any = {};
                if (cell.value) props.date = cell.value;
                if (cell._min) props.min = cell._min;
                if (cell._max) props.max = cell._max;
                if (cell._mode) props.mode = cell._mode;
                if (cell._interval) props.interval = cell._interval;
                $picker.date({
                  props: props,
                  handler: (date: Date) => {
                    cell.value = date;
                    if (cell._changedEvent) cell._changedEvent();
                  },
                });
                break;
              }
              case "interactive-info": {
                if (cell._copyable) {
                  $ui.alert({
                    title: cell._title,
                    message: cell.value,
                    actions: [
                      {
                        title: "取消",
                      },
                      {
                        title: "复制",
                        handler: () => {
                          $clipboard.text = cell.value;
                        },
                      },
                    ],
                  });
                } else {
                  $ui.alert({
                    title: cell._title,
                    message: cell.value,
                  });
                }
                break;
              }
              case "link": {
                $safari.open({ url: cell.value });
                break;
              }
              case "symbol-action": {
                if (cell.value) cell.value();
                break;
              }
              case "action": {
                if (cell.value) cell.value();
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
   * 根据行类型创建对应的静态 Cell。
   * @param props - 偏好设置行配置。
   * @returns 与行类型对应的 Cell 实例。
   * @throws 行类型不受支持时抛出错误。
   */
  private _createCell(props: PrefsRow) {
    switch (props.type) {
      case "string":
        return new StringCell(props, this._values);
      case "secure":
        return new SecureCell(props, this._values);
      case "number":
        return new NumberCell(props, this._values);
      case "integer":
        return new IntegerCell(props, this._values);
      case "stepper":
        return new StepperCell(props, this._values);
      case "boolean":
        return new BooleanCell(props, this._values);
      case "slider":
        return new SliderCell(props, this._values);
      case "list":
        return new ListCell(props, this._values);
      case "tab":
        return new TabCell(props, this._values);
      case "date":
        return new DateCell(props, this._values);
      case "info":
        return new InfoCell(props, this._values);
      case "interactive-info":
        return new InteractiveInfoCell(props, this._values);
      case "link":
        return new LinkCell(props, this._values);
      case "symbol-action":
        return new SymbolActionCell(props, this._values);
      case "action":
        return new ActionCell(props, this._values);
      default:
        throw new Error("Invalid cell type");
    }
  }

  /**
   * 获取所有带 `key` 的可存储行值。
   *
   * `info`、`interactive-info`、`link`、`symbol-action` 和 `action` 不会包含在结果中。
   * @returns 以行 `key` 为属性名的当前值对象。
   */
  get values() {
    return this._values;
  }

  /**
   * 更新所有匹配 `key` 的已加载 Cell。
   *
   * 此操作会同步 `values`，但不会触发 `changed` 事件。
   * @param key - 目标行键名。
   * @param value - 新值。
   */
  set(key: string, value: any) {
    this._cells.forEach((section) => {
      section.rows.forEach((row) => {
        if (row.key === key) row.value = value;
      });
    });
  }
}
