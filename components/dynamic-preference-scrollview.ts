import { Base } from "./base";
import { DynamicPreferenceModel } from "./internal/dynamic-preference-model";
import type { DynamicPreferenceListCustomProps, DynamicPreferenceListViewEvents } from "./dynamic-preference-listview";
import { PreferenceSection, selectableTypes } from "./static-preference-listview";
import { getTextHeight } from "../utils/uitools";

/** 分区下方的说明文字。 */
export interface PreferenceSectionFooter {
  text: string;
  /** 默认使用 secondaryText；可点击时默认使用 systemLink。 */
  color?: UIColor;
  tapped?: () => void;
}

/** 支持说明文字的偏好设置分区。 */
export interface PreferenceScrollSection extends PreferenceSection {
  footer?: PreferenceSectionFooter;
}

/** 原生 Scroll 属性及与动态偏好列表一致的行布局选项。内容尺寸由组件管理。 */
export type DynamicPreferenceScrollProps = Omit<UiTypes.ScrollProps, "contentSize"> &
  DynamicPreferenceListCustomProps & {
    /** 行高，默认为 44 点。 */
    rowHeight?: number;
  };

/**
 * 用 ScrollView 和普通视图拼装的 inset-grouped（List style: 2）偏好列表。
 * 支持 DynamicPreferenceListView 的全部行类型、sections、values、set 和 changed。
 * 分区 footer 自动换行，可设置颜色和点击行为；宽度变化后自动重新测量。
 * 每行均为独立视图，不做单元格复用，适合设置页和中小型表单。
 */
export class DynamicPreferenceScrollView<TValues extends object = Record<string, unknown>> extends Base<
  UIScrollView,
  UiTypes.ScrollOptions
> {
  private readonly _model: DynamicPreferenceModel<TValues>;
  private readonly _props: UiTypes.ScrollProps;
  private readonly _rowHeight: number;
  private _width = 0;
  private _revision = 0;
  private _renderedRevision = -1;
  private _content?: UIView;
  private _highlightGeneration = 0;

  /** 创建带分区说明的动态偏好列表。 */
  constructor({
    sections,
    props = {},
    layout,
    events = {},
  }: {
    sections: PreferenceScrollSection[];
    props?: DynamicPreferenceScrollProps;
    layout?: (make: MASConstraintMaker, view: UIScrollView) => void;
    events?: DynamicPreferenceListViewEvents<TValues>;
  }) {
    super();
    const {
      stringLeftInset,
      infoAndLinkLeftInset,
      sliderWidth,
      tabWidth,
      symbolSizeForSymbolAction,
      rowHeight = 44,
      ...scrollProps
    } = props;
    this._props = scrollProps;
    this._rowHeight = Number.isFinite(rowHeight) && rowHeight > 0 ? rowHeight : 44;
    this._layout = layout;
    this._model = new DynamicPreferenceModel({
      sections: this._cloneFooters(sections),
      props: { stringLeftInset, infoAndLinkLeftInset, sliderWidth, tabWidth, symbolSizeForSymbolAction },
      events,
      refresh: () => this._refreshRows(),
    });
  }

  protected _defineView = (): UiTypes.ScrollOptions => ({
    type: "scroll",
    props: { bgcolor: $color("insetGroupedBackground"), alwaysBounceVertical: true, ...this._props },
    layout: this._layout,
    views: [{ type: "view", props: { id: `${this.id}-content`, bgcolor: $color("clear") } }],
    events: {
      ready: (sender) => this._layoutContent(sender),
      layoutSubviews: (sender) => this._layoutContent(sender),
    },
  });

  /**
   * 当前分区、说明与行数据。
   * @returns 当前分区。
   */
  get sections(): PreferenceScrollSection[] {
    return this._model.sections;
  }
  /**
   * 替换全部分区，不触发 changed。
   * @param sections - 新分区。
   */
  set sections(sections: PreferenceScrollSection[]) {
    this._revision++;
    this._model.sections = this._cloneFooters(sections);
    if (this.view) this._layoutContent(this.view);
  }

  /**
   * 收集带 key 的可存储行值。
   * @returns 完整值对象。
   */
  get values(): TValues {
    return this._model.values;
  }

  /**
   * 更新所有匹配的行，不触发 changed。
   * @param key - 行键名。
   * @param value - 新值。
   */
  set(key: string, value: any) {
    this._model.set(key, value);
  }

  /**
   * 禁用滚动时按指定宽度计算完整内容高度，不创建视图或触发布局。
   * 启用滚动（默认）时返回当前 frame 高度，此时需先加载视图。
   * @param width - 可用宽度，单位为点。
   * @returns 内容高度或当前视图高度。
   */
  heightToWidth(width: number): number {
    const view = this.view;
    if ((view?.scrollEnabled ?? this._props.scrollEnabled) !== false) return this.view.frame.height;
    return this._measureContent(width).height;
  }

  private _measureContent(width: number) {
    const textWidth = Math.max(1, width - 62);
    let top = 35;
    const sections = this.sections.map((section) => {
      const titleTop = top;
      const titleHeight = section.title ? getTextHeight(section.title, { width: textWidth, font: $font(13) }) : 0;
      if (section.title) top += titleHeight + 7;
      const cardTop = top;
      top += section.rows.length * this._rowHeight;
      const footerHeight = section.footer?.text
        ? getTextHeight(section.footer.text, { width: textWidth, font: $font(13) })
        : 0;
      if (section.footer?.text) top += 8;
      const footerTop = top;
      top += footerHeight + 35;
      return { titleTop, titleHeight, cardTop, footerTop, footerHeight };
    });
    // 最后一个分区后的 35 点间距同时作为底部留白。
    return { sections, height: sections.length ? top : 0 };
  }

  private _cloneFooters(sections: PreferenceScrollSection[]): PreferenceScrollSection[] {
    return sections.map((section) => ({ ...section, footer: section.footer ? { ...section.footer } : undefined }));
  }

  private _rowId(section: number, row: number, name: string): string {
    return `${this.id}-${section}-${row}-${name}`;
  }

  /** 值变化只更新已加载控件，避免中断触摸或重置滚动位置。 */
  private _refreshRows(): void {
    if (!this._content || this._renderedRevision !== this._revision) return;
    const data = this._model._defineView().props.data as { rows: Record<string, any>[] }[];
    data.forEach((section, s) =>
      section.rows.forEach((row, r) => {
        Object.entries(row).forEach(([name, props]) => {
          const view = this._content!.get(this._rowId(s, r, name));
          if (view) Object.assign(view, props);
        });
      }),
    );
  }

  /**
   * Scroll 内只对容器设置 frame，容器内部使用 Masonry。
   * @param sender - 根滚动视图。
   */
  private _layoutContent(sender: UIScrollView): void {
    const width = sender.frame.width;
    const content = sender.get(`${this.id}-content`) as UIView;
    if (!content || width <= 0) return;
    if (content === this._content && width === this._width && this._renderedRevision === this._revision) return;
    this._width = width;
    this._content = content;
    this._renderedRevision = this._revision;
    this._highlightGeneration++;
    content.views.forEach((view) => view.remove());
    const definition = this._model._defineView();
    const data = definition.props.data as { rows: Record<string, any>[] }[];
    const template = definition.props.template as { views: UiTypes.AllViewOptions[] };
    const measurement = this._measureContent(width);
    this.sections.forEach((section, s) => {
      const { titleTop, titleHeight, cardTop, footerTop, footerHeight } = measurement.sections[s];
      if (section.title) {
        content.add(this._sectionLabel(section.title, titleTop, titleHeight));
      }
      if (section.rows.length) {
        content.add({
          type: "view",
          props: { bgcolor: $color("secondarySurface"), radius: 10, clipsToBounds: true },
          layout: (make: MASConstraintMaker) => {
            make.left.right.inset(16);
            make.top.inset(cardTop);
            make.height.equalTo(section.rows.length * this._rowHeight);
          },
          views: section.rows.map(
            (row, r): UiTypes.ViewOptions => ({
              type: "view",
              props: { bgcolor: $color("clear") },
              layout: (make: MASConstraintMaker) => {
                make.left.right.inset(0);
                make.top.inset(r * this._rowHeight);
                make.height.equalTo(this._rowHeight);
              },
              events: selectableTypes.includes(row.type)
                ? this._rowHighlightEvents(this._rowId(s, r, "highlight"), () =>
                    definition.events?.didSelect?.(sender as unknown as UIListView, $indexPath(s, r), data[s].rows[r]),
                  )
                : {},
              views: [
                ...(selectableTypes.includes(row.type)
                  ? [
                      {
                        type: "view" as const,
                        props: {
                          id: this._rowId(s, r, "highlight"),
                          bgcolor: $color("#E1E1E1", "#3A3A3C"),
                          alpha: 0,
                          userInteractionEnabled: false,
                        },
                        layout: $layout.fill,
                      },
                    ]
                  : []),
                ...this._rowViews(template.views, data[s].rows[r], s, r),
                ...(r > 0
                  ? [
                      {
                        type: "view" as const,
                        props: { bgcolor: $color("separatorColor"), userInteractionEnabled: false },
                        layout: (make: MASConstraintMaker) => {
                          make.left.inset(15);
                          make.top.right.inset(0);
                          make.height.equalTo(1 / $device.info.screen.scale);
                        },
                      },
                    ]
                  : []),
              ],
            }),
          ),
        });
      }
      if (section.footer?.text) {
        content.add(this._sectionLabel(section.footer.text, footerTop, footerHeight, section.footer));
      }
    });
    const height = measurement.height;
    content.frame = $rect(0, 0, width, height);
    sender.contentSize = $size(width, height);
  }

  /**
   * 按住时保持高亮，松手后只淡出一次；点击回调复用同一次松手动画。
   * @param id - 背景层 ID。
   * @param selected - 立即执行的行点击行为。
   * @returns 行触摸事件。
   */
  private _rowHighlightEvents(id: string, selected: () => void): UiTypes.BaseViewEvents<UIView> {
    const generation = this._highlightGeneration;
    let sequence = 0;
    let phase: "idle" | "pressed" | "released" | "selected" | "cancelled" = "idle";
    const background = () => (generation === this._highlightGeneration ? this._content?.get(id) : undefined);
    const reset = (alpha: number) => {
      const view = background();
      if (!view) return;
      view.ocValue().invoke("layer").invoke("removeAllAnimations");
      view.alpha = alpha;
    };
    const fade = () => {
      const token = ++sequence;
      // 保证快速点击的起始灰色可见；不会重设已按住的背景透明度。
      $delay(1 / 60, () => {
        const view = background();
        if (!view || token !== sequence) return;
        $ui.animate({
          duration: 0.5,
          // UIViewAnimationOptionAllowUserInteraction；默认曲线为 ease-in-out。
          options: 2,
          animation: () => {
            view.alpha = 0;
          },
        });
      });
    };
    return {
      touchesBegan: () => {
        sequence++;
        phase = "pressed";
        reset(1);
      },
      touchesEnded: () => {
        if (phase !== "pressed") return;
        phase = "released";
        fade();
      },
      touchesCancelled: () => {
        if (phase !== "pressed") return;
        phase = "cancelled";
        const token = ++sequence;
        // 点击手势也可能取消原始触摸，留一轮给 tapped 确认；真正取消则清除。
        $delay(0, () => {
          if (token !== sequence || phase !== "cancelled") return;
          phase = "idle";
          reset(0);
        });
      },
      tapped: () => {
        if (!background()) return;
        if (phase !== "released") {
          // 已按住的行直接淡出，不先变白再重新变灰。
          if (phase !== "pressed" && phase !== "cancelled") reset(1);
          fade();
        }
        // 即使 touchesEnded 的动画已经开始，也不重新启动它。
        phase = "selected";
        selected();
      },
    };
  }

  private _sectionLabel(
    text: string,
    top: number,
    height: number,
    footer?: PreferenceSectionFooter,
  ): UiTypes.LabelOptions {
    return {
      type: "label",
      props: {
        text,
        font: $font(13),
        lines: 0,
        textColor: footer?.color ?? $color(footer?.tapped ? "systemLink" : "secondaryText"),
        userInteractionEnabled: !!footer?.tapped,
      },
      layout: (make: MASConstraintMaker) => {
        make.left.right.inset(31);
        make.top.inset(top);
        make.height.equalTo(height);
      },
      events: footer?.tapped ? { tapped: () => footer.tapped?.() } : {},
    };
  }

  /**
   * 将共享行模板展开为普通视图，过滤未使用控件并隔离所有子视图 ID。
   * @param views - 模板视图。
   * @param data - 当前行映射的数据。
   * @param section - 分区索引。
   * @param row - 行索引。
   * @returns 独立的行视图定义。
   */
  private _rowViews(
    views: UiTypes.AllViewOptions[],
    data: Record<string, any>,
    section: number,
    row: number,
  ): UiTypes.AllViewOptions[] {
    return views
      .filter((view) => view.props?.id !== "bgview")
      .flatMap((view) => {
        const name = view.props?.id;
        const props = { ...view.props, ...(name ? data[name] : {}) };
        if (props.hidden) return [];
        if (name) props.id = this._rowId(section, row, name);
        if (view.type === "label" || view.type === "image") props.userInteractionEnabled = false;
        return [
          {
            ...view,
            props,
            views: view.views ? this._rowViews(view.views, data, section, row) : undefined,
          } as UiTypes.AllViewOptions,
        ];
      });
  }
}
