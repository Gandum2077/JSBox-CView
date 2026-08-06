import { Base } from "./base";
import { Input, Label, ContentView } from "./single-views";
import { searchBarBgcolor } from "../utils/colors";
import { l10n } from "../utils/l10n";
import { getTextWidth } from "../utils/uitools";

/** SearchBar 属性接口 */
export interface SearchBarProps {
  /** 输入框为空时显示的提示文本。 */
  placeholder?: string;
  /** 取消按钮文本。 */
  cancelText?: string;
  /** 取消按钮的文字颜色。 */
  tintColor?: UIColor;
  /** 搜索框背景颜色。 */
  bgcolor?: UIColor;
  /** 搜索框的布局样式。 */
  style?: 0 | 1 | 2;
  /** 作为输入框 `accessoryView` 显示的 CView 组件。 */
  accessoryCview?: Base<any, any>;
}

/** SearchBar 事件接口 */
export interface SearchBarEvents {
  /** 输入框开始编辑时触发。 */
  didBeginEditing?: (cview: SearchBar) => void;
  /** 输入框结束编辑时触发。 */
  didEndEditing?: (cview: SearchBar) => void;
  /** 用户修改输入文本时触发。 */
  changed?: (cview: SearchBar) => void;
  /** 用户按下键盘 Return 并开始失焦时触发。 */
  returned?: (cview: SearchBar) => void;
}
/**
 * 带搜索图标、取消按钮和聚焦动画的搜索框。
 *
 * `style` 决定未聚焦和聚焦状态的布局：
 *
 * - `0`：取消按钮位于组件内部，聚焦时输入区域向左收缩；
 * - `1`：取消按钮从输入区域右侧出现，背景随聚焦状态收缩；
 * - `2`：未聚焦时图标和提示文本居中，聚焦时移到左侧，取消按钮布局与样式 `1` 类似。
 *
 * 点击取消按钮或键盘 Return 会调用 {@link blur}，但不会自动清空文本；只有 Return 会额外触发 `returned`。
 * `accessoryCview` 的视图定义会作为输入框附件视图使用，调用方可通过事件回调与搜索框联动。样式 `2` 若需要恢复为仅显示
 * 居中 placeholder 的状态，应在失焦前后自行清空 {@link text}。
 * @example
 * ```ts
 * const searchBar = new SearchBar({
 *   props: {
 *     style: 2,
 *     placeholder: "搜索文章",
 *   },
 *   layout: (make, view) => {
 *     make.left.right.inset(16)
 *     make.top.inset(8)
 *     make.height.equalTo(36)
 *   },
 *   events: {
 *     changed: sender => filter(sender.text),
 *     returned: sender => submit(sender.text),
 *   },
 * })
 * ```
 */
export class SearchBar extends Base<UIView, UiTypes.ViewOptions> {
  /** 合并默认值后的搜索框属性。 */
  _props: Required<Omit<SearchBarProps, "accessoryCview">> & Pick<SearchBarProps, "accessoryCview">;

  /** 返回由背景、输入区域和取消按钮组成的视图定义。 */
  _defineView: () => UiTypes.ViewOptions;

  /** 搜索框内部使用的子组件。 */
  cviews: {
    /** 实际接收文本和键盘事件的输入框。 */
    input: Input;
    /** 包含搜索图标和输入框的区域。 */
    iconInput: ContentView;
    /** 结束编辑的取消按钮。 */
    cancelButton: Label;
    /** 提供圆角和背景色的交互区域。 */
    bgview: ContentView;
  };

  /** 各子视图在普通和聚焦状态下使用的布局。 */
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

  /** 搜索框当前是否处于聚焦状态。 */
  _focused: boolean;

  /** 创建搜索框及其聚焦状态布局。 */
  constructor({
    props,
    layout,
    events = {},
  }: {
    /** 搜索框属性；未提供的字段使用本地化文本和系统颜色。 */
    props: SearchBarProps;
    /** 搜索框根视图的布局回调。 */
    layout: (make: MASConstraintMaker, view: UIView) => void;
    /** 输入框编辑事件。 */
    events?: SearchBarEvents;
  }) {
    super();
    this._props = {
      ...props,
      placeholder: props.placeholder ?? l10n("SEARCH"),
      cancelText: props.cancelText ?? l10n("CANCEL"),
      tintColor: props.tintColor ?? $color("systemLink"),
      bgcolor: props.bgcolor ?? searchBarBgcolor,
      style: props.style ?? 0,
    };
    const cancelButtonWidth = getTextWidth(this._props.cancelText, {
      inset: 20,
    });
    const placeholderWidth = getTextWidth(this._props.placeholder, {
      inset: 20,
    });
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
        accessoryView: this._props.accessoryCview && this._props.accessoryCview.definition,
      },
      layout: (make, view) => {
        make.left.equalTo(view.prev.right);
        make.top.bottom.right.inset(0);
      },
      events: {
        changed: (sender) => {
          if (events.changed) events.changed(this);
        },
        didBeginEditing: (sender) => {
          this._onFocused();
          if (events.didBeginEditing) events.didBeginEditing(this);
        },
        didEndEditing: (sender) => {
          if (events.didEndEditing) events.didEndEditing(this);
        },
        returned: (sender) => {
          this.blur();
          if (events.returned) events.returned(this);
        },
      },
    });
    this.cviews.iconInput = new ContentView({
      props: {
        bgcolor: undefined,
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
                symbol: "magnifyingglass",
              },
              layout: (make, view) => {
                make.size.equalTo($size(20, 20));
                make.center.equalTo(view.super);
              },
            },
          ],
          layout: (make, view) => {
            make.top.bottom.inset(0);
            make.width.equalTo(20);
            make.left.inset(6);
          },
        },
        this.cviews.input.definition,
      ],
    });
    this.cviews.cancelButton = new Label({
      props: {
        text: this._props.cancelText,
        textColor: this._props.tintColor,
        font: $font(17),
        align: $align.center,
        userInteractionEnabled: true,
        alpha: 0,
      },
      layout: this._layouts.cancelButton.normal,
      events: {
        tapped: (sender) => this.blur(),
      },
    });
    this.cviews.bgview = new ContentView({
      props: {
        bgcolor: this._props.bgcolor,
        radius: 8,
        userInteractionEnabled: true,
      },
      layout: this._layouts.bgview.normal,
      events: {
        tapped: (sender) => {
          if (!this._focused) this.focus();
        },
      },
    });
    this._defineView = () => {
      return {
        type: "view",
        props: {
          clipsToBounds: true,
        },
        layout,
        views: [this.cviews.bgview.definition, this.cviews.iconInput.definition, this.cviews.cancelButton.definition],
      };
    };
  }

  /**
   * 根据样式和文本宽度生成普通、聚焦状态的布局集合。
   * @param cancelButtonWidth - 取消按钮占用的宽度。
   * @param placeholderWidth - placeholder 文本占用的宽度。
   * @returns 供内部子视图切换状态时使用的布局集合。
   */
  _defineLayouts(cancelButtonWidth: number, placeholderWidth: number) {
    switch (this._props.style) {
      case 0: {
        const IconInputLayout = $layout.fill;
        const IconInputLayoutFocused = (make: MASConstraintMaker, view: AllUIView) => {
          make.left.top.bottom.inset(0);
          make.right.inset(cancelButtonWidth);
        };
        const cancelButtonLayout = (make: MASConstraintMaker, view: AllUIView) => {
          make.right.top.bottom.inset(0);
          make.width.equalTo(cancelButtonWidth);
        };
        const bgviewLayout = $layout.fill;
        return {
          iconInput: {
            normal: IconInputLayout,
            focused: IconInputLayoutFocused,
          },
          cancelButton: { normal: cancelButtonLayout },
          bgview: { normal: bgviewLayout },
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
          bgview: { normal: bgviewLayoutNormal, focused: bgviewLayoutFocused },
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
            focused: IconInputLayoutFocused,
          },
          cancelButton: { normal: cancelButtonLayout },
          bgview: { normal: bgviewLayoutNormal, focused: bgviewLayoutFocused },
        };
      }
      default:
        throw new Error("style not supported");
    }
  }

  /** 将内部布局切换为聚焦状态并显示取消按钮。 */
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
          },
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
          },
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
          },
        });
        break;
      }
      default:
        break;
    }
  }

  /** 将内部布局切换为普通状态并隐藏取消按钮。 */
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
          },
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
          },
        });
        break;
      }
      case 2: {
        const placeholderWidth = getTextWidth(this._props.placeholder, {
          inset: 20,
        });
        const textWidth = getTextWidth(this.text, { inset: 20 });
        const IconInputLayoutInputing = (make: MASConstraintMaker, view: AllUIView) => {
          make.center.equalTo(view.super);
          make.top.bottom.inset(0);
          make.width.equalTo(Math.max(textWidth, placeholderWidth) + 50).priority(999);
          make.width.lessThanOrEqualTo(view.super).priority(1000);
        };
        this.cviews.iconInput.view.remakeLayout(IconInputLayoutInputing);
        this.cviews.bgview.view.remakeLayout(this._layouts.bgview.normal);
        $ui.animate({
          duration: 0.2,
          animation: () => {
            this.cviews.iconInput.view.relayout();
            this.cviews.bgview.view.relayout();
            this.cviews.cancelButton.view.alpha = 0;
          },
        });
        break;
      }
      default:
        break;
    }
  }

  /** 聚焦输入框并切换到聚焦状态布局。 */
  focus() {
    this.cviews.input.view.focus();
    this._onFocused();
  }

  /** 恢复普通状态布局并让输入框失焦。 */
  blur() {
    this._onBlurred();
    this.cviews.input.view.blur();
  }

  /**
   * 更新输入框文本。
   *
   * 程序化赋值不会触发 `changed`。
   * @param text - 新的输入文本。
   */
  set text(text) {
    this.cviews.input.view.text = text;
  }

  /**
   * 获取当前输入文本。
   * @returns 当前输入文本。
   */
  get text() {
    return this.cviews.input.view.text;
  }
}
