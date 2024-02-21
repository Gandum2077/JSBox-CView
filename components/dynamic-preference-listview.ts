/**
 * # cview PreferenceListView_dynamic
 * 
 * 便捷的设置列表实现. 样式以及功能均以 PreferenceListView_static 为准.
 * 
 * 优势在于:
 * 
 * - 可以实现 sections 重新写入.
 * 
 * 劣势在于:
 * 
 * - 由于每个 cell 不能单独布局, 因此标题和内容的长度无法动态调整, 在两者都比较短的情况下没有问题, 长了布局可能会重叠.
 * - 不能真正实现 selectable 为 false, 分割线仍然会闪动
 * 
 * 为了缓解上面的问题, 让修改布局无需调整源代码, 增加下列 props:
 * 
 * - stringLeftInset?: number = 120 将同时作用于 string, number, integer, list, 但是由于后三者内容可控, 可视为只作用于 string
 * - infoAndLinkLeftInset?: number = 120 作用于 info, link
 * - sliderWidth?: number = 200 作用于 slider
 * - tabWidth?: number = 200 作用于 tab
 *   注意以上的修改是应用于 template, 而不是应用于单个 cell 的
 * 
 * 独特方法:
 * 
 * - cview.sections = sections 可以写入新的 sections
 */

import { Base } from "./base";

interface PreferenceSection {
  title: string;
  rows: PrefsRow[]
}

type PreferenceCellTypes = "string" | "number" | "integer" | "stepper" | "boolean" | "slider" | "list" | "tab" | "info" | "link" | "action";

type PrefsRow = PrefsRowString | PrefsRowNumber | PrefsRowInteger | PrefsRowStepper | PrefsRowBoolean | PrefsRowSlider | PrefsRowList | PrefsRowTab | PrefsRowInfo | PrefsRowLink | PrefsRowAction;

interface PrefsRowBase {
  type: PreferenceCellTypes;
  key?: string;
  title?: string;
  titleColor?: UIColor;
  changedEvent?: () => void;
}

interface PrefsRowString extends PrefsRowBase {
  type: "string";
  value?: string;
  placeholder?: string;
  textColor?: UIColor;
}

interface PrefsRowNumber extends PrefsRowBase {
  type: "number";
  value?: number;
  placeholder?: string;
  textColor?: UIColor;
  min?: number;
  max?: number;
}

interface PrefsRowInteger extends PrefsRowBase {
  type: "integer";
  value?: number;
  placeholder?: string;
  textColor?: UIColor;
  min?: number;
  max?: number;
}

interface PrefsRowStepper extends PrefsRowBase {
  type: "stepper";
  value?: number;
  min?: number;
  max?: number;
}

interface PrefsRowBoolean extends PrefsRowBase {
  type: "boolean";
  value?: boolean;
  onColor?: UIColor;
  thumbColor?: UIColor;
}

interface PrefsRowSlider extends PrefsRowBase {
  type: "slider";
  value?: number;
  min?: number;
  max?: number;
  decimal?: number;
  minColor?: UIColor;
  maxColor?: UIColor;
  thumbColor?: UIColor;
}

interface PrefsRowList extends PrefsRowBase {
  type: "list";
  value?: number;
  items: string[];
}

interface PrefsRowTab extends PrefsRowBase {
  type: "tab";
  value?: number;
  items: string[];
}

interface PrefsRowInfo extends PrefsRowBase {
  type: "info";
  value?: string;
}

interface PrefsRowLink extends PrefsRowBase {
  type: "link";
  value?: string;
}

interface PrefsRowAction extends PrefsRowBase {
  type: "action";
  value?: () => void;
  destructive?: boolean;
}

const selectableTypes = [
  "string",
  "number",
  "integer",
  "stepper",
  "list",
  "link",
  "action"
];

interface CunstomProps extends UiTypes.ListProps {
  stringLeftInset?: number;
  infoAndLinkLeftInset?: number;
  sliderWidth?: number;
  tabWidth?: number;
}

interface RequiredCunstomProps extends UiTypes.ListProps {
  stringLeftInset: number;
  infoAndLinkLeftInset: number;
  sliderWidth: number;
  tabWidth: number;
}


export class DynamicPreferenceListView extends Base<UIListView, UiTypes.ListOptions>{
  _defineView: () => UiTypes.ListOptions;
  private _sections: PreferenceSection[];
  private _props: RequiredCunstomProps;
  constructor({ sections, props, layout, events = {} }: {
    sections: PreferenceSection[];
    props: CunstomProps;
    layout?: (make: MASConstraintMaker, view: UIListView) => void;
    events?: {
      changed?: (values: any) => void;
    };

  }) {
    super();
    this._sections = sections.map(n => ({
      title: n.title,
      rows: n.rows.map(r => ({ ...r }))
    }));
    this._props = {
      stringLeftInset: 120,
      infoAndLinkLeftInset: 120,
      sliderWidth: 200,
      tabWidth: 200,
      ...props
    };
    this._layout = layout;
    this._defineView = () => {
      return {
        type: "list",
        props: {
          style: 2,
          ...this._props,
          id: this.id,
          template: {
            views: [
              {
                type: "view",
                props: {
                  id: "bgview",
                  bgcolor: $color("secondarySurface")
                },
                layout: $layout.fill
              },
              {
                type: "label",
                props: {
                  id: "title",
                  font: $font(17)
                },
                layout: (make, view) => {
                  make.top.bottom.inset(0);
                  make.left.right.inset(15);
                }
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
                      id: "label_and_chevron"
                    },
                    layout: $layout.fill,
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
                          id: "label_before_chevron",
                          align: $align.right,
                          font: $font(17)
                        },
                        layout: (make, view) => {
                          make.centerY.equalTo(view.super);
                          make.left.inset(this._props.stringLeftInset - 15);
                          make.right.equalTo(view.prev.left).inset(5);
                        }
                      }
                    ]
                  },
                  {
                    type: "view",
                    props: {
                      id: "number_and_stepper"
                    },
                    layout: $layout.fill,
                    views: [
                      {
                        type: "stepper",
                        props: {
                          id: "stepper"
                        },
                        layout: (make, view) => {
                          make.centerY.equalTo(view.super);
                          make.right.inset(0);
                        },
                        events: {
                          changed: sender => {
                            const { section, row } = sender.info;
                            this._sections[section].rows[row].value =
                              sender.value;
                            this.view.data = this._map(this._sections);
                            if (events.changed)
                              events.changed(this.values);
                          }
                        }
                      },
                      {
                        type: "label",
                        props: {
                          id: "label_stepper",
                          align: $align.right
                        },
                        layout: (make, view) => {
                          make.top.bottom.inset(0);
                          make.right.equalTo(view.prev.left).inset(10);
                          make.width.equalTo(100);
                        }
                      }
                    ]
                  },
                  {
                    type: "view",
                    props: {
                      id: "slider_and_number"
                    },
                    layout: $layout.fill,
                    views: [
                      {
                        type: "slider",
                        props: {
                          id: "slider"
                        },
                        layout: (make, view) => {
                          make.centerY.equalTo(view.super);
                          make.right.inset(40);
                          make.width.equalTo(this._props.sliderWidth - 40);
                        },
                        events: {
                          changed: sender => {
                            const { section, row } = sender.info;
                            const options = this._sections[section].rows[row] as PrefsRowSlider;
                            const label = sender.next as UILabelView;
                            label.text = this._handleSliderValue(
                              sender.value,
                              options.decimal,
                              options.min,
                              options.max
                            ).toString();
                          },
                          touchesEnded: sender => {
                            const { section, row } = sender.info;
                            const options = this._sections[section].rows[row] as PrefsRowSlider;
                            this._sections[section].rows[
                              row
                            ].value = this._handleSliderValue(
                              sender.value,
                              options.decimal,
                              options.min,
                              options.max
                            );
                            this.view.data = this._map(this._sections);
                            if (events.changed)
                              events.changed(this.values);
                          }
                        }
                      },
                      {
                        type: "label",
                        props: {
                          id: "label_slider",
                          align: $align.center
                        },
                        layout: (make, view) => {
                          make.top.bottom.inset(0);
                          make.right.inset(0);
                          make.width.equalTo(44);
                        }
                      }
                    ]
                  },
                  {
                    type: "switch",
                    props: {
                      id: "switch"
                    },
                    layout: (make, view) => {
                      make.centerY.equalTo(view.super);
                      make.right.inset(0);
                    },
                    events: {
                      changed: sender => {
                        const { section, row } = sender.info;
                        this._sections[section].rows[row].value = sender.on;
                        $delay(0.2, () => {
                          this.view.data = this._map(this._sections);
                          if (events.changed)
                            events.changed(this.values);
                        });
                      }
                    }
                  },
                  {
                    type: "tab",
                    props: {
                      id: "tab"
                    },
                    layout: (make, view) => {
                      make.centerY.equalTo(view.super);
                      make.height.equalTo(32);
                      make.width.equalTo(this._props.tabWidth);
                      make.right.inset(0);
                    },
                    events: {
                      changed: sender => {
                        const { section, row } = sender.info;
                        this._sections[section].rows[row].value = sender.index;
                        $delay(0.3, () => {
                          this.view.data = this._map(this._sections);
                          if (events.changed)
                            events.changed(this.values);
                        });
                      }
                    }
                  },
                  {
                    type: "label",
                    props: {
                      id: "label_info_link",
                      align: $align.right
                    },
                    layout: (make, view) => {
                      make.top.bottom.inset(0);
                      make.left.inset(this._props.infoAndLinkLeftInset);
                      make.right.inset(0);
                    }
                  }
                ]
              }
            ]
          },
          data: this._map(this._sections)
        },
        layout: this._layout,
        events: {
          didSelect: (sender, indexPath, data) => {
            const row = this._sections[indexPath.section].rows[indexPath.row];
            if (!selectableTypes.includes(row.type)) return;
            switch (row.type) {
              case "string": {
                $input.text({
                  type: $kbType.default,
                  placeholder: row.placeholder,
                  handler: text => {
                    row.value = text;
                    sender.data = this._map(this._sections);
                    if (events.changed) events.changed(this.values);
                  }
                });
                break;
              }
              case "number": {
                $input.text({
                  type: $kbType.decimal,
                  placeholder: row.placeholder,
                  handler: text => {
                    let num = this._handleText(text, row.type);
                    if (num === undefined) return;
                    if (row.min !== undefined && num < row.min) num = row.min;
                    if (row.max !== undefined && num > row.max) num = row.max;
                    row.value = num;
                    sender.data = this._map(this._sections);
                    if (events.changed) events.changed(this.values);
                  }
                });
                break;
              }
              case "integer": {
                $input.text({
                  type: $kbType.number,
                  placeholder: row.placeholder,
                  handler: text => {
                    let num = this._handleText(text, row.type);
                    if (num === undefined) return;
                    if (row.min !== undefined && num < row.min) num = row.min;
                    if (row.max !== undefined && num > row.max) num = row.max;
                    row.value = num;
                    sender.data = this._map(this._sections);
                    if (events.changed) events.changed(this.values);
                  }
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
                  }
                });
                break;
              }
              case "link": {
                if (row.value) $safari.open({ url: row.value });
                break;
              }
              case "action": {
                if (row.value) row.value();
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

  _handleText(text: string, type: string) {
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

  _handleSliderValue(num?: number, decimal?: number, min?: number, max?: number): number {
    if (num === undefined) return min || 0;
    if (decimal === undefined) decimal = 1;
    if (isNaN(num)) num = min || 0;
    if (min !== undefined && num < min) num = min;
    if (max !== undefined && num > max) num = max;
    const adjustedValue = parseFloat(num.toFixed(decimal));
    return adjustedValue;
  }

  _map(sections: PreferenceSection[]) {
    function generateDefaultRow(options: PrefsRow): any {
      return {
        bgview: { hidden: selectableTypes.includes(options.type) }, // bgview其实是用于调整selectable, 显示此视图就没有highlight效果
        title: {
          text: options.title,
          textColor: options.titleColor || $color("primaryText")
        }, // 标题, 同时用于action
        label_and_chevron: { hidden: true }, // 用于string, number, integer, list
        number_and_stepper: { hidden: true }, // 用于stepper
        slider_and_number: { hidden: true }, // 用于slider
        switch: { hidden: true }, // 用于boolean
        tab: { hidden: true }, // 用于tab
        label_info_link: { hidden: true } // 用于info, link
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
              text: n.value === undefined ? "" : n.value
            };
            break;
          }
          case "number": {
            data.label_and_chevron.hidden = false;
            data.label_before_chevron = {
              textColor: n.textColor || $color("primaryText"),
              text: n.value === undefined ? "" : n.value
            };
            break;
          }
          case "integer": {
            data.label_and_chevron.hidden = false;
            data.label_before_chevron = {
              textColor: n.textColor || $color("primaryText"),
              text: n.value === undefined ? "" : n.value
            };
            break;
          }
          case "stepper": {
            data.number_and_stepper.hidden = false;
            data.label_stepper = {
              textColor: $color("primaryText"),
              text: n.value === undefined ? "" : n.value
            };
            data.stepper = {
              min: n.min,
              max: n.max,
              value: n.value,
              info: { section: sectionIndex, row: rowIndex, key: n.key }
            };
            break;
          }
          case "boolean": {
            data.switch = {
              hidden: false,
              on: n.value,
              onColor: n.onColor || $color("#34C85A"),
              thumbColor: n.thumbColor,
              info: { section: sectionIndex, row: rowIndex, key: n.key }
            };
            break;
          }
          case "slider": {
            data.slider_and_number.hidden = false;
            const adjustedValue = this._handleSliderValue(
              n.value,
              n.decimal,
              n.min,
              n.max
            );
            data.label_slider = {
              textColor: $color("primaryText"),
              text: adjustedValue
            };
            data.slider = {
              value: adjustedValue,
              info: { section: sectionIndex, row: rowIndex, key: n.key },
              min: n.min,
              max: n.max,
              minColor: n.minColor || $color("systemLink"),
              maxColor: n.maxColor,
              thumbColor: n.thumbColor
            };
            break;
          }
          case "list": {
            data.label_and_chevron.hidden = false;
            data.label_before_chevron = {
              textColor: $color("secondaryText"),
              text: n.items[n.value || 0]
            };
            break;
          }
          case "tab": {
            data.tab = {
              hidden: false,
              items: n.items,
              index: n.value,
              info: { section: sectionIndex, row: rowIndex, key: n.key }
            };
            break;
          }
          case "info": {
            data.label_info_link = {
              hidden: false,
              textColor: $color("secondaryText"),
              text: n.value
            };
            break;
          }
          case "link": {
            data.label_info_link = {
              hidden: false,
              styledText: `[${n.value}]()`
            };
            break;
          }
          case "action": {
            data.title.textColor = n.destructive
              ? $color("red")
              : $color("systemLink");
            break;
          }
          default:
            break;
        }
        return data;
      })
    }));
  }

  get sections() {
    return this._sections;
  }

  set sections(sections) {
    this._sections = sections.map(n => ({
      title: n.title,
      rows: n.rows.map(r => ({ ...r }))
    }));
    this.view.data = this._map(this._sections);
  }

  get values() {
    const values: { [key: string]: any } = {};
    const excludedTypes = ["action", "info", "link"];
    this._sections.forEach(section => {
      section.rows.forEach(row => {
        if (row.key && !excludedTypes.includes(row.type)) {
          values[row.key] = row.value;
        }
      });
    });
    return values;
  }

  set(key: string, value: any) {
    this._sections.forEach(section => {
      section.rows.forEach(row => {
        if (row.key === key) row.value = value;
      });
    });
    this.view.data = this._map(this._sections);
  }
}
