import { Base } from "./base";
import { Button, ContentView, Image, Scroll, SingleView } from "./single-views";
import { PageViewer } from "./pageviewer";
import { PageControl } from "./page-control";
import { SymbolButton } from "./symbol-button";

/** 欢迎页底部按钮；可通过 buttons 获取实例以更新标题和 enabled。 */
export interface WelcomeViewButton {
  /** 原生按钮外观。 */
  props: UiTypes.ButtonProps;
  /** 点击操作，由调用方决定翻页、登录或关闭。 */
  tapped: (sender: UIButtonView, welcome: WelcomeView) => void;
}

/** 单页右上角操作，可用于“跳过”“完成”等不同功能。 */
export interface WelcomeViewTrailingAction {
  /** 按钮文字。 */
  title: string;
  /** 文字颜色，默认 primaryText。 */
  titleColor?: UIColor;
  /** 点击时执行当前页的操作；组件不会自动翻页或关闭。 */
  tapped: (sender: WelcomeView) => void;
}

/** 一个欢迎页面的内容与操作。 */
export interface WelcomeViewPageContent {
  /** 右上角操作；省略则该页不显示。最后一页可配置为“完成”。 */
  trailingAction?: WelcomeViewTrailingAction;
  /** 主体组件，其根布局应使用 $layout.fill。 */
  content: Base<any, any>;
  /** 仅正文或表单的高度，不含 Logo 和间距；动态内容应按实际可用宽度计算，单位为点。 */
  contentHeight: number | ((width: number) => number);
  /** 从上至下排列的一个或两个按钮。 */
  buttons: [WelcomeViewButton] | [WelcomeViewButton, WelcomeViewButton];
  /** 整页背景色，包含顶部操作、分页指示器及安全区域；省略时使用 WelcomeView 的 bgcolor。 */
  bgcolor?: UIColor;
}

/** Logo 的图片属性与正方形显示尺寸。 */
export interface WelcomeViewLogo {
  /** 图片来源及外观，例如 src、image、symbol、tintColor。 */
  props: UiTypes.ImageProps;
  /** 边长，默认 128pt；窄屏时不超过内容宽度。 */
  size?: number;
}

/** 根据是否提供 logo 选择布局；也可用 mode 显式指定。 */
export type WelcomeViewPage = WelcomeViewPageContent &
  (
    | {
        /** 仅内容模式。 */
        mode?: "content";
        /** 仅内容模式不单独设置 Logo。 */
        logo?: never;
        /** 仅内容模式不使用 Logo 间距。 */
        logoSpacing?: never;
      }
    | {
        /** Logo 与内容分开布局，间距随可用空间伸缩。 */
        mode?: "logo-content";
        /** 位于内容上方的 Logo。 */
        logo: WelcomeViewLogo;
        /** Logo 与内容的间距范围，默认 24～80pt。 */
        logoSpacing?: { min?: number; max?: number };
      }
  );

/** WelcomeView 的初始页面、顶部操作与宽度配置。 */
export interface WelcomeViewProps {
  /** 至少一个页面；创建后不支持替换页面数组。 */
  pages: WelcomeViewPage[];
  /** 初始页码，默认 0。 */
  page?: number;
  /** 左上角按钮的 SF Symbol；省略则隐藏。 */
  leadingSymbol?: string;
  /** 左上角按钮的 SF Symbol 颜色，默认 `primaryText`。 */
  leadingSymbolColor?: UIColor;
  /** 主体及底部按钮的最大宽度，默认 600。 */
  maxContentWidth?: number;
  /** 主体及按钮的水平边距，默认 24。 */
  horizontalInset?: number;
  /** 未设置页面 bgcolor 时使用的默认背景色。 */
  bgcolor?: UIColor;
}

/** 欢迎页导航与翻页事件。 */
export interface WelcomeViewEvents {
  /** 点击左上角按钮。 */
  leadingTapped?: (sender: WelcomeView) => void;
  /** 手势或程序化翻页后触发。 */
  changed?: (sender: WelcomeView, page: number) => void;
}

/**
 * 自适应欢迎页，复用 PageViewer 与 PageControl。
 *
 * 主体在扣除底部按钮后的区域居中，按钮高 50、间距 12。高度不足时主体与按钮一起滚动，
 * 每页背景随全屏分页器滑动，顶部操作及分页指示器作为透明浮层始终可见。宽度变化时重新计算主体高度；不会强制最小内容宽度。
 * 主体内部使用 Auto Layout，滚动容器使用 frame 规避 JSBox scroll 子视图布局问题。
 */
export class WelcomeView extends Base<UIView, UiTypes.ViewOptions> {
  /** 底部按钮实例，按页面及显示顺序索引。 */
  readonly buttons: Button[][] = [];
  /** 复用的水平分页器。 */
  readonly pageViewer: PageViewer;
  /** 复用的原生分页指示器。 */
  readonly pageControl: PageControl;
  private readonly _pages: WelcomeViewPage[];
  private readonly _refreshers: ((force?: boolean) => void)[] = [];
  protected _defineView: () => UiTypes.ViewOptions;

  /** 创建欢迎页。 */
  constructor({
    props,
    layout,
    events = {},
  }: {
    props: WelcomeViewProps;
    layout: (make: MASConstraintMaker, view: UIView) => void;
    events?: WelcomeViewEvents;
  }) {
    super();
    this._pages = props.pages.slice();
    if (!this._pages.length) throw new Error("WelcomeView requires at least one page");
    const initialPage = props.page ?? 0;
    this._validatePage(initialPage);
    const hasTrailingAction = this._pages.some((page) => page.trailingAction);
    const headerHeight = props.leadingSymbol || hasTrailingAction ? 50 : 0;
    const indicatorHeight = this._pages.length > 1 ? 28 : 0;
    const maxWidth = props.maxContentWidth ?? 600;
    const inset = props.horizontalInset ?? 24;
    if (!Number.isFinite(maxWidth) || maxWidth <= 0 || !Number.isFinite(inset) || inset < 0)
      throw new Error("Invalid WelcomeView width or inset");
    const pages = this._pages.map((page) => {
      if (page.buttons.length < 1 || page.buttons.length > 2)
        throw new Error("WelcomeView requires 1–2 buttons per page");
      const logoOptions = page.logo;
      if (page.mode === "logo-content" && !logoOptions) throw new Error("Logo-content mode requires a logo");
      const logoSize = logoOptions?.size ?? 128;
      const minGap = page.logoSpacing?.min ?? 24;
      const maxGap = page.logoSpacing?.max ?? 80;
      if (
        logoOptions &&
        (!Number.isFinite(logoSize) ||
          logoSize <= 0 ||
          !Number.isFinite(minGap) ||
          minGap < 0 ||
          !Number.isFinite(maxGap) ||
          maxGap < minGap)
      )
        throw new Error("Invalid WelcomeView logo size or spacing");
      const logo = logoOptions
        ? new Image({
            props: { contentMode: 1, ...logoOptions.props },
            layout: (make) => {
              make.left.top.equalTo(0);
              make.width.height.equalTo(1);
            },
          })
        : undefined;
      const footerHeight = page.buttons.length * 50 + (page.buttons.length - 1) * 12;
      const body = new ContentView({
        props: { bgcolor: $color("clear") },
        layout: (make, view) => {
          make.left.equalTo(0);
          make.top.equalTo(16);
          make.width.height.equalTo(1);
        },
        views: [page.content.definition],
      });
      const buttons = page.buttons.map(
        (button, index) =>
          new Button({
            props: { bgcolor: $color("systemLink"), titleColor: $color("white"), cornerRadius: 8, ...button.props },
            layout: (make, view) => {
              make.left.right.equalTo(view.super);
              make.top.equalTo(view.super).offset(index * 62);
              make.height.equalTo(50);
            },
            events: { tapped: (sender) => button.tapped(sender, this) },
          }),
      );
      this.buttons.push(buttons);
      const footer = new ContentView({
        props: { bgcolor: $color("clear") },
        layout: (make, view) => {
          make.left.equalTo(0);
          make.top.equalTo(16);
          make.width.equalTo(1);
          make.height.equalTo(footerHeight);
        },
        views: buttons.map((button) => button.definition),
      });
      // 不提供 layout，保留滚动内容容器的 frame 布局；内部子视图使用完整约束。
      const canvas = new SingleView<
        "view",
        UIView,
        UiTypes.ViewProps,
        UiTypes.BaseViewEvents<UIView>,
        UiTypes.ViewOptions
      >({
        type: "view",
        props: { bgcolor: $color("clear"), frame: $rect(0, 0, 1, 1) },
        views: [body.definition, footer.definition, ...(logo ? [logo.definition] : [])],
      });
      let lastGeometry = "";
      let canvasFrame: JBRect | undefined;
      // JSBox 在滚动触发布局时可能重新应用定义中的初始 frame。
      // 内容仍可绘制在容器之外，但 UIKit 命中测试会被缩小的父容器截断。
      const restoreCanvasFrame = () => {
        if (!canvasFrame || !canvas.view) return;
        const current = canvas.view.frame;
        if (
          current.x === canvasFrame.x &&
          current.y === canvasFrame.y &&
          current.width === canvasFrame.width &&
          current.height === canvasFrame.height
        )
          return;
        canvas.view.frame = $rect(canvasFrame.x, canvasFrame.y, canvasFrame.width, canvasFrame.height);
        canvas.view.setNeedsLayout();
        canvas.view.layoutIfNeeded();
      };
      const update = (sender: UIScrollView, force = false) => {
        const { width, height } = sender.frame;
        if (width <= 0 || height <= 0 || !canvas.view || !body.view || !footer.view || (logo && !logo.view)) return;
        const contentWidth = Math.min(maxWidth, Math.max(1, width - 2 * Math.min(inset, width / 4)));
        const contentHeight =
          typeof page.contentHeight === "function" ? page.contentHeight(contentWidth) : page.contentHeight;
        if (!Number.isFinite(contentHeight) || contentHeight < 0) throw new Error("Invalid WelcomeView content height");
        const geometry = `${width}:${height}:${contentHeight}`;
        if (!force && geometry === lastGeometry) {
          restoreCanvasFrame();
          return;
        }
        lastGeometry = geometry;
        const actualLogoSize = logo ? Math.min(logoSize, contentWidth) : 0;
        // 扣除按钮、上下留白和最小间距后，剩余空间的三分之一分配给 Logo 间距。
        const spareHeight = height - footerHeight - 64 - contentHeight - actualLogoSize - (logo ? minGap : 0);
        const gap = logo ? Math.min(maxGap, minGap + Math.max(0, spareHeight) / 3) : 0;
        const groupHeight = actualLogoSize + gap + contentHeight;
        const totalHeight = Math.max(height, groupHeight + footerHeight + 64);
        const footerY = totalHeight - 16 - footerHeight;
        const groupY = 16 + (footerY - 48 - groupHeight) / 2;
        const bodyY = groupY + actualLogoSize + gap;
        if (logo)
          logo.view.updateLayout((make) => {
            make.left.equalTo((width - actualLogoSize) / 2);
            make.top.equalTo(groupY);
            make.width.height.equalTo(actualLogoSize);
          });
        // frame 驱动的容器不作为 centerX 约束基准；横向位置直接由当前视口计算。
        const contentLeft = (width - contentWidth) / 2;
        body.view.updateLayout((make) => {
          make.left.equalTo(contentLeft);
          make.top.equalTo(bodyY);
          make.width.equalTo(contentWidth);
          make.height.equalTo(contentHeight);
        });
        footer.view.updateLayout((make) => {
          make.left.equalTo(contentLeft);
          make.top.equalTo(footerY);
          make.width.equalTo(contentWidth);
        });
        canvasFrame = $rect(0, 0, width, totalHeight);
        canvas.view.frame = $rect(0, 0, width, totalHeight);
        canvas.view.setNeedsLayout();
        canvas.view.layoutIfNeeded();
        sender.contentSize = $size(width, totalHeight);
        const offset = Math.min(Math.max(0, sender.contentOffset.y), totalHeight - height);
        if (sender.contentOffset.x !== 0 || sender.contentOffset.y !== offset) sender.contentOffset = $point(0, offset);
      };
      const scroll = new Scroll({
        props: {
          alwaysBounceVertical: false,
          alwaysBounceHorizontal: false,
          showsHorizontalIndicator: false,
          bgcolor: $color("clear"),
        },
        // 背景铺满整页，只有正文的滚动视口避开安全区域及悬浮控件。
        layout: (make, view) => {
          make.left.right.equalTo(view.super.safeArea);
          make.top.equalTo(view.super.safeArea).offset(headerHeight);
          make.bottom.equalTo(view.super.safeArea).offset(-indicatorHeight);
        },
        views: [canvas.definition],
        events: {
          layoutSubviews: (sender) => update(sender),
          ready: (sender) => update(sender),
          didScroll: () => restoreCanvasFrame(),
        },
      });
      configureWelcomeScroll(scroll, false);
      this._refreshers.push((force = false) => {
        if (scroll.view) update(scroll.view, force);
      });
      return new ContentView({
        props: { bgcolor: page.bgcolor ?? props.bgcolor ?? $color("backgroundColor") },
        layout: $layout.fill,
        views: [scroll.definition],
      });
    });
    this.pageControl = new PageControl({
      props: { numberOfPages: pages.length, currentPage: initialPage },
      layout: (make, view) => {
        make.left.right.bottom.equalTo(view.super.safeArea);
        make.height.equalTo(indicatorHeight);
      },
      events: { changed: (_sender, page) => this.scrollToPage(page) },
    });
    const initialAction = this._pages[initialPage].trailingAction;
    const trailingButton = new Button({
      props: {
        title: initialAction?.title ?? "",
        hidden: !initialAction,
        font: $font(17),
        bgcolor: $color("clear"),
        titleColor: initialAction?.titleColor ?? $color("primaryText"),
      },
      layout: (make) => {
        make.right.inset(25);
        make.top.inset(12.5);
        make.height.equalTo(25);
      },
      events: { tapped: () => this._pages[this.page].trailingAction?.tapped(this) },
    });
    const syncTrailingAction = (page: number) => {
      const action = this._pages[page].trailingAction;
      if (!trailingButton.view) return;
      trailingButton.view.title = action?.title ?? "";
      trailingButton.view.titleColor = action?.titleColor ?? $color("primaryText");
      trailingButton.view.hidden = !action;
    };
    const header = new ContentView({
      props: { bgcolor: $color("clear") },
      layout: (make, view) => {
        make.left.right.top.equalTo(view.super.safeArea);
        make.height.equalTo(headerHeight);
      },
      views: [
        ...(props.leadingSymbol
          ? [
              new SymbolButton({
                props: { symbol: props.leadingSymbol, tintColor: props.leadingSymbolColor ?? $color("primaryText") },
                layout: (make) => {
                  make.left.inset(12.5);
                  make.top.inset(0);
                  make.width.height.equalTo(50);
                },
                events: { tapped: () => events.leadingTapped?.(this) },
              }).definition,
            ]
          : []),
        ...(hasTrailingAction ? [trailingButton.definition] : []),
      ],
    });
    this.pageViewer = new PageViewer({
      props: { page: initialPage, cviews: pages },
      layout: $layout.fill,
      events: {
        changed: (_sender, page) => {
          this.pageControl.currentPage = page;
          syncTrailingAction(page);
          events.changed?.(this, page);
        },
      },
    });
    configureWelcomeScroll(this.pageViewer.scroll, true);
    this._defineView = () => ({
      type: "view",
      props: { bgcolor: props.bgcolor ?? $color("backgroundColor") },
      layout,
      // 后创建的透明控件叠在分页器上；背景随每一页一起滑动。
      views: [this.pageViewer.definition, header.definition, this.pageControl.definition],
      events: {
        // 子视图全部装载后再测量，避免 scroll 首次布局发生在后代就绪之前。
        ready: () => {
          syncTrailingAction(this.page);
          this.refreshLayout();
        },
        layoutSubviews: () => this._refreshers.forEach((refresh) => refresh()),
      },
    });
  }

  /**
   * 当前逻辑页码。
   * @returns 当前页面索引。
   */
  get page() {
    return this.pageViewer.page;
  }

  /** 无动画切换，需在组件加载后调用。 */
  set page(page: number) {
    this._validatePage(page);
    this.pageViewer.page = page;
  }

  /**
   * 动画切换页面，需在组件加载后调用。
   * @param page - 目标页码。
   */
  scrollToPage(page: number) {
    this._validatePage(page);
    this.pageViewer.scrollToPage(page);
  }

  /** 主体内容改变后重新计算高度，并将滚动位置限制在有效范围。 */
  refreshLayout() {
    this._refreshers.forEach((refresh) => refresh(true));
  }

  /**
   * 检查页码边界。
   * @param page - 目标页码。
   */
  private _validatePage(page: number) {
    if (!Number.isInteger(page) || page < 0 || page >= this._pages.length)
      throw new RangeError("Invalid WelcomeView page");
  }
}

/**
 * 欢迎页已经通过约束处理安全区域，禁用额外 inset 并恢复旋转后的有效滚动位置。
 * 仅包装本组件拥有的 Scroll，不改动调用方正文中的滚动控件。
 * @param scroll - 内部滚动组件。
 * @param horizontal - 是否为横向分页器；保留其横向页码位置。
 */
function configureWelcomeScroll(scroll: Scroll, horizontal: boolean) {
  const original = scroll._events ?? {};
  let width = 0;
  let correcting = false;
  const restore = (sender: UIScrollView, resized = false) => {
    if (correcting || sender.frame.width <= 0 || sender.frame.height <= 0) return;
    const maxY = Math.max(0, sender.contentSize.height - sender.frame.height);
    const x = horizontal ? sender.contentOffset.x : 0;
    const y = horizontal || resized || maxY <= 0.5 ? 0 : Math.min(maxY, Math.max(0, sender.contentOffset.y));
    if (sender.contentOffset.x === x && sender.contentOffset.y === y) return;
    correcting = true;
    try {
      sender.contentOffset = $point(x, y);
    } finally {
      correcting = false;
    }
  };
  scroll._props = { ...scroll._props, contentInset: $insets(0, 0, 0, 0) };
  scroll._events = {
    ...original,
    ready: (sender) => {
      // UIScrollViewContentInsetAdjustmentNever，避免安全区域被计算两次。
      sender.ocValue().$setContentInsetAdjustmentBehavior(2);
      original.ready?.(sender);
      restore(sender);
    },
    layoutSubviews: (sender) => {
      const nextWidth = sender.frame.width;
      const resized = width > 0 && nextWidth > 0 && width !== nextWidth;
      if (nextWidth > 0) width = nextWidth;
      original.layoutSubviews?.(sender);
      restore(sender, resized);
    },
    didScroll: (sender) => {
      original.didScroll?.(sender);
      // 即使内容几何缓存命中，仍需纠正 UIKit 后续恢复的过期偏移。
      restore(sender);
    },
  };
}
