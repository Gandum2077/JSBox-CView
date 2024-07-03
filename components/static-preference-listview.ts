import { Base } from "./base";
import { getTextWidth } from "../utils/uitools";

type PreferenceCellTypes = "string" | "number" | "integer" | "stepper" | "boolean" | "slider" | "list" | "tab" | "info" | "interactive-info" | "link" | "action";

export interface PreferenceSection {
  title: string;
  rows: PrefsRow[]
}

export type PrefsRow = PrefsRowString | PrefsRowNumber | PrefsRowInteger | PrefsRowStepper | PrefsRowBoolean | PrefsRowSlider | PrefsRowList | PrefsRowTab | PrefsRowInfo | PrefsRowInteractiveInfo | PrefsRowLink | PrefsRowAction;

interface PrefsRowBase {
  type: PreferenceCellTypes;
  key?: string;
  title?: string;
  titleColor?: UIColor;
  changedEvent?: () => void;
}

export interface PrefsRowString extends PrefsRowBase {
  type: "string";
  value?: string;
  placeholder?: string;
  textColor?: UIColor;
}

export interface PrefsRowNumber extends PrefsRowBase {
  type: "number";
  value?: number;
  placeholder?: string;
  textColor?: UIColor;
  min?: number;
  max?: number;
}

export interface PrefsRowInteger extends PrefsRowBase {
  type: "integer";
  value?: number;
  placeholder?: string;
  textColor?: UIColor;
  min?: number;
  max?: number;
}

export interface PrefsRowStepper extends PrefsRowBase {
  type: "stepper";
  value?: number;
  min?: number;
  max?: number;
}

export interface PrefsRowBoolean extends PrefsRowBase {
  type: "boolean";
  value?: boolean;
  onColor?: UIColor;
  thumbColor?: UIColor;
}

export interface PrefsRowSlider extends PrefsRowBase {
  type: "slider";
  value?: number;
  min?: number;
  max?: number;
  decimal?: number;
  minColor?: UIColor;
  maxColor?: UIColor;
  thumbColor?: UIColor;
}

export interface PrefsRowList extends PrefsRowBase {
  type: "list";
  value?: number;
  items: string[];
}

export interface PrefsRowTab extends PrefsRowBase {
  type: "tab";
  value?: number;
  items: string[];
}

export interface PrefsRowInfo extends PrefsRowBase {
  type: "info";
  value?: string;
}

export interface PrefsRowInteractiveInfo extends PrefsRowBase {
  type: "interactive-info";
  value?: string;
  copyable?: boolean;
}

export interface PrefsRowLink extends PrefsRowBase {
  type: "link";
  value?: string;
}

export interface PrefsRowAction extends PrefsRowBase {
  type: "action";
  value?: () => void;
  destructive?: boolean;
}

export const selectableTypes = [
  "string",
  "number",
  "integer",
  "stepper",
  "list",
  "interactive-info",
  "link",
  "action"
];

export const excludedTypes = [
  "info",
  "interactive-info",
  "link",
  "action"
];

type PreferenceValues = { [key: string]: any };

type AllCells = StringCell | NumberCell | IntegerCell | StepperCell | BooleanCell | SliderCell | ListCell | TabCell | InteractiveInfoCell | InfoCell | LinkCell | ActionCell;

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
      changedEvent
    }: {
      key?: string;
      title?: string;
      value?: any;
      titleColor?: UIColor;
      changedEvent?: () => void;
    }, values: PreferenceValues
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
          id: this.id
        },
        layout: $layout.fill,
        views: [this._defineTitleView(), this._defineValueView()]
      };
    }
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
        font: $font(17)
      },
      layout: (make, view) => {
        make.centerY.equalTo(view.super);
        make.width.equalTo(getTextWidth(this._title || ""));
        make.left.inset(15);
      }
    };
  }
}

abstract class BaseStringCell extends Cell {
  abstract _type: string;
  _placeholder?: string;
  _textColor?: UIColor;
  constructor(props: PrefsRowString | PrefsRowNumber | PrefsRowInteger, values: PreferenceValues) {
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
            contentMode: 1
          },
          layout: (make, view) => {
            make.centerY.equalTo(view.super);
            make.size.equalTo($size(17, 17));
            make.right.inset(0);
          }
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
            userInteractionEnabled: false
          },
          layout: (make, view) => {
            make.centerY.equalTo(view.super);
            make.left.inset(0);
            make.right.equalTo(view.prev.left).inset(5);
          }
        }
      ]
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

class StringCell extends BaseStringCell {
  readonly _type = "string"
  constructor(props: PrefsRowString, values: PreferenceValues) {
    super(props, values);
  }

  _handleText(text: string) {
    return text;
  }
}

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
            min: this._min
          },
          layout: (make, view) => {
            make.centerY.equalTo(view.super);
            make.right.inset(0);
          },
          events: {
            changed: sender => {
              this.value = sender.value;
              if (this._changedEvent) this._changedEvent();
            }
          }
        },
        {
          type: "label",
          props: {
            id: "label",
            text: this._value || this._min,
            align: $align.right
          },
          layout: (make, view) => {
            make.top.bottom.inset(0);
            make.right.equalTo(view.prev.left).inset(10);
            make.width.equalTo(30);
          }
        }
      ],
      layout: (make, view) => {
        make.top.bottom.inset(0);
        make.left.equalTo(view.prev.right).inset(10);
        make.right.inset(15);
      }
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
        thumbColor: this._thumbColor
      },
      layout: (make, view) => {
        make.size.equalTo($size(51, 31));
        make.centerY.equalTo(view.super);
        make.right.inset(15);
      },
      events: {
        changed: sender => {
          this.value = sender.on;
          if (this._changedEvent) this._changedEvent();
        }
      }
    };
  }

  _handleValue(bool: boolean) {
    const switchView = this.view.get("switch") as UISwitchView;
    switchView.on = bool;
    return bool;
  }
}

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
    const {
      decimal = 1,
      min = 0,
      max = 1,
      minColor = $color("systemLink"),
      maxColor,
      thumbColor
    } = props;
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
            align: $align.center
          },
          layout: (make, view) => {
            make.top.right.bottom.inset(0);
            make.width.equalTo(44);
          }
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
            continuous: true
          },
          layout: (make, view) => {
            make.top.left.bottom.inset(0);
            make.right.equalTo(view.prev.left);
          },
          events: {
            changed: sender => {
              const adjustedValue = parseFloat(
                sender.value.toFixed(this._decimal)
              );
              const label = sender.prev as UILabelView;
              label.text = adjustedValue.toString();
              if (this._key) {
                this._values[this._key] = adjustedValue;
                this._value = adjustedValue;
              }
            },
            touchesEnded: sender => {
              const adjustedValue = parseFloat(
                sender.value.toFixed(this._decimal)
              );
              this.value = adjustedValue;
              if (this._changedEvent) this._changedEvent();
            }
          }
        }
      ],
      layout: (make, view) => {
        make.top.bottom.inset(0);
        make.left.lessThanOrEqualTo(view.prev.right).inset(10).priority(999);
        make.width.lessThanOrEqualTo(250);
        make.right.inset(15);
      }
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
            contentMode: 1
          },
          layout: (make, view) => {
            make.centerY.equalTo(view.super);
            make.size.equalTo($size(17, 17));
            make.right.inset(0);
          }
        },
        {
          type: "label",
          props: {
            id: "label",
            text: this._items[this._value],
            textColor: $color("secondaryText"),
            align: $align.right
          },
          layout: (make, view) => {
            make.centerY.equalTo(view.super);
            make.left.inset(0);
            make.right.equalTo(view.prev.left).inset(5);
          }
        }
      ]
    };
  }

  _handleValue(num: number) {
    const label = this.view.get("label") as UILabelView;
    label.text = this._items[num];
    return num;
  }
}

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
        index: this._value
      },
      layout: (make, view) => {
        make.centerY.equalTo(view.super);
        make.height.equalTo(34);
        make.left.lessThanOrEqualTo(view.prev.right).inset(10).priority(999);
        make.width.lessThanOrEqualTo(250);
        make.right.inset(15);
      },
      events: {
        changed: sender => {
          this.value = sender.index;
          if (this._changedEvent) this._changedEvent();
        }
      }
    };
  }

  _handleValue(num: number) {
    const tab = this.view.get("tab") as UITabView;
    tab.index = num;
    return num;
  }
}

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
        align: $align.right
      },
      layout: (make, view) => {
        make.top.bottom.inset(0);
        make.left.equalTo(view.prev.right).inset(10);
        make.right.inset(15);
      }
    };
  }

  _handleValue(text: string) {
    const label = this.view.get("label") as UILabelView;
    label.text = text;
    return text;
  }
}

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
        align: $align.right
      },
      layout: (make, view) => {
        make.top.bottom.inset(0);
        make.left.equalTo(view.prev.right).inset(10);
        make.right.inset(15);
      }
    };
  }

  _handleValue(text: string) {
    const label = this.view.get("label") as UILabelView;
    label.text = text;
    return text;
  }
}

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
              link: this._value
            }
          ]
        },
        align: $align.right
      },
      layout: (make, view) => {
        make.top.bottom.inset(0);
        make.left.equalTo(view.prev.right).inset(10);
        make.right.inset(15);
      }
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
          link: text
        }
      ]
    };
    return text;
  }
}

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
      layout: make => make.width.equalTo(0)
    };
  }

  _defineValueView(): UiTypes.LabelOptions {
    return {
      type: "label",
      props: {
        text: this._title,
        textColor: this._destructive ? $color("red") : $color("systemLink")
      },
      layout: (make, view) => {
        make.top.bottom.inset(0);
        make.left.equalTo(view.prev.left);
        make.left.right.inset(15);
      }
    };
  }

  _handleValue() {
    return;
  }
}

/**
 * # cview PreferenceListView_static
 * 
 * 便捷的设置列表实现. 其所有 cell 均为静态 cell, 可以同时使用 list 控件的 props(除了 template, data)和 events(除了 didSelect), 同时具有独特方法 set(key, value), 以及独特方法 changed
 * 
 * sections 为 Array, 里面的 section 定义:
 * 
 * - title?: string 标题.
 * - rows: {type: string}[] 内容
 * 
 * row定义: 
 * 
 * - 通用:
 * 
 *     - type: string 类型. 包括'string', 'number', 'integer', 'stepper','boolean', 'slider', 'list', 'tab', 'interactive-info', 'info', 'link', 'action'
 *     - key?: string 键. 如没有则不会返回其值.
 *     - title?: string 标题
 *     - value?: any 在下面专项里详解.
 *     - titleColor?: $color = $color("primaryText") 标题颜色
 * 
 * -  string:
 * 
 *     - value?: string
 *     - placeholder?: string
 *     - textColor?: $color = $color("primaryText")
 * 
 * -  number, integer:
 * 
 *     - value?: number
 *     - placeholder?: string
 *     - textColor?: $color = $color("primaryText")
 *     - min?: number 最小值
 *     - max?: number 最大值
 * 
 * - stepper:
 * 
 *     - value?: number
 *     - placeholder?: string
 *     - min?: number 最小值
 *     - max?: number 最大值
 * 
 * - boolean:
 * 
 *     - value?: boolean
 *     - onColor?: $color = $color("#34C85A")
 *     - thumbColor
 * 
 * - slider:
 * 
 *     - value?: number 即 slider.value
 *     - decimal?: number = 1 精度
 *     - min?: number
 *     - max?: number
 *     - minColor?: $color = $color("systemLink")
 *     - maxColor?: $color
 *     - thumbColor?: $color
 * 
 * - list:
 * 
 *     - value?: number 即 index, -1 时为不选
 *     - items?: string[]
 * 
 * - tab:
 * 
 *     - value?: number 即 index, -1 时为不选
 *     - items?: string[]
 * 
 * - info:
 * 
 *     - value?: string
 * 
 * - interactive-info:
 * 
 *    - value?: string
 *    - copyable?: boolean = false
 * 
 * - link:
 * 
 *     - value?: string url
 * 
 * - action:
 * 
 *     - value?: function 点击后会执行的函数
 *     - destructive?: boolean = false 是否为危险动作，若是则为红色
 * 
 * Methods:
 * 
 * - set(key, value) 设定 key 对应的 value
 * - cview.values 获取全部的 values
 * 
 * Events:
 * 
 * - changed: values => {}
 */
export class PreferenceListView extends Base<UIListView, UiTypes.ListOptions> {
  _defineView: () => UiTypes.ListOptions;
  _sections: PreferenceSection[];
  _props: Partial<UiTypes.ListProps>;
  _layout?: (make: MASConstraintMaker, view: UIListView) => void;
  _values: PreferenceValues;
  _cells: {
    title: string;
    rows: AllCells[];
  }[];

  constructor({ sections, props = {}, layout, events = {} }: {
    sections: PreferenceSection[];
    props?: Partial<UiTypes.ListProps>;
    layout?: (make: MASConstraintMaker, view: UIListView) => void;
    events?: {
      changed?: (values: { [key: string]: any }) => void;
    };
  }) {
    super();
    this._sections = sections;
    this._values = {};
    sections.forEach(section => {
      section.rows.forEach(row => {
        if (row.key && !excludedTypes.includes(row.type)) {
          this._values[row.key] = row.value;
        }
      });
    });
    this._props = props;
    this._layout = layout;
    this._cells = this._sections.map(section => ({
      title: section.title,
      rows: section.rows.map(props => {
        if (events.changed)
          props.changedEvent = () => {
            if (events.changed) events.changed(this.values);
          };
        return this._createCell(props);
      })
    }));
    this._defineView = () => {

      return {
        type: "list",
        props: {
          style: 2,
          ...this._props,
          id: this.id,
          data: this._cells.map(section => ({
            title: section.title,
            rows: section.rows.map(cell => cell.definition)
          }))
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
                  handler: text => {
                    cell.value = text;
                    if (cell._changedEvent) cell._changedEvent();
                  }
                });
                break;
              }
              case "number": {
                $input.text({
                  text: cell.value,
                  type: $kbType.decimal,
                  placeholder: cell._placeholder,
                  handler: text => {
                    cell.value = parseFloat(text);
                    if (cell._changedEvent) cell._changedEvent();
                  }
                });
                break;
              }
              case "integer": {
                $input.text({
                  text: cell.value,
                  type: $kbType.number,
                  placeholder: cell._placeholder,
                  handler: text => {
                    cell.value = parseInt(text);
                    if (cell._changedEvent) cell._changedEvent();
                  }
                });
                break;
              }
              case "list": {
                $ui.menu({
                  items: cell._items,
                  handler: (title, index) => {
                    cell.value = index;
                    if (cell._changedEvent) cell._changedEvent();
                  }
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
                        title: "取消"
                      },
                      {
                        title: "复制",
                        handler: () => {
                          $clipboard.text = cell.value;
                        }
                      }
                    ]
                  })
                } else {
                  $ui.alert({
                    title: cell._title,
                    message: cell.value
                  });
                }
                break;
              }
              case "link": {
                $safari.open({ url: cell.value });
                break;
              }
              case "action": {
                cell.value();
                break;
              }
              default:
                break;
            }
          }
        }
      };
    }
  }

  private _createCell(props: PrefsRow) {
    switch (props.type) {
      case "string":
        return new StringCell(props, this._values);
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
      case "info":
        return new InfoCell(props, this._values);
      case "interactive-info":
        return new InteractiveInfoCell(props, this._values);
      case "link":
        return new LinkCell(props, this._values);
      case "action":
        return new ActionCell(props, this._values);
      default:
        throw new Error("Invalid cell type");
    }
  }

  get values() {
    return this._values;
  }

  set(key: string, value: any) {
    this._cells.forEach(section => {
      section.rows.forEach(row => {
        if (row.key === key) row.value = value;
      });
    });
  }
}
