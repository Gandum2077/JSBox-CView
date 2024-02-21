/**
 * 实现单个视图的定义
 */

import { Base } from "./base";

export class SingleView<
  T extends UiTypes.AllViewTypes,
  V extends UIBaseView,
  P extends UiTypes.BaseViewProps,
  E extends UiTypes.BaseViewEvents<V>,
  O extends UiTypes.AllViewOptions
> extends Base<V, O> {
  _type: T;
  _props?: P;
  _layout?: (make: MASConstraintMaker, view: V) => void;
  _events?: E;
  _views?: UiTypes.AllViewOptions[];
  _defineView: () => O;
  constructor({ type, props, layout, events, views }: {
    type: T;
    props?: P;
    layout?: (make: MASConstraintMaker, view: V) => void;
    events?: E;
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
          id: this.id
        },
        layout: this._layout,
        events: this._events,
        views: this._views
      } as O;
    }
  }
}

export class RootView extends SingleView<
  "view",
  UIView,
  UiTypes.BaseViewProps,
  UiTypes.BaseViewEvents<UIView>,
  UiTypes.ViewOptions
  > {
  constructor({ 
    layout = $layout.fill, 
    events, 
    views 
  }: {
    layout?: (make: MASConstraintMaker, view: UIView) => void;
    events?: UiTypes.BaseViewEvents<UIView>;
    views?: UiTypes.AllViewOptions[];
  }) {
    super({
      type: "view",
      props: { bgcolor: $color("clear") },
      layout,
      events,
      views
    });
  }
}

export class ContentView extends SingleView<
  "view",
  UIView,
  UiTypes.BaseViewProps,
  UiTypes.BaseViewEvents<UIView>,
  UiTypes.ViewOptions
  > {
  constructor({
    props,
    layout = $layout.fillSafeArea,
    events = {},
    views
  }: {
    props?: UiTypes.BaseViewProps;
    layout?: (make: MASConstraintMaker, view: UIView) => void;
    events?: UiTypes.BaseViewEvents;
    views?: UiTypes.AllViewOptions[];
  }) {
    super({
      type: "view",
      props: { bgcolor: $color("primarySurface"), ...props },
      layout,
      events,
      views
    });
  }
}

/**
 * 遮挡视图，使得下面的view无法操作并且整体变暗。
 * 设计上此视图不单独使用，而是作为一个子视图
 * events:
 *   - tapped 点击事件，通常用于dismiss
 */
export class MaskView extends SingleView<
  "view",
  UIView,
  UiTypes.BaseViewProps, 
  UiTypes.BaseViewEvents<UIView>,
  UiTypes.ViewOptions
  > {
  constructor({ 
    props, 
    layout = $layout.fill, 
    events, 
    views 
  }: {
    props?: UiTypes.BaseViewProps;
    layout?: (make: MASConstraintMaker, view: UIView) => void;
    events?: UiTypes.BaseViewEvents;
    views?: UiTypes.AllViewOptions[];
  }) {
    super({
      type: "view",
      props: {
        bgcolor: $rgba(0, 0, 0, 0.2),
        ...props,
        userInteractionEnabled: true
      },
      layout,
      events,
      views
    });
  }
}

export class Label extends SingleView<
  "label",
  UILabelView, 
  UiTypes.LabelProps, 
  UiTypes.BaseViewEvents<UILabelView>,
  UiTypes.LabelOptions
  > {
  constructor({ props, layout, events, views }: {
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
      views
    });
  }
}

export class Button extends SingleView<
  "button",
  UIButtonView, 
  UiTypes.ButtonProps, 
  UiTypes.BaseViewEvents<UIButtonView>,
  UiTypes.ButtonOptions
  > {
  constructor({ props, layout, events, views }: {
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
      views
    });
  }
}

export class Input extends SingleView<
  "input",
  UIInputView, 
  UiTypes.InputProps, 
  UiTypes.InputEvents,
  UiTypes.InputOptions
  > {
  constructor({ props, layout, events, views }: {
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
      views
    });
  }
}

export class Slider extends SingleView<
  "slider",
  UISliderView, 
  UiTypes.SliderProps, 
  UiTypes.SliderEvents,
  UiTypes.SliderOptions
  > {
  constructor({ props, layout, events, views }: {
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
      views
    });
  }
}

export class Switch extends SingleView<
  "switch",
  UISwitchView, 
  UiTypes.SwitchProps, 
  UiTypes.SwitchEvents,
  UiTypes.SwitchOptions
  > {
  constructor({ props, layout, events, views }: {
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
      views
    });
  }
}

export class Spinner extends SingleView<
  "spinner",
  UISpinnerView, 
  UiTypes.SpinnerProps, 
  UiTypes.BaseViewEvents<UISpinnerView>,
  UiTypes.SpinnerOptions
  > {
  constructor({ props, layout, events, views }: {
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
      views
    });
  }
}

export class Progress extends SingleView<
  "progress",
  UIProgressView, 
  UiTypes.ProgressProps, 
  UiTypes.BaseViewEvents<UIProgressView>,
  UiTypes.ProgressOptions
  > {
  constructor({ props, layout, events, views }: {
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
      views
    });
  }
}

export class Gallery extends SingleView<
  "gallery",
  UIGalleryView, 
  UiTypes.GalleryProps, 
  UiTypes.GalleryEvents,
  UiTypes.GalleryOptions
  > {
  constructor({ props, layout, events, views }: {
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
      views
    });
  }
}

export class Stepper extends SingleView<
  "stepper",
  UIStepperView, 
  UiTypes.StepperProps, 
  UiTypes.StepperEvents,
  UiTypes.StepperOptions
  > {
  constructor({ props, layout, events, views }: {
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
      views
    });
  }
}

export class Text extends SingleView<
  "text",
  UITextView, 
  UiTypes.TextProps, 
  UiTypes.TextEvents,
  UiTypes.TextOptions
  > {
  constructor({ props, layout, events, views }: {
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
      views
    });
  }
}

export class Image extends SingleView<
  "image",
  UIImageView, 
  UiTypes.ImageProps, 
  UiTypes.BaseViewEvents<UIImageView>,
  UiTypes.ImageOptions
  > {
  constructor({ props, layout, events, views }: {
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
      views
    });
  }
}

export class Video extends SingleView<
  "video",
  UIVideoView, 
  UiTypes.VideoProps, 
  UiTypes.BaseViewEvents<UIVideoView>,
  UiTypes.VideoOptions
  > {
  constructor({ props, layout, events, views }: {
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
      views
    });
  }
}

export class Scroll extends SingleView<
  "scroll",
  UIScrollView, 
  UiTypes.ScrollProps, 
  UiTypes.ScrollEvents,
  UiTypes.ScrollOptions
  > {
  constructor({ props, layout, events, views }: {
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
      views
    });
  }
}

export class Stack extends SingleView<
  "stack",
  UIStackView, 
  UiTypes.StackProps, 
  UiTypes.BaseViewEvents<UIStackView>,
  UiTypes.StackOptions
  > {
  constructor({ props, layout, events, views }: {
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
      views
    });
  }
}

export class Tab extends SingleView<
  "tab",
  UITabView, 
  UiTypes.TabProps, 
  UiTypes.TabEvents,
  UiTypes.TabOptions
  > {
  constructor({ props, layout, events, views }: {
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
      views
    });
  }
}

export class Menu extends SingleView<
  "menu",
  UIMenuView, 
  UiTypes.MenuProps, 
  UiTypes.MenuEvents,
  UiTypes.MenuOptions
  > {
  constructor({ props, layout, events, views }: {
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
      views
    });
  }
}

export class Map extends SingleView<
  "map",
  UIMapView, 
  UiTypes.MapProps, 
  UiTypes.BaseViewEvents<UIMapView>,
  UiTypes.MapOptions
  > {
  constructor({ props, layout, events, views }: {
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
      views
    });
  }
}

export class Web extends SingleView<
  "web",
  UIWebView, 
  UiTypes.WebProps, 
  UiTypes.WebEvents,
  UiTypes.WebOptions
  > {
  constructor({ props, layout, events, views }: {
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
      views
    });
  }
}

export class List extends SingleView<
  "list",
  UIListView, 
  UiTypes.ListProps, 
  UiTypes.ListEvents,
  UiTypes.ListOptions
  > {
  constructor({ props, layout, events, views }: {
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
      views
    });
  }
}

export class Matrix extends SingleView<
  "matrix",
  UIMatrixView, 
  UiTypes.MatrixProps, 
  UiTypes.MatrixEvents,
  UiTypes.MatrixOptions
  > {
  constructor({ props, layout, events, views }: {
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
      views
    });
  }
}

export class Blur extends SingleView<
  "blur",
  UIBlurView, 
  UiTypes.BlurProps, 
  UiTypes.BaseViewEvents<UIBlurView>,
  UiTypes.BlurOptions
  > {
  constructor({ props, layout, events, views }: {
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
      views
    });
  }
}

export class Gradient extends SingleView<
  "gradient",
  UIGradientView, 
  UiTypes.GradientProps, 
  UiTypes.BaseViewEvents<UIGradientView>,
  UiTypes.GradientOptions
  > {
  constructor({ props, layout, events, views }: {
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
      views
    });
  }
}

export class DatePicker extends SingleView<
  "date-picker",
  UIDatePickerView, 
  UiTypes.DatePickerProps, 
  UiTypes.DatePickerEvents,
  UiTypes.DatePickerOptions
  > {
  constructor({ props, layout, events, views }: {
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
      views
    });
  }
}

export class Picker extends SingleView<
  "picker",
  UIPickerView, 
  UiTypes.PickerProps, 
  UiTypes.PickerEvents,
  UiTypes.PickerOptions
  > {
  constructor({ props, layout, events, views }: {
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
      views
    });
  }
}

export class Canvas extends SingleView<
  "canvas",
  UICanvasView, 
  UiTypes.BaseViewProps, 
  UiTypes.CanvasEvents,
  UiTypes.CanvasOptions
  > {
  constructor({ props, layout, events, views }: {
    props?: UiTypes.BaseViewProps;
    layout?: (make: MASConstraintMaker, view: UICanvasView) => void;
    events?: UiTypes.CanvasEvents;
    views?: UiTypes.AllViewOptions[];
  }) {
    super({
      type: "canvas",
      props,
      layout,
      events,
      views
    });
  }
}

export class Markdown extends SingleView<
  "markdown",
  UIMarkdownView, 
  UiTypes.MarkdownProps, 
  UiTypes.BaseViewEvents<UIMarkdownView>,
  UiTypes.MarkdownOptions
  > {
  constructor({ props, layout, events, views }: {
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
      views
    });
  }
}

export class Lottie extends SingleView<
  "lottie",
  UILottieView, 
  UiTypes.LottieProps, 
  UiTypes.BaseViewEvents<UILottieView>,
  UiTypes.LottieOptions
  > {
  constructor({ props, layout, events, views }: {
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
      views
    });
  }
}

export class Chart extends SingleView<
  "chart",
  UIChartView, 
  UiTypes.ChartProps, 
  UiTypes.ChartEvents,
  UiTypes.ChartOptions
  > {
  constructor({ props, layout, events, views }: {
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
      views
    });
  }
}

export class Code extends SingleView<
  "code",
  UICodeView, 
  UiTypes.CodeProps, 
  UiTypes.BaseViewEvents<UICodeView>,
  UiTypes.CodeOptions
  > {
  constructor({ props, layout, events, views }: {
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
      views
    });
  }
}

export class Runtime extends SingleView<
  "runtime",
  UIView, 
  UiTypes.RuntimeProps, 
  UiTypes.BaseViewEvents<UIView>,
  UiTypes.RuntimeOptions
  > {
  constructor({ props, layout, events, views }: {
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
      views
    });
  }
}