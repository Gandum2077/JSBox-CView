/**
 * # CView SearchBar
 *
 * props
 *
 * - 读写 text: string
 * - style: number 搜索框的样式
 *   - 0: 取消按钮在输入框内，聚焦时显示取消按钮
 *   - 1: 取消按钮在输入框右侧，聚焦时会有左右移动的动画
 *   - 2: 取消按钮布局同 1，但是 placeholder 平时显示在中间，聚焦时才会移动到左边。
 *     如果使用此样式，建议每次 blur 的时候都清除 text
 * - accessoryCview: cview 请通过下面的事件来和 SearchBar 互相操作
 * - placeholder: string
 * - cancelText: string
 * - tintColor: \$color("systemLink")
 * - bgcolor: colors.searchBarBgcolor
 *
 * events
 *
 * - didBeginEditing: cview => void
 * - didEndEditing: cview => void
 * - changed: cview => void
 * - returned: cview => void
 */

import { Base } from "./base";
import { Input, Label, ContentView } from "./single-views";
import { searchBarBgcolor } from "../utils/colors";
import { l10n } from "../utils/l10n";
import { getTextWidth } from "../utils/uitools";

interface SearchBarProps {
  placeholder: string;
  cancelText: string;
  tintColor: UIColor;
  bgcolor: UIColor;
  style: 0 | 1 | 2;
  accessoryCview?: Base<any, any>;
}

export class SearchBar extends Base<UIView, UiTypes.ViewOptions> {
  _props: SearchBarProps;
  _defineView: () => UiTypes.ViewOptions;
  cviews: {
    input: Input;
    iconInput: ContentView;
    cancelButton: Label;
    bgview: ContentView;
  };
  _layouts: {
    iconInput: {
      normal: (make: MASConstraintMaker, view: AllUIView) => void;
      focused?: (make: MASConstraintMaker, view: AllUIView) => void;
    };
    cancelButton: {
      normal: (make: MASConstraintMaker, view: AllUIView) => void;
    };
    bgview: {
      normal: (make: MASConstraintMaker, view: AllUIView) => void;
      focused?: (make: MASConstraintMaker, view: AllUIView) => void;
    };
  };
  _focused: boolean;
  constructor({ props, layout, events = {} }: {
    props: Partial<SearchBarProps>;
    layout: (make: MASConstraintMaker, view: UIView) => void;
    events?: {
      didBeginEditing?: (cview: SearchBar) => void;
      didEndEditing?: (cview: SearchBar) => void;
      changed?: (cview: SearchBar) => void;
      returned?: (cview: SearchBar) => void;
    };
  }) {
    super();
    this._props = {
      placeholder: l10n("SEARCH"),
      cancelText: l10n("CANCEL"),
      tintColor: $color("systemLink"),
      bgcolor: searchBarBgcolor,
      style: 0,
      ...props
    };
    const cancelButtonWidth = getTextWidth(this._props.cancelText, { inset: 20 });
    const placeholderWidth = getTextWidth(this._props.placeholder, { inset: 20 });
    this._focused = false;
    this._layouts = this._defineLayouts(cancelButtonWidth, placeholderWidth);
    this.cviews = {} as {
      input: Input;
      iconInput: ContentView;
      cancelButton: Label;
      bgview: ContentView;
    };
    this.cviews.input = new Input({
      props: {
        type: $kbType.search,
        placeholder: this._props.placeholder,
        bgcolor: $color("clear"),
        radius: 0,
        accessoryView:
          this._props.accessoryCview && this._props.accessoryCview.definition
      },
      layout: (make, view) => {
        make.left.equalTo(view.prev.right);
        make.top.bottom.right.inset(0);
      },
      events: {
        changed: sender => {
          if (events.changed) events.changed(this);
        },
        didBeginEditing: sender => {
          this._onFocused();
          if (events.didBeginEditing) events.didBeginEditing(this);
        },
        didEndEditing: sender => {
          if (events.didEndEditing) events.didEndEditing(this);
        },
        returned: sender => {
          this.blur();
          if (events.returned) events.returned(this);
        }
      }
    })
    this.cviews.iconInput = new ContentView({
      props: {
        bgcolor: undefined
      },
      layout: this._layouts.iconInput.normal,
      views: [
        {
          type: "view",
          props: {},
          views: [
            {
              type: "image",
              props: {
                //tintColor: searchBarSymbolColor,
                tintColor: $color("systemPlaceholderText"),
                symbol: "magnifyingglass"
              },
              layout: (make, view) => {
                make.size.equalTo($size(20, 20));
                make.center.equalTo(view.super);
              }
            }
          ],
          layout: (make, view) => {
            make.top.bottom.inset(0);
            make.width.equalTo(20);
            make.left.inset(6);
          }
        },
        this.cviews.input.definition
      ]
    })
    this.cviews.cancelButton = new Label({
      props: {
        text: this._props.cancelText,
        textColor: this._props.tintColor,
        font: $font(17),
        align: $align.center,
        userInteractionEnabled: true,
        alpha: 0
      },
      layout: this._layouts.cancelButton.normal,
      events: {
        tapped: sender => this.blur()
      }
    })
    this.cviews.bgview = new ContentView({
      props: {
        bgcolor: this._props.bgcolor,
        radius: 8,
        userInteractionEnabled: true
      },
      layout: this._layouts.bgview.normal,
      events: {
        tapped: sender => {
          if (!this._focused) this.focus();
        }
      }
    })
    this._defineView = () => {
      return {
        type: "view",
        props: {
          id: this.id,
          clipsToBounds: true
        },
        layout,
        views: [
          this.cviews.bgview.definition,
          this.cviews.iconInput.definition,
          this.cviews.cancelButton.definition
        ]
      };
    }
  }


  _defineLayouts(cancelButtonWidth: number, placeholderWidth: number) {
    switch (this._props.style) {
      case 0: {
        const IconInputLayout = $layout.fill;
        const IconInputLayoutFocused = (make: MASConstraintMaker, view: AllUIView) => {
          make.left.top.bottom.inset(0);
          make.right.inset(cancelButtonWidth);
        }
        const cancelButtonLayout = (make: MASConstraintMaker, view: AllUIView) => {
          make.right.top.bottom.inset(0);
          make.width.equalTo(cancelButtonWidth);
        };
        const bgviewLayout = $layout.fill;
        return {
          iconInput: { normal: IconInputLayout, focused: IconInputLayoutFocused },
          cancelButton: { normal: cancelButtonLayout },
          bgview: { normal: bgviewLayout }
        };
      }
      case 1: {
        const IconInputLayout = (make: MASConstraintMaker, view: AllUIView) => {
          make.left.top.bottom.inset(0);
          make.right.equalTo(view.prev);
        };
        const cancelButtonLayout = (make: MASConstraintMaker, view: AllUIView) => {
          make.top.bottom.inset(0);
          make.left.equalTo(view.prev.prev.right);
          make.width.equalTo(cancelButtonWidth);
        };
        const bgviewLayoutNormal = $layout.fill;
        const bgviewLayoutFocused = (make: MASConstraintMaker, view: AllUIView) => {
          make.left.top.bottom.inset(0);
          make.right.inset(cancelButtonWidth);
        };
        return {
          iconInput: { normal: IconInputLayout },
          cancelButton: { normal: cancelButtonLayout },
          bgview: { normal: bgviewLayoutNormal, focused: bgviewLayoutFocused }
        };
      }
      case 2: {
        const IconInputLayoutNormal = (make: MASConstraintMaker, view: AllUIView) => {
          make.center.equalTo(view.super);
          make.top.bottom.inset(0);
          make.width.equalTo(placeholderWidth + 50);
        };
        const IconInputLayoutFocused = (make: MASConstraintMaker, view: AllUIView) => {
          make.left.top.bottom.inset(0);
          make.right.inset(cancelButtonWidth);
        };
        const cancelButtonLayout = (make: MASConstraintMaker, view: AllUIView) => {
          make.right.top.bottom.inset(0);
          make.left.equalTo(view.prev.prev.right);
          make.width.equalTo(cancelButtonWidth);
        };
        const bgviewLayoutNormal = $layout.fill;
        const bgviewLayoutFocused = (make: MASConstraintMaker, view: AllUIView) => {
          make.left.top.bottom.inset(0);
          make.right.inset(cancelButtonWidth);
        };
        return {
          iconInput: {
            normal: IconInputLayoutNormal,
            focused: IconInputLayoutFocused
          },
          cancelButton: { normal: cancelButtonLayout },
          bgview: { normal: bgviewLayoutNormal, focused: bgviewLayoutFocused }
        };
      }
      default:
        throw new Error("style not supported");
    }
  }

  _onFocused() {
    this._focused = true;
    if (this._layouts.iconInput.focused) this.cviews.iconInput.view.remakeLayout(this._layouts.iconInput.focused);
    switch (this._props.style) {
      case 0: {
        $ui.animate({
          duration: 0.2,
          animation: () => {
            this.cviews.iconInput.view.relayout();
            this.cviews.cancelButton.view.alpha = 1;
          }
        });
        break;
      }
      case 1: {
        if (this._layouts.bgview.focused) this.cviews.bgview.view.remakeLayout(this._layouts.bgview.focused);
        $ui.animate({
          duration: 0.2,
          animation: () => {
            this.cviews.bgview.view.relayout();
            this.cviews.cancelButton.view.alpha = 1;
          }
        });
        break;
      }
      case 2: {
        if (this._layouts.iconInput.focused) this.cviews.iconInput.view.remakeLayout(this._layouts.iconInput.focused);
        if (this._layouts.bgview.focused) this.cviews.bgview.view.remakeLayout(this._layouts.bgview.focused);
        $ui.animate({
          duration: 0.2,
          animation: () => {
            this.cviews.iconInput.view.relayout();
            this.cviews.bgview.view.relayout();
            this.cviews.cancelButton.view.alpha = 1;
          }
        });
        break;
      }
      default:
        break;
    }
  }

  _onBlurred() {
    this._focused = false;
    this.cviews.iconInput.view.remakeLayout(this._layouts.iconInput.normal);
    switch (this._props.style) {
      case 0: {
        $ui.animate({
          duration: 0.2,
          animation: () => {
            this.cviews.iconInput.view.relayout();
            this.cviews.cancelButton.view.alpha = 0;
          }
        });
        break;
      }
      case 1: {
        this.cviews.bgview.view.remakeLayout(this._layouts.bgview.normal);
        $ui.animate({
          duration: 0.2,
          animation: () => {
            this.cviews.bgview.view.relayout();
            this.cviews.cancelButton.view.alpha = 0;
          }
        });
        break;
      }
      case 2: {
        const placeholderWidth = getTextWidth(this._props.placeholder, { inset: 20 });
        const textWidth = getTextWidth(this.text, { inset: 20 });
        const IconInputLayoutInputing = (make: MASConstraintMaker, view: AllUIView) => {
          make.center.equalTo(view.super);
          make.top.bottom.inset(0);
          make.width.equalTo(Math.max(textWidth, placeholderWidth) + 50).priority(999);
          make.width.lessThanOrEqualTo(view.super).priority(1000);
        }
        this.cviews.iconInput.view.remakeLayout(IconInputLayoutInputing);
        this.cviews.bgview.view.remakeLayout(this._layouts.bgview.normal);
        $ui.animate({
          duration: 0.2,
          animation: () => {
            this.cviews.iconInput.view.relayout();
            this.cviews.bgview.view.relayout();
            this.cviews.cancelButton.view.alpha = 0;
          }
        });
        break;
      }
      default:
        break;
    }
  }

  focus() {
    this.cviews.input.view.focus();
    this._onFocused();
  }

  blur() {
    this._onBlurred();
    this.cviews.input.view.blur();
  }

  set text(text) {
    this.cviews.input.view.text = text;
  }

  get text() {
    return this.cviews.input.view.text;
  }
}
