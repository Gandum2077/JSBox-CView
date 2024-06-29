/** 
 * # CView Custom NavigationBar
 * 
 * 仿制 navBar
 * 
 * ## features:
 * 
 * - 拥有隐藏、最小化、普通、扩展四种布局方式
 *   - 隐藏: 什么都不显示
 *   - 最小化: safeAreaHeight 为 25, 只显示 titleView, 若用 title, font 为\$font(14)
 *   - 普通: safeAreaHeight 为 50, 显示 titleView, leftBarButtonItems 或 popButton, rightBarButtonItems, 若用 title, font 为\$font("bold", 17)
 *   - 扩展: safeAreaHeight 为 100, 除上面的之外, 再显示一个 toolView
 * - 自动适应全面屏和非全面屏
 * 
 * ## Arguments
 * 
 * props:
 * 
 * - 读写 style: number 0, 1, 2, 3，指定布局
 * - 读写 title: string 但必须使用此种方案才可以在生成后写入，自动创建 Label 作为 titleView
 * - titleView: cview 自定义的 titleView
 * - popButtonEnabled: boolean 返回上一级的按钮，若为 true，则 leftBarButtonItems 忽略
 * - popButtonTitle: string 返回上一级的按钮标题
 * - popToRootEnabled: boolean popButton 是否可以长按返回到顶级
 * - leftBarButtonItems: cview[]
 *   | {symbol: string, handler: () => void, tintColor?: UIColor}[]
 *   | {title: string, handler: () => void, tintColor?: UIColor}[]
 *   | {image: UIImage, handler: () => void, tintColor?: UIColor}[]  
 *   如果用的是 cview，其布局将被重新指定，即不需要（也不能）指定布局。可以通过 cview.width 来指定应有的宽度，如果没有此属性，则宽度为 50  
 *   建议最多放两个
 * - rightBarButtonItems 定义同上，建议最多放两个
 * - toolView: cview 在 expanded 模式下才会显现的
 * - tintColor: UIColor 这将作用于 title, popButton, 自动创建的 barButton
 * - bgcolor: UIColor 如不设置，则自动使用 blur(style 10)，如果设置则没有 blur 效果
 * 
 * events:
 * 
 * - hidden: cview => void  hide()时执行
 * - minimized: cview => void  minimize()时执行
 * - restored: cview => void  restore()时执行
 * - expanded: cview => void  expand()时执行
 * - popHandler: cview => void  返回上一级时执行，需要popButtonEnabled
 * - popToRootHandler: cview => void  返回顶级时执行，需要popButtonEnabled和popToRootEnabled
 * - titleTapped: cview => void 点击标题时执行，需要使用title
 * 
 * methods:
 * 
 * - hide() 隐藏布局
 * - minimize() 最小化布局
 * - restore() 普通布局
 * - expand() 扩展布局
 */

import { Base } from "./base";
import { ContentView, Label, Button, Blur } from "./single-views";
import { SymbolButton } from "./symbol-button";
import { getTextWidth } from "../utils/uitools";

const navBarStyles = {
  hidden: 0,
  minimized: 1,
  normal: 2,
  expanded: 3
};

const navBarLayouts = [
  (make: MASConstraintMaker, view: AllUIView) => {
    make.left.right.top.inset(0);
    make.height.equalTo(0);
  },
  (make: MASConstraintMaker, view: AllUIView) => {
    make.left.right.top.inset(0);
    make.bottom.equalTo(view.super.safeAreaTop).inset(-25);
  },
  (make: MASConstraintMaker, view: AllUIView) => {
    make.left.right.top.inset(0);
    make.bottom.equalTo(view.super.safeAreaTop).inset(-50);
  },
  (make: MASConstraintMaker, view: AllUIView) => {
    make.left.right.top.inset(0);
    make.bottom.equalTo(view.super.safeAreaTop).inset(-100);
  }
]

export interface NavigationBarProps {
  style: number;
  title?: string;
  titleView?: Base<any, any>;
  popButtonEnabled?: boolean;
  popButtonTitle?: string;
  popToRootEnabled?: boolean;
  leftBarButtonItems: BarButtonItem[];
  rightBarButtonItems: BarButtonItem[];
  toolView?: Base<any, any>;
  tintColor: UIColor;
  bgcolor?: UIColor;
}

interface BarButtonItem {
  cview?: Base<any, any>;
  width?: number;
  title?: string;
  symbol?: string;
  image?: UIImage;
  tintColor?: UIColor;
  handler?: (sender: UIButtonView) => void;
}

interface NavigationBarEvents {
  hidden?: (cview: CustomNavigationBar) => void;
  minimized?: (cview: CustomNavigationBar) => void;
  restored?: (cview: CustomNavigationBar) => void;
  expanded?: (cview: CustomNavigationBar) => void;
  popHandler?: (cview: CustomNavigationBar) => void;
  popToRootHandler?: (cview: CustomNavigationBar) => void;
  titleTapped?: (cview: CustomNavigationBar) => void;
}

interface NavigationBarCViews {
  leftItemView?: ContentView | Button;
  rightItemView?: ContentView;
  titleViewWrapper?: ContentView | Label;
  contentView?: ContentView;
  toolViewWrapper?: ContentView;
  bgview?: ContentView | Blur;
  separator?: ContentView;
}

export class CustomNavigationBar extends Base<UIView | UIBlurView, UiTypes.ViewOptions | UiTypes.BlurOptions> {
  _props: NavigationBarProps;
  _events: NavigationBarEvents;
  cviews: Required<NavigationBarCViews>;
  _defineView: () => UiTypes.ViewOptions | UiTypes.BlurOptions;
  constructor({ props = {}, events = {} }: {
    props?: Partial<NavigationBarProps>;
    events?: NavigationBarEvents;
  } = {}) {
    super();
    this._props = {
      leftBarButtonItems: [],
      rightBarButtonItems: [],
      style: navBarStyles.normal,
      tintColor: $color("primaryText"),
      ...props
    };
    this._events = events;
    this.cviews = {} as Required<NavigationBarCViews>
    this._defineView = () => {
      /*
      设计思路
      一共5个子视图: 
        - contentView  下有3个子视图
            - leftItemView  popButton或者leftButtonItems
            - rightItemView  rightButtonItems
            - titleView  
        - toolView  
      */
      // leftItemView
      let leftInset = 0;
      if (this._props.popButtonEnabled) {
        const titleWidth = this._props.popButtonTitle
          ? getTextWidth(this._props.popButtonTitle)
          : 0;
        leftInset = titleWidth + 35;
        const views = [];
        const chevronOptions: UiTypes.ViewOptions = {
          type: "view",
          props: {
            userInteractionEnabled: false
          },
          layout: (make: MASConstraintMaker) => {
            make.left.top.bottom.inset(0);
            make.width.equalTo(35);
          },
          views: [
            {
              type: "image",
              props: {
                symbol: "chevron.left",
                contentMode: 1,
                tintColor: this._props.tintColor
              },
              layout: (make: MASConstraintMaker) => make.edges.insets($insets(12.5, 10, 12.5, 0))
            }
          ]
        }
        views.push(chevronOptions);
        if (this._props.popButtonTitle) {
          const popButtonTitleOptions: UiTypes.LabelOptions = {
            type: "label",
            props: {
              align: $align.left,
              text: this._props.popButtonTitle,
              font: $font(17),
              textColor: this._props.tintColor
            },
            layout: (make: MASConstraintMaker, view: UILabelView) => {
              make.top.bottom.right.inset(0);
              make.left.equalTo(view.prev.right);
            }
          }
          views.push(popButtonTitleOptions);
        }
        this.cviews.leftItemView = new Button({
          props: {
            bgcolor: $color("clear"),
            cornerRadius: 0
          },
          views,
          layout: (make, view) => {
            make.width.equalTo(leftInset);
            make.left.top.bottom.inset(0);
          },
          events: {
            tapped: sender => {
              if (this._events.popHandler) this._events.popHandler(this);
              $ui.pop();
            },
            longPressed: this._props.popToRootEnabled
              ? sender => {
                if (this._events.popToRootHandler)
                  this._events.popToRootHandler(this);
                $ui.popToRoot();
              }
              : undefined
          }
        });
      } else {
        leftInset = this._calculateItemViewWidth(this._props.leftBarButtonItems);
        this.cviews.leftItemView = new ContentView({
          props: {
            bgcolor: undefined
          },
          layout: (make, view) => {
            make.width.equalTo(leftInset);
            make.left.top.bottom.inset(0);
          },
          views: this._createCviewsOnItemView(this._props.leftBarButtonItems).map(
            n => n.definition
          )
        });
      }

      // rightItemView
      const rightInset = this._calculateItemViewWidth(
        this._props.rightBarButtonItems
      );
      this.cviews.rightItemView = new ContentView({
        props: {
          bgcolor: undefined
        },
        layout: (make, view) => {
          make.width.equalTo(rightInset);
          make.right.top.bottom.inset(0);
        },
        views: this._createCviewsOnItemView(this._props.rightBarButtonItems).map(
          n => n.definition
        )
      });

      // titleView
      const titleViewInset = Math.max(leftInset, rightInset);
      if (this._props.title) {
        this.cviews.titleViewWrapper = new Label({
          props: {
            text: this._props.title,
            font: $font("bold", 17),
            align: $align.center,
            textColor: this._props.tintColor,
            userInteractionEnabled: true
          },
          layout: (make, view) => {
            make.left.right.inset(titleViewInset);
            make.top.bottom.inset(0);
          },
          events: {
            tapped: sender => {
              if (this._events.titleTapped) this._events.titleTapped(this);
            }
          }
        });
      } else {
        this.cviews.titleViewWrapper = new ContentView({
          props: {
            bgcolor: undefined
          },
          layout: (make, view) => {
            make.left.right.inset(titleViewInset);
            make.top.bottom.inset(0);
          },
          views: this._props.titleView && [this._props.titleView.definition]
        });
      }

      // contentView
      this.cviews.contentView = new ContentView({
        props: {
          bgcolor: undefined
        },
        layout: (make, view) => {
          make.top.inset(0);
          make.left.right.inset(5);
          make.height.equalTo(50);
        },
        views: [
          this.cviews.titleViewWrapper.definition,
          this.cviews.leftItemView.definition,
          this.cviews.rightItemView.definition
        ]
      });

      // toolView
      this.cviews.toolViewWrapper = new ContentView({
        props: {
          bgcolor: undefined
        },
        layout: (make, view) => {
          make.left.right.bottom.equalTo(view.super);
          make.top.equalTo(view.super).inset(50);
        },
        views: this._props.toolView && [this._props.toolView.definition]
      });
      if (this._props.bgcolor) {
        this.cviews.bgview = new ContentView({
          props: {
            bgcolor: this._props.bgcolor
          },
          layout: $layout.fill
        });
      } else {
        this.cviews.bgview = new Blur({
          props: {
            style: 10
          },
          layout: $layout.fill
        });
      }
      this.cviews.separator = new ContentView({
        props: {
          bgcolor: $color("separatorColor")
        },
        layout: (make, view) => {
          make.bottom.left.right.inset(0);
          make.height.equalTo(0.5);
        }
      });
      return {
        type: "view",
        props: {
          id: this.id,
        },
        layout: navBarLayouts[this._props.style],
        events: {
          ready: () => (this.style = this.style)
        },
        views: [
          this.cviews.bgview.definition,
          {
            type: "view",
            props: {},
            layout: $layout.fillSafeArea,
            views: [
              this.cviews.contentView.definition,
              this.cviews.toolViewWrapper.definition
            ]
          },
          this.cviews.separator.definition
        ]
      };
    }
  }

  private _calculateItemViewWidth(items: BarButtonItem[]) {
    if (!items || items.length === 0) return 0;
    let width = 0;
    items.forEach(n => {
      if (n.cview) width += n.width || 50;
      else if (n.title) width += getTextWidth(n.title, { inset: 20 });
      else width += 50;
    });
    return width;
  }

  private _createCviewsOnItemView(items: BarButtonItem[]) {
    return items.map(n => {
      if (n.cview) {
        const width = n.width || 50;
        n.cview._layout = (make: MASConstraintMaker, view: AllUIView) => {
          make.top.bottom.inset(0);
          make.width.equalTo(width);
          make.left.equalTo((view.prev && view.prev.right) || 0);
        };
        return n.cview;
      } else if (n.title) {
        const width = getTextWidth(n.title, { inset: 20 });
        return new Button({
          props: {
            title: n.title,
            bgcolor: $color("clear"),
            titleColor: n.tintColor || this._props.tintColor,
            cornerRadius: 0
          },
          layout: (make, view) => {
            make.top.bottom.inset(0);
            make.width.equalTo(width);
            make.left.equalTo((view.prev && view.prev.right) || 0);
          },
          events: {
            tapped: n.handler
          }
        });
      } else if (n.symbol || n.image) {
        return new SymbolButton({
          props: {
            symbol: n.symbol,
            image: n.image,
            tintColor: n.tintColor || this._props.tintColor
          },
          layout: (make, view) => {
            make.top.bottom.inset(0);
            make.width.equalTo(50);
            make.left.equalTo((view.prev && view.prev.right) || 0);
          },
          events: {
            tapped: n.handler
          }
        });
      } else {
        throw Error("Invalid BarButtonItem");
      }
    });
  }

  get title() {
    return this._props.title || "";
  }

  set title(title: string) {
    if (this._props.title === undefined) return;
    this._props.title = title;
    if ("text" in this.cviews.titleViewWrapper.view) this.cviews.titleViewWrapper.view.text = title;
  }

  hide(animated = true) {
    this.view.hidden = false;
    this.cviews.leftItemView.view.hidden = true;
    this.cviews.rightItemView.view.hidden = true;
    this.cviews.toolViewWrapper.view.hidden = true;
    this.cviews.titleViewWrapper.view.hidden = true;
    this.view.remakeLayout(navBarLayouts[navBarStyles.hidden]);
    this.cviews.contentView.view.updateLayout(make => make.height.equalTo(0));
    if (animated) {
      $ui.animate({
        duration: 0.3,
        animation: () => {
          this.view.relayout();
          this.cviews.contentView.view.relayout();
        },
        completion: () => {
          this.view.hidden = true;
          if (this._events.hidden) this._events.hidden(this);
        }
      });
    } else {
      this.view.hidden = true;
      if (this._events.hidden) this._events.hidden(this);
    }
  }

  minimize(animated = true) {
    this.view.hidden = false;
    this.cviews.leftItemView.view.hidden = true;
    this.cviews.rightItemView.view.hidden = true;
    this.cviews.toolViewWrapper.view.hidden = true;
    this.cviews.titleViewWrapper.view.hidden = false;
    this.view.remakeLayout(navBarLayouts[navBarStyles.minimized]);
    this.cviews.contentView.view.updateLayout(make => make.height.equalTo(25));
    if (animated) {
      $ui.animate({
        duration: 0.3,
        animation: () => {
          this.view.relayout();
          this.cviews.contentView.view.relayout();
          if (this._props.title && "font" in this.cviews.titleViewWrapper.view)
            this.cviews.titleViewWrapper.view.font = $font("bold", 14);
        },
        completion: () => {
          if (this._events.minimized) this._events.minimized(this);
        }
      });
    } else {
      if (this._props.title && "font" in this.cviews.titleViewWrapper.view)
        this.cviews.titleViewWrapper.view.font = $font("bold", 14);
      if (this._events.minimized) this._events.minimized(this);
    }
  }

  restore(animated = true) {
    this.view.hidden = false;
    this.cviews.titleViewWrapper.view.hidden = false;
    //this.cviews.toolViewWrapper.view.hidden = true;
    this.view.remakeLayout(navBarLayouts[navBarStyles.normal]);
    this.cviews.contentView.view.updateLayout(make => make.height.equalTo(50));
    if (animated) {
      $ui.animate({
        duration: 0.3,
        animation: () => {
          this.view.relayout();
          this.cviews.contentView.view.relayout();
          if (this._props.title && "font" in this.cviews.titleViewWrapper.view)
            this.cviews.titleViewWrapper.view.font = $font("bold", 17);
        },
        completion: () => {
          this.cviews.leftItemView.view.hidden = false;
          this.cviews.rightItemView.view.hidden = false;
          if (this._events.restored) this._events.restored(this);
        }
      });
    } else {
      this.cviews.leftItemView.view.hidden = false;
      this.cviews.rightItemView.view.hidden = false;
      if (this._props.title && "font" in this.cviews.titleViewWrapper.view)
        this.cviews.titleViewWrapper.view.font = $font("bold", 17);
      if (this._events.restored) this._events.restored(this);
    }
  }

  expand(animated = true) {
    this.view.hidden = false;
    this.cviews.toolViewWrapper.view.hidden = false;
    this.cviews.titleViewWrapper.view.hidden = false;
    this.view.remakeLayout(navBarLayouts[navBarStyles.expanded]);
    this.cviews.contentView.view.updateLayout(make => make.height.equalTo(50));
    if (animated) {
      $ui.animate({
        duration: 0.3,
        animation: () => {
          this.view.relayout();
          this.cviews.contentView.view.relayout();
          if (this._props.title && "font" in this.cviews.titleViewWrapper.view)
            this.cviews.titleViewWrapper.view.font = $font("bold", 17);
        },
        completion: () => {
          this.cviews.leftItemView.view.hidden = false;
          this.cviews.rightItemView.view.hidden = false;
          //this.cviews.toolViewWrapper.view.hidden = false;
          if (this._events.expanded) this._events.expanded(this);
        }
      });
    } else {
      this.cviews.leftItemView.view.hidden = false;
      this.cviews.rightItemView.view.hidden = false;
      //this.cviews.toolViewWrapper.view.hidden = false;
      if (this._props.title && "font" in this.cviews.titleViewWrapper.view)
        this.cviews.titleViewWrapper.view.font = $font("bold", 17);
      if (this._events.expanded) this._events.expanded(this);
    }
  }

  get style() {
    return this._props.style;
  }

  set style(num) {
    this._props.style = num;
    switch (num) {
      case 0: {
        this.hide();
        break;
      }
      case 1: {
        this.minimize();
        break;
      }
      case 2: {
        this.restore();
        break;
      }
      case 3: {
        this.expand();
        break;
      }
      default:
        break;
    }
  }
}
