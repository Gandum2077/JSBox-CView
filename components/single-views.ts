import { Base } from "./base";

/**
 * 将一个 JSBox 原生视图定义封装为 CView 组件。
 *
 * 封装器保留原生 `props`、`layout`、`events` 和 `views`，并强制使用 CView 分配的 `id`。
 * @template T - JSBox 视图类型名。
 * @template V - 加载后的视图实例类型。
 * @template P - 视图属性类型。
 * @template E - 视图事件类型。
 * @template O - 完整视图定义类型。
 */
export class SingleView<
  T extends UiTypes.AllViewTypes,
  V extends UIBaseView,
  P extends UiTypes.BaseViewProps,
  E extends UiTypes.BaseViewEvents<V>,
  O extends UiTypes.AllViewOptions,
> extends Base<V, O> {
  /** JSBox 视图类型名。 */
  _type: T;
  /** 原生视图属性。 */
  _props?: P;
  /** 根视图布局函数。 */
  _layout?: (make: MASConstraintMaker, view: V) => void;
  /** 原生视图事件。 */
  _events?: E;
  /** 子视图定义。 */
  _views?: UiTypes.AllViewOptions[];
  /** 创建包含 CView `id` 的完整视图定义。 */
  _defineView: () => O;

  /** 创建单个 JSBox 视图的 CView 包装器。 */
  constructor({
    type,
    props,
    layout,
    events,
    views,
  }: {
    /** JSBox 视图类型名。 */
    type: T;
    /** 原生视图属性。 */
    props?: P;
    /** 根视图布局函数。 */
    layout?: (make: MASConstraintMaker, view: V) => void;
    /** 原生视图事件。 */
    events?: E;
    /** 子视图定义。 */
    views?: UiTypes.AllViewOptions[];
  }) {
    super();
    this._type = type || "view";
    this._props = props;
    this._layout = layout;
    this._events = events;
    this._views = views;
    this._defineView = () => {
      return {
        type: this._type,
        props: {
          ...this._props,
          id: this.id,
        },
        layout: this._layout,
        events: this._events,
        views: this._views,
      } as O;
    };
  }
}

/** 透明容器视图，默认填满父视图。 */
export class ClearView extends SingleView<
  "view",
  UIView,
  UiTypes.ViewProps,
  UiTypes.BaseViewEvents<UIView>,
  UiTypes.ViewOptions
> {
  /** 创建透明容器视图。 */
  constructor({
    props,
    layout = $layout.fill,
    events,
    views,
  }: {
    props?: UiTypes.ViewProps;
    layout?: (make: MASConstraintMaker, view: UIView) => void;
    events?: UiTypes.BaseViewEvents<UIView>;
    views?: UiTypes.AllViewOptions[];
  }) {
    super({
      type: "view",
      props: { ...props },
      layout,
      events,
      views,
    });
  }
}

/** 使用语义背景色的内容容器，默认填满安全区域。 */
export class ContentView extends SingleView<
  "view",
  UIView,
  UiTypes.ViewProps,
  UiTypes.BaseViewEvents<UIView>,
  UiTypes.ViewOptions
> {
  /** 创建内容容器视图。 */
  constructor({
    props,
    layout = $layout.fillSafeArea,
    events = {},
    views,
  }: {
    props?: UiTypes.ViewProps;
    layout?: (make: MASConstraintMaker, view: UIView) => void;
    events?: UiTypes.BaseViewEvents;
    views?: UiTypes.AllViewOptions[];
  }) {
    super({
      type: "view",
      props: { bgcolor: $color("primarySurface"), ...props },
      layout,
      events,
      views,
    });
  }
}

/**
 * 拦截底层交互并使内容变暗的遮罩视图。
 *
 * 通常作为覆盖层子视图使用，并通过 `tapped` 事件关闭弹层。
 */
export class MaskView extends SingleView<
  "view",
  UIView,
  UiTypes.ViewProps,
  UiTypes.BaseViewEvents<UIView>,
  UiTypes.ViewOptions
> {
  /** 创建默认为 20% 黑色且填满父视图的遮罩。 */
  constructor({
    props,
    layout = $layout.fill,
    events,
    views,
  }: {
    props?: UiTypes.ViewProps;
    layout?: (make: MASConstraintMaker, view: UIView) => void;
    events?: UiTypes.BaseViewEvents;
    views?: UiTypes.AllViewOptions[];
  }) {
    super({
      type: "view",
      props: {
        bgcolor: $rgba(0, 0, 0, 0.2),
        ...props,
        userInteractionEnabled: true,
      },
      layout,
      events,
      views,
    });
  }
}

/** JSBox `label` 文本标签的 CView 包装器。 */
export class Label extends SingleView<
  "label",
  UILabelView,
  UiTypes.LabelProps,
  UiTypes.BaseViewEvents<UILabelView>,
  UiTypes.LabelOptions
> {
  /** 创建文本标签。 */
  constructor({
    props,
    layout,
    events,
    views,
  }: {
    props?: UiTypes.LabelProps;
    layout?: (make: MASConstraintMaker, view: UILabelView) => void;
    events?: UiTypes.BaseViewEvents<UILabelView>;
    views?: UiTypes.AllViewOptions[];
  }) {
    super({
      type: "label",
      props,
      layout,
      events,
      views,
    });
  }
}

/** JSBox `button` 按钮的 CView 包装器。 */
export class Button extends SingleView<
  "button",
  UIButtonView,
  UiTypes.ButtonProps,
  UiTypes.BaseViewEvents<UIButtonView>,
  UiTypes.ButtonOptions
> {
  /** 创建按钮视图。 */
  constructor({
    props,
    layout,
    events,
    views,
  }: {
    props?: UiTypes.ButtonProps;
    layout?: (make: MASConstraintMaker, view: UIButtonView) => void;
    events?: UiTypes.BaseViewEvents<UIButtonView>;
    views?: UiTypes.AllViewOptions[];
  }) {
    super({
      type: "button",
      props,
      layout,
      events,
      views,
    });
  }
}

/** JSBox `input` 单行文本输入框的 CView 包装器。 */
export class Input extends SingleView<
  "input",
  UIInputView,
  UiTypes.InputProps,
  UiTypes.InputEvents,
  UiTypes.InputOptions
> {
  /** 创建单行文本输入框。 */
  constructor({
    props,
    layout,
    events,
    views,
  }: {
    props?: UiTypes.InputProps;
    layout?: (make: MASConstraintMaker, view: UIInputView) => void;
    events?: UiTypes.InputEvents;
    views?: UiTypes.AllViewOptions[];
  }) {
    super({
      type: "input",
      props,
      layout,
      events,
      views,
    });
  }
}

/** JSBox `slider` 滑杆的 CView 包装器。 */
export class Slider extends SingleView<
  "slider",
  UISliderView,
  UiTypes.SliderProps,
  UiTypes.SliderEvents,
  UiTypes.SliderOptions
> {
  /** 创建滑杆视图。 */
  constructor({
    props,
    layout,
    events,
    views,
  }: {
    props?: UiTypes.SliderProps;
    layout?: (make: MASConstraintMaker, view: UISliderView) => void;
    events?: UiTypes.SliderEvents;
    views?: UiTypes.AllViewOptions[];
  }) {
    super({
      type: "slider",
      props,
      layout,
      events,
      views,
    });
  }
}

/** JSBox `switch` 开关的 CView 包装器。 */
export class Switch extends SingleView<
  "switch",
  UISwitchView,
  UiTypes.SwitchProps,
  UiTypes.SwitchEvents,
  UiTypes.SwitchOptions
> {
  /** 创建开关视图。 */
  constructor({
    props,
    layout,
    events,
    views,
  }: {
    props?: UiTypes.SwitchProps;
    layout?: (make: MASConstraintMaker, view: UISwitchView) => void;
    events?: UiTypes.SwitchEvents;
    views?: UiTypes.AllViewOptions[];
  }) {
    super({
      type: "switch",
      props,
      layout,
      events,
      views,
    });
  }
}

/** JSBox `spinner` 原生加载指示器的 CView 包装器。 */
export class Spinner extends SingleView<
  "spinner",
  UISpinnerView,
  UiTypes.SpinnerProps,
  UiTypes.BaseViewEvents<UISpinnerView>,
  UiTypes.SpinnerOptions
> {
  /** 创建原生加载指示器。 */
  constructor({
    props,
    layout,
    events,
    views,
  }: {
    props?: UiTypes.SpinnerProps;
    layout?: (make: MASConstraintMaker, view: UISpinnerView) => void;
    events?: UiTypes.BaseViewEvents<UISpinnerView>;
    views?: UiTypes.AllViewOptions[];
  }) {
    super({
      type: "spinner",
      props,
      layout,
      events,
      views,
    });
  }
}

/** JSBox `progress` 进度条的 CView 包装器。 */
export class Progress extends SingleView<
  "progress",
  UIProgressView,
  UiTypes.ProgressProps,
  UiTypes.BaseViewEvents<UIProgressView>,
  UiTypes.ProgressOptions
> {
  /** 创建进度条视图。 */
  constructor({
    props,
    layout,
    events,
    views,
  }: {
    props?: UiTypes.ProgressProps;
    layout?: (make: MASConstraintMaker, view: UIProgressView) => void;
    events?: UiTypes.BaseViewEvents<UIProgressView>;
    views?: UiTypes.AllViewOptions[];
  }) {
    super({
      type: "progress",
      props,
      layout,
      events,
      views,
    });
  }
}

/**
 * JSBox `gallery` 图片画廊的 CView 包装器。
 *
 * 适合简单固定内容；需要动态刷新或加载大量图片时优先使用 `ImagePager`。
 */
export class Gallery extends SingleView<
  "gallery",
  UIGalleryView,
  UiTypes.GalleryProps,
  UiTypes.GalleryEvents,
  UiTypes.GalleryOptions
> {
  /** 创建原生图片画廊。 */
  constructor({
    props,
    layout,
    events,
    views,
  }: {
    props?: UiTypes.GalleryProps;
    layout?: (make: MASConstraintMaker, view: UIGalleryView) => void;
    events?: UiTypes.GalleryEvents;
    views?: UiTypes.AllViewOptions[];
  }) {
    super({
      type: "gallery",
      props,
      layout,
      events,
      views,
    });
  }
}

/** JSBox `stepper` 步进器的 CView 包装器。 */
export class Stepper extends SingleView<
  "stepper",
  UIStepperView,
  UiTypes.StepperProps,
  UiTypes.StepperEvents,
  UiTypes.StepperOptions
> {
  /** 创建步进器视图。 */
  constructor({
    props,
    layout,
    events,
    views,
  }: {
    props?: UiTypes.StepperProps;
    layout?: (make: MASConstraintMaker, view: UIStepperView) => void;
    events?: UiTypes.StepperEvents;
    views?: UiTypes.AllViewOptions[];
  }) {
    super({
      type: "stepper",
      props,
      layout,
      events,
      views,
    });
  }
}

/** JSBox `text` 多行文本视图的 CView 包装器。 */
export class Text extends SingleView<"text", UITextView, UiTypes.TextProps, UiTypes.TextEvents, UiTypes.TextOptions> {
  /** 创建多行文本视图。 */
  constructor({
    props,
    layout,
    events,
    views,
  }: {
    props?: UiTypes.TextProps;
    layout?: (make: MASConstraintMaker, view: UITextView) => void;
    events?: UiTypes.TextEvents;
    views?: UiTypes.AllViewOptions[];
  }) {
    super({
      type: "text",
      props,
      layout,
      events,
      views,
    });
  }
}

/** JSBox `image` 图像视图的 CView 包装器。 */
export class Image extends SingleView<
  "image",
  UIImageView,
  UiTypes.ImageProps,
  UiTypes.BaseViewEvents<UIImageView>,
  UiTypes.ImageOptions
> {
  /** 创建图像视图。 */
  constructor({
    props,
    layout,
    events,
    views,
  }: {
    props?: UiTypes.ImageProps;
    layout?: (make: MASConstraintMaker, view: UIImageView) => void;
    events?: UiTypes.BaseViewEvents<UIImageView>;
    views?: UiTypes.AllViewOptions[];
  }) {
    super({
      type: "image",
      props,
      layout,
      events,
      views,
    });
  }
}

/** JSBox `video` 视频视图的 CView 包装器。 */
export class Video extends SingleView<
  "video",
  UIVideoView,
  UiTypes.VideoProps,
  UiTypes.BaseViewEvents<UIVideoView>,
  UiTypes.VideoOptions
> {
  /** 创建视频视图。 */
  constructor({
    props,
    layout,
    events,
    views,
  }: {
    props?: UiTypes.VideoProps;
    layout?: (make: MASConstraintMaker, view: UIVideoView) => void;
    events?: UiTypes.BaseViewEvents<UIVideoView>;
    views?: UiTypes.AllViewOptions[];
  }) {
    super({
      type: "video",
      props,
      layout,
      events,
      views,
    });
  }
}

/** JSBox `scroll` 滚动容器的 CView 包装器。 */
export class Scroll extends SingleView<
  "scroll",
  UIScrollView,
  UiTypes.ScrollProps,
  UiTypes.ScrollEvents,
  UiTypes.ScrollOptions
> {
  /** 创建滚动容器。 */
  constructor({
    props,
    layout,
    events,
    views,
  }: {
    props?: UiTypes.ScrollProps;
    layout?: (make: MASConstraintMaker, view: UIScrollView) => void;
    events?: UiTypes.ScrollEvents;
    views?: UiTypes.AllViewOptions[];
  }) {
    super({
      type: "scroll",
      props,
      layout,
      events,
      views,
    });
  }
}

/** JSBox `stack` 堆栈布局视图的 CView 包装器。 */
export class Stack extends SingleView<
  "stack",
  UIStackView,
  UiTypes.StackProps,
  UiTypes.BaseViewEvents<UIStackView>,
  UiTypes.StackOptions
> {
  /** 创建堆栈布局视图。 */
  constructor({
    props,
    layout,
    events,
    views,
  }: {
    props?: UiTypes.StackProps;
    layout?: (make: MASConstraintMaker, view: UIStackView) => void;
    events?: UiTypes.BaseViewEvents<UIStackView>;
    views?: UiTypes.AllViewOptions[];
  }) {
    super({
      type: "stack",
      props,
      layout,
      events,
      views,
    });
  }
}

/** JSBox `tab` 分段选择器的 CView 包装器。 */
export class Tab extends SingleView<"tab", UITabView, UiTypes.TabProps, UiTypes.TabEvents, UiTypes.TabOptions> {
  /** 创建分段选择器。 */
  constructor({
    props,
    layout,
    events,
    views,
  }: {
    props?: UiTypes.TabProps;
    layout?: (make: MASConstraintMaker, view: UITabView) => void;
    events?: UiTypes.TabEvents;
    views?: UiTypes.AllViewOptions[];
  }) {
    super({
      type: "tab",
      props,
      layout,
      events,
      views,
    });
  }
}

/** JSBox `menu` 菜单视图的 CView 包装器。 */
export class Menu extends SingleView<"menu", UIMenuView, UiTypes.MenuProps, UiTypes.MenuEvents, UiTypes.MenuOptions> {
  /** 创建菜单视图。 */
  constructor({
    props,
    layout,
    events,
    views,
  }: {
    props?: UiTypes.MenuProps;
    layout?: (make: MASConstraintMaker, view: UIMenuView) => void;
    events?: UiTypes.MenuEvents;
    views?: UiTypes.AllViewOptions[];
  }) {
    super({
      type: "menu",
      props,
      layout,
      events,
      views,
    });
  }
}

/** JSBox `map` 地图视图的 CView 包装器。 */
export class Map extends SingleView<
  "map",
  UIMapView,
  UiTypes.MapProps,
  UiTypes.BaseViewEvents<UIMapView>,
  UiTypes.MapOptions
> {
  /** 创建地图视图。 */
  constructor({
    props,
    layout,
    events,
    views,
  }: {
    props?: UiTypes.MapProps;
    layout?: (make: MASConstraintMaker, view: UIMapView) => void;
    events?: UiTypes.BaseViewEvents<UIMapView>;
    views?: UiTypes.AllViewOptions[];
  }) {
    super({
      type: "map",
      props,
      layout,
      events,
      views,
    });
  }
}

/**
 * JSBox `web` 网页视图的 CView 包装器。
 *
 * 需要原生 WKWebView 能力、登录或 Cloudflare 流程时应使用 `OCWebView`。
 */
export class Web extends SingleView<"web", UIWebView, UiTypes.WebProps, UiTypes.WebEvents, UiTypes.WebOptions> {
  /** 创建 JSBox 内置网页视图。 */
  constructor({
    props,
    layout,
    events,
    views,
  }: {
    props?: UiTypes.WebProps;
    layout?: (make: MASConstraintMaker, view: UIWebView) => void;
    events?: UiTypes.WebEvents;
    views?: UiTypes.AllViewOptions[];
  }) {
    super({
      type: "web",
      props,
      layout,
      events,
      views,
    });
  }
}

/**
 * JSBox `list` 列表视图的 CView 包装器。
 *
 * 适合原生固定列表；行高取决于组件宽度时优先使用 `DynamicRowHeightList`。
 */
export class List extends SingleView<"list", UIListView, UiTypes.ListProps, UiTypes.ListEvents, UiTypes.ListOptions> {
  /** 创建原生列表视图。 */
  constructor({
    props,
    layout,
    events,
    views,
  }: {
    props?: UiTypes.ListProps;
    layout?: (make: MASConstraintMaker, view: UIListView) => void;
    events?: UiTypes.ListEvents;
    views?: UiTypes.AllViewOptions[];
  }) {
    super({
      type: "list",
      props,
      layout,
      events,
      views,
    });
  }
}

/**
 * JSBox `matrix` 网格视图的 CView 包装器。
 *
 * 需要响应式列数和单元格尺寸时优先使用 `DynamicItemSizeMatrix`。
 */
export class Matrix extends SingleView<
  "matrix",
  UIMatrixView,
  UiTypes.MatrixProps,
  UiTypes.MatrixEvents,
  UiTypes.MatrixOptions
> {
  /** 创建原生网格视图。 */
  constructor({
    props,
    layout,
    events,
    views,
  }: {
    props?: UiTypes.MatrixProps;
    layout?: (make: MASConstraintMaker, view: UIMatrixView) => void;
    events?: UiTypes.MatrixEvents;
    views?: UiTypes.AllViewOptions[];
  }) {
    super({
      type: "matrix",
      props,
      layout,
      events,
      views,
    });
  }
}

/** JSBox `blur` 模糊视图的 CView 包装器。 */
export class Blur extends SingleView<
  "blur",
  UIBlurView,
  UiTypes.BlurProps,
  UiTypes.BaseViewEvents<UIBlurView>,
  UiTypes.BlurOptions
> {
  /** 创建模糊背景视图。 */
  constructor({
    props,
    layout,
    events,
    views,
  }: {
    props?: UiTypes.BlurProps;
    layout?: (make: MASConstraintMaker, view: UIBlurView) => void;
    events?: UiTypes.BaseViewEvents<UIBlurView>;
    views?: UiTypes.AllViewOptions[];
  }) {
    super({
      type: "blur",
      props,
      layout,
      events,
      views,
    });
  }
}

/** JSBox `gradient` 渐变视图的 CView 包装器。 */
export class Gradient extends SingleView<
  "gradient",
  UIGradientView,
  UiTypes.GradientProps,
  UiTypes.BaseViewEvents<UIGradientView>,
  UiTypes.GradientOptions
> {
  /** 创建渐变视图。 */
  constructor({
    props,
    layout,
    events,
    views,
  }: {
    props?: UiTypes.GradientProps;
    layout?: (make: MASConstraintMaker, view: UIGradientView) => void;
    events?: UiTypes.BaseViewEvents<UIGradientView>;
    views?: UiTypes.AllViewOptions[];
  }) {
    super({
      type: "gradient",
      props,
      layout,
      events,
      views,
    });
  }
}

/** JSBox `date-picker` 日期选择器的 CView 包装器。 */
export class DatePicker extends SingleView<
  "date-picker",
  UIDatePickerView,
  UiTypes.DatePickerProps,
  UiTypes.DatePickerEvents,
  UiTypes.DatePickerOptions
> {
  /** 创建日期选择器。 */
  constructor({
    props,
    layout,
    events,
    views,
  }: {
    props?: UiTypes.DatePickerProps;
    layout?: (make: MASConstraintMaker, view: UIDatePickerView) => void;
    events?: UiTypes.DatePickerEvents;
    views?: UiTypes.AllViewOptions[];
  }) {
    super({
      type: "date-picker",
      props,
      layout,
      events,
      views,
    });
  }
}

/** JSBox `picker` 多列选择器的 CView 包装器。 */
export class Picker extends SingleView<
  "picker",
  UIPickerView,
  UiTypes.PickerProps,
  UiTypes.PickerEvents,
  UiTypes.PickerOptions
> {
  /** 创建多列选择器。 */
  constructor({
    props,
    layout,
    events,
    views,
  }: {
    props?: UiTypes.PickerProps;
    layout?: (make: MASConstraintMaker, view: UIPickerView) => void;
    events?: UiTypes.PickerEvents;
    views?: UiTypes.AllViewOptions[];
  }) {
    super({
      type: "picker",
      props,
      layout,
      events,
      views,
    });
  }
}

/** JSBox `canvas` 绘图画布的 CView 包装器。 */
export class Canvas extends SingleView<
  "canvas",
  UICanvasView,
  UiTypes.CanvasProps,
  UiTypes.CanvasEvents,
  UiTypes.CanvasOptions
> {
  /** 创建绘图画布。 */
  constructor({
    props,
    layout,
    events,
    views,
  }: {
    props?: UiTypes.CanvasProps;
    layout?: (make: MASConstraintMaker, view: UICanvasView) => void;
    events?: UiTypes.CanvasEvents;
    views?: UiTypes.AllViewOptions[];
  }) {
    super({
      type: "canvas",
      props,
      layout,
      events,
      views,
    });
  }
}

/** JSBox `markdown` Markdown 内容视图的 CView 包装器。 */
export class Markdown extends SingleView<
  "markdown",
  UIMarkdownView,
  UiTypes.MarkdownProps,
  UiTypes.BaseViewEvents<UIMarkdownView>,
  UiTypes.MarkdownOptions
> {
  /** 创建 Markdown 内容视图。 */
  constructor({
    props,
    layout,
    events,
    views,
  }: {
    props?: UiTypes.MarkdownProps;
    layout?: (make: MASConstraintMaker, view: UIMarkdownView) => void;
    events?: UiTypes.BaseViewEvents<UIMarkdownView>;
    views?: UiTypes.AllViewOptions[];
  }) {
    super({
      type: "markdown",
      props,
      layout,
      events,
      views,
    });
  }
}

/** JSBox `lottie` Lottie 动画视图的 CView 包装器。 */
export class Lottie extends SingleView<
  "lottie",
  UILottieView,
  UiTypes.LottieProps,
  UiTypes.BaseViewEvents<UILottieView>,
  UiTypes.LottieOptions
> {
  /** 创建 Lottie 动画视图。 */
  constructor({
    props,
    layout,
    events,
    views,
  }: {
    props?: UiTypes.LottieProps;
    layout?: (make: MASConstraintMaker, view: UILottieView) => void;
    events?: UiTypes.BaseViewEvents<UILottieView>;
    views?: UiTypes.AllViewOptions[];
  }) {
    super({
      type: "lottie",
      props,
      layout,
      events,
      views,
    });
  }
}

/** JSBox `chart` 图表视图的 CView 包装器。 */
export class Chart extends SingleView<
  "chart",
  UIChartView,
  UiTypes.ChartProps,
  UiTypes.ChartEvents,
  UiTypes.ChartOptions
> {
  /** 创建图表视图。 */
  constructor({
    props,
    layout,
    events,
    views,
  }: {
    props?: UiTypes.ChartProps;
    layout?: (make: MASConstraintMaker, view: UIChartView) => void;
    events?: UiTypes.ChartEvents;
    views?: UiTypes.AllViewOptions[];
  }) {
    super({
      type: "chart",
      props,
      layout,
      events,
      views,
    });
  }
}

/** JSBox `code` 代码编辑视图的 CView 包装器。 */
export class Code extends SingleView<
  "code",
  UICodeView,
  UiTypes.CodeProps,
  UiTypes.BaseViewEvents<UICodeView>,
  UiTypes.CodeOptions
> {
  /** 创建代码编辑视图。 */
  constructor({
    props,
    layout,
    events,
    views,
  }: {
    props?: UiTypes.CodeProps;
    layout?: (make: MASConstraintMaker, view: UICodeView) => void;
    events?: UiTypes.BaseViewEvents<UICodeView>;
    views?: UiTypes.AllViewOptions[];
  }) {
    super({
      type: "code",
      props,
      layout,
      events,
      views,
    });
  }
}

/** JSBox `runtime` 原生 Objective-C 视图的 CView 包装器。 */
export class Runtime extends SingleView<
  "runtime",
  UIView,
  UiTypes.RuntimeProps,
  UiTypes.BaseViewEvents<UIView>,
  UiTypes.RuntimeOptions
> {
  /** 创建原生 Objective-C 运行时视图。 */
  constructor({
    props,
    layout,
    events,
    views,
  }: {
    props?: UiTypes.RuntimeProps;
    layout?: (make: MASConstraintMaker, view: UIView) => void;
    events?: UiTypes.BaseViewEvents<UIView>;
    views?: UiTypes.AllViewOptions[];
  }) {
    super({
      type: "runtime",
      props,
      layout,
      events,
      views,
    });
  }
}
