import { l10n } from "../utils/l10n";
import { Base } from "./base";

/** `LoadableContentView` 可显示的互斥页面状态。 */
export type LoadableContentState = "loading" | "content" | "empty" | "error";

/** 内置空状态或错误状态的文字与图标配置。 */
export interface LoadableContentPlaceholderProps {
  /** SF Symbol 名称。 */
  symbol?: string;
  /** 状态标题。 */
  title?: string;
  /** 标题下方的补充说明。 */
  message?: string;
  /** 操作按钮标题；仅在存在对应事件处理函数时显示。 */
  actionTitle?: string;
}

/** `LoadableContentView` 的状态切换与默认操作事件。 */
export interface LoadableContentViewEvents extends UiTypes.BaseViewEvents<UIView> {
  /** 点击内置空状态操作按钮时触发。 */
  emptyAction?: (sender: LoadableContentView) => void;
  /** 点击内置错误状态重试按钮时触发。 */
  retry?: (sender: LoadableContentView) => void;
  /** 状态发生实际变化后触发；重复设置同一状态不会触发。 */
  stateChanged?: (sender: LoadableContentView, state: LoadableContentState) => void;
}

/**
 * 创建填满状态容器的自定义 CView 定义。
 * @param cview - 要嵌入状态容器的组件。
 * @returns 根布局被替换为 `$layout.fill` 的新定义。
 */
const customStateDefinition = (cview: Base<any, any>) => {
  const definition = cview.definition;
  definition.layout = $layout.fill;
  return definition;
};

/**
 * 在加载、内容、空结果和错误四种互斥状态之间切换的内容容器。
 *
 * 内容视图始终保留在视图层级中，状态变化只切换四个容器的 `hidden`，因此列表滚动位置和页面内状态不会因为
 * 暂时显示加载或错误界面而丢失。`loadingView`、`emptyView` 和 `errorView` 可替换默认界面；自定义状态视图会被
 * 强制填满对应容器，应为本组件创建专用实例。
 *
 * 本组件只负责展示状态，不发起请求。请求、重试和竞态处理仍应由 Controller 完成。
 * @example
 * ```ts
 * const loadable = new LoadableContentView({
 *   props: {
 *     content: list,
 *     state: "loading",
 *     empty: { title: "暂无收藏" },
 *   },
 *   events: { retry: () => reload() },
 * });
 *
 * loadable.state = items.length > 0 ? "content" : "empty";
 * ```
 */
export class LoadableContentView extends Base<UIView, UiTypes.ViewOptions> {
  private _state: LoadableContentState;
  private readonly _content: Base<any, any>;
  private readonly _loadingView?: Base<any, any>;
  private readonly _emptyView?: Base<any, any>;
  private readonly _errorView?: Base<any, any>;
  private readonly _loadingText: string;
  private readonly _empty: Required<LoadableContentPlaceholderProps>;
  private readonly _error: Required<LoadableContentPlaceholderProps>;
  private readonly _events: LoadableContentViewEvents;
  private readonly _bgcolor: UIColor;

  protected _defineView: () => UiTypes.ViewOptions;

  /** 创建四态内容容器。 */
  constructor({
    props,
    layout = $layout.fill,
    events = {},
  }: {
    props: {
      /** 正常状态显示的业务内容。 */
      content: Base<any, any>;
      /** 初始状态，默认为 `loading`。 */
      state?: LoadableContentState;
      /** 加载状态说明；空字符串表示只显示 Spinner。 */
      loadingText?: string;
      /** 内置空状态配置。 */
      empty?: LoadableContentPlaceholderProps;
      /** 内置错误状态配置。 */
      error?: LoadableContentPlaceholderProps;
      /** 替换内置加载界面的 CView。 */
      loadingView?: Base<any, any>;
      /** 替换内置空状态界面的 CView。 */
      emptyView?: Base<any, any>;
      /** 替换内置错误状态界面的 CView。 */
      errorView?: Base<any, any>;
      /** 根视图背景色，默认为 `primarySurface`。 */
      bgcolor?: UIColor;
    };
    /** 根视图布局，默认为填满父视图。 */
    layout?: (make: MASConstraintMaker, view: UIView) => void;
    /** 根视图、状态变化和默认按钮事件。 */
    events?: LoadableContentViewEvents;
  }) {
    super();
    this.assertState(props.state ?? "loading");
    this._state = props.state ?? "loading";
    this._content = props.content;
    this._loadingView = props.loadingView;
    this._emptyView = props.emptyView;
    this._errorView = props.errorView;
    this._loadingText = props.loadingText ?? l10n("LOADING");
    this._empty = {
      symbol: props.empty?.symbol ?? "tray",
      title: props.empty?.title ?? l10n("NO_CONTENT"),
      message: props.empty?.message ?? "",
      actionTitle: props.empty?.actionTitle ?? "",
    };
    this._error = {
      symbol: props.error?.symbol ?? "exclamationmark.triangle",
      title: props.error?.title ?? l10n("UNABLE_TO_LOAD"),
      message: props.error?.message ?? "",
      actionTitle: props.error?.actionTitle ?? l10n("RETRY"),
    };
    this._events = events;
    this._bgcolor = props.bgcolor ?? $color("primarySurface");
    this._layout = layout;

    this._defineView = () => {
      const { emptyAction: _emptyAction, retry: _retry, stateChanged: _stateChanged, ...viewEvents } = this._events;
      return {
        type: "view",
        props: { bgcolor: this._bgcolor },
        layout: this._layout,
        events: viewEvents,
        views: [
          this.makeContainer("content", [customStateDefinition(this._content)]),
          this.makeContainer("loading", [
            this._loadingView ? customStateDefinition(this._loadingView) : this.makeLoadingDefinition(),
          ]),
          this.makeContainer("empty", [
            this._emptyView
              ? customStateDefinition(this._emptyView)
              : this.makePlaceholderDefinition("empty", this._empty, this._events.emptyAction),
          ]),
          this.makeContainer("error", [
            this._errorView
              ? customStateDefinition(this._errorView)
              : this.makePlaceholderDefinition("error", this._error, this._events.retry),
          ]),
        ],
      };
    };
  }

  private containerId(state: LoadableContentState) {
    return `${this.id}_${state}`;
  }

  private spinnerId() {
    return `${this.id}_loading_spinner`;
  }

  private assertState(state: string): asserts state is LoadableContentState {
    if (state !== "loading" && state !== "content" && state !== "empty" && state !== "error") {
      throw new Error(`Unsupported LoadableContentView state: ${state}`);
    }
  }

  private makeContainer(state: LoadableContentState, views: UiTypes.AllViewOptions[]): UiTypes.ViewOptions {
    return {
      type: "view",
      props: {
        id: this.containerId(state),
        hidden: this._state !== state,
      },
      layout: $layout.fill,
      views,
    };
  }

  private makeLoadingDefinition(): UiTypes.ViewOptions {
    return {
      type: "view",
      props: {},
      layout: $layout.fill,
      views: [
        {
          type: "spinner",
          props: {
            id: this.spinnerId(),
            loading: this._state === "loading",
          },
          layout: (make, view) => {
            make.centerX.equalTo(view.super);
            make.centerY.equalTo(view.super).offset(this._loadingText ? -14 : 0);
          },
        },
        {
          type: "label",
          props: {
            text: this._loadingText,
            hidden: !this._loadingText,
            align: $align.center,
            textColor: $color("secondaryText"),
            font: $font(14),
          },
          layout: (make, view) => {
            make.left.right.inset(24);
            make.top.equalTo(view.prev.bottom).offset(12);
            make.height.equalTo(20);
          },
        },
      ],
    };
  }

  private makePlaceholderDefinition(
    state: "empty" | "error",
    props: Required<LoadableContentPlaceholderProps>,
    handler?: (sender: LoadableContentView) => void,
  ): UiTypes.ViewOptions {
    const actionVisible = Boolean(props.actionTitle && handler);
    const panelHeight = actionVisible ? 204 : 152;
    return {
      type: "view",
      props: {},
      layout: $layout.fill,
      views: [
        {
          type: "view",
          props: {},
          layout: (make, view) => {
            make.left.right.inset(24);
            make.centerY.equalTo(view.super);
            make.height.equalTo(panelHeight);
          },
          views: [
            {
              type: "image",
              props: {
                symbol: props.symbol,
                tintColor: $color("secondaryText"),
                contentMode: $contentMode.scaleAspectFit,
              },
              layout: (make, view) => {
                make.top.equalTo(view.super);
                make.centerX.equalTo(view.super);
                make.size.equalTo($size(44, 44));
              },
            },
            {
              type: "label",
              props: {
                text: props.title,
                align: $align.center,
                font: $font("bold", 18),
                textColor: $color("primaryText"),
              },
              layout: (make, view) => {
                make.left.right.equalTo(view.super);
                make.top.equalTo(view.prev.bottom).offset(14);
                make.height.equalTo(24);
              },
            },
            {
              type: "label",
              props: {
                text: props.message,
                hidden: !props.message,
                align: $align.center,
                lines: 2,
                font: $font(14),
                textColor: $color("secondaryText"),
              },
              layout: (make, view) => {
                make.left.right.equalTo(view.super);
                make.top.equalTo(view.prev.bottom).offset(6);
                make.height.equalTo(42);
              },
            },
            {
              type: "button",
              props: {
                id: `${this.id}_${state}_action`,
                title: props.actionTitle,
                hidden: !actionVisible,
                font: $font(16),
              },
              layout: (make, view) => {
                make.top.equalTo(view.prev.bottom).offset(10);
                make.centerX.equalTo(view.super);
                make.width.greaterThanOrEqualTo(112);
                make.height.equalTo(40);
              },
              events: {
                tapped: () => handler?.(this),
              },
            },
          ],
        },
      ],
    };
  }

  private applyState() {
    const states: LoadableContentState[] = ["loading", "content", "empty", "error"];
    for (const state of states) {
      const container = $(this.containerId(state)) as UIView | undefined;
      if (container) container.hidden = state !== this._state;
    }

    if (!this._loadingView) {
      const spinner = $(this.spinnerId()) as UISpinnerView | undefined;
      if (spinner) spinner.loading = this._state === "loading";
    }
  }

  /**
   * 当前展示状态。
   * @returns 当前四态值。
   */
  get state() {
    return this._state;
  }

  /** 切换展示状态。 */
  set state(value: LoadableContentState) {
    this.assertState(value);
    if (value === this._state) return;
    this._state = value;
    this.applyState();
    this._events.stateChanged?.(this, value);
  }

  /** 显示加载状态。 */
  showLoading() {
    this.state = "loading";
  }

  /** 显示正常内容。 */
  showContent() {
    this.state = "content";
  }

  /** 显示空结果状态。 */
  showEmpty() {
    this.state = "empty";
  }

  /** 显示错误状态。 */
  showError() {
    this.state = "error";
  }
}
