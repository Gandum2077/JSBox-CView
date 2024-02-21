/** 
 * # cview ArtificialFlowlayout
 * 
 * 仿制的 flowlayout  
 * 通过在右侧插入空白的 item，从而作出假象的左对齐。
 * 
 * 已知问题：
 * 
 * - 当某一行中所占用的总宽度恰好使得右侧的剩余宽度在 1 spacing 到 2 spacing 之间，此时无法插入空白 item，这一行的 spacing 将会被拉宽
 * - 不可以依赖 indexPath，请将原数据和此 CView 的数据分离，通过 data 中加入标记的方法来定位的原数据
 * 
 * !!! layout 当中必须有关于 height 的约束 ！！！
 * 
 * - columns 不定，item 宽度不相等但高度固定，spacing 固定，左对齐，自动换行
 * - 不可滚动，会自动调整自身的高度，因而拥有方法 heightToWidth(width: number): number 用于事前确定其应有的高度
 *   事件 heightChanged: (cview, height) => void 用于高度变更时回调
 * - 此控件不能直接指定 props.data，而是需要指定 sections，并且每个 item 都需要改为{data: any, width: number} 其中 data 代表原 item 的内容，width 代表其应有的宽度
 * - 如果 item.width > frame.width - 2 spacing, 那么生成的对应 item 将单独占用一行，其宽度为 frame.width - 2 spacing
 * -
 * 
 * 特别参数
 * 
 * - sections: {title: string, items: {data: any, width: number}[]}[] 即使只有单个 section 也必须用多 sections 的写法
 *   此参数可以在 cview.view 生成后重新写入
 * 
 * props:
 * 
 * - itemHeight 默认为 40
 * - spacing 默认为 5
 * - scrollEnabled 固定为 false
 * 
 * 除了 props: data 和 events: itemSize 不可用，其他均和 matrix 一致
 * 
 * methods
 * 
 * - heightToWidth(width: number): number
 * - getSectionHeights(width: number): number[]
 * - reload()
 */

import { Base } from "./base";
import { Matrix } from "./single-views";
import { cvid } from "../utils/cvid";

interface FlowlayoutSection {
  title?: string;
  items: {
    data: { [key: string]: any };
    width: number;
  }[];
}

interface InnerSection {
  title?: string;
  items: {
    data: { [key: string]: any };
    width: number;
    blank: boolean;
    realIndex: number;
  }[];
}

export class ArtificialFlowlayout extends Base<UIView, UiTypes.ViewOptions> {
  private _sections: FlowlayoutSection[]; // 原数据，不变动，不包含空白占位的item
  private _innerSections: InnerSection[]; // 带空白占位的item
  private _props: UiTypes.MatrixProps;
  private _cellRootViewId: string;
  private _width: number;
  private _height: number;
  private _matrix: Matrix;
  _defineView: () => UiTypes.ViewOptions;

  /**
   * 创建一个人工流式布局实例。
   * @param sections - 此控件不能直接指定 props.data，而是需要指定 sections，
   * 并且每个 item 都需要改为{data: any, width: number} 其中 data 代表原 item 的内容，width 代表其应有的宽度
   * @param props - 矩阵的属性。不可指定columns，可以指定spacing，itemHeight，template。scrollEnabled固定为false。
   * @param layout - 视图的布局函数。
   * @param events - 事件处理程序的对象。
   * - didSelect: (cview, indexPath, data): void - 其中indexPath是原sections的indexPath，data是原item的内容。
   * - didLongPress: (cview, indexPath, data): void
   * - heightChanged: (cview, height): void
   * 
   * @method set sections - 设置 sections。
   * @method get sections - 获取 sections。
   * @method heightToWidth - 根据宽度计算高度.
   * 
   */
  constructor({ sections, props, layout, events }: {
    sections: FlowlayoutSection[];
    props: UiTypes.MatrixProps;
    layout: (make: MASConstraintMaker, view: UIView) => void;
    events: {
      didSelect?: (sender: ArtificialFlowlayout, indexPath: NSIndexPath, data: object) => void;
      didLongPress?: (sender: ArtificialFlowlayout, indexPath: NSIndexPath, data: object) => void;
      heightChanged?: (sender: ArtificialFlowlayout, height: number) => void;
    }
  }) {
    super();
    this._sections = sections;
    this._innerSections = []
    this._props = {
      spacing: 5,
      itemHeight: 40,
      ...props,
      scrollEnabled: false,
      columns: undefined
    };
    this._cellRootViewId = cvid.newId;
    this._width = 300;
    this._height = 0;
    this._props.template = this._addCellIdForTemplate(this._props.template);
    this._matrix = new Matrix({
      props: {
        ...this._props,
        itemHeight: undefined
      },
      layout: $layout.fill,
      events: {
        itemSize: (sender, indexPath) => {
          const item = this._innerSections[indexPath.section].items[indexPath.item];
          return $size(Math.max(item.width, 0), this._props.itemHeight || 40);
        },
        didSelect: (sender, indexPath, data) => {
          const item = this._innerSections[indexPath.section].items[indexPath.item];
          if (item.blank) return;
          const realIndexPath = $indexPath(indexPath.section, item.realIndex);
          if (events.didSelect) events.didSelect(this, realIndexPath, data);
        },
        didLongPress: (sender, indexPath, data) => {
          const item = this._innerSections[indexPath.section].items[indexPath.item];
          if (item.blank) return;
          const realIndexPath = $indexPath(indexPath.section, item.realIndex);
          if (events.didSelect) events.didSelect(this, realIndexPath, data);
        }
      }
    })
    this._defineView = () => {
      return {
        type: "view",
        props: {
          id: this.id
        },
        layout: layout,
        events: {
          layoutSubviews: sender => {
            sender.relayout();
            this._width = sender.frame.width;
            this._innerSections = this._addBlankItem(this._sections, this._width, this._props.spacing || 5);
            const height = this._calculateSectionsHeight(
              this._innerSections,
              this._width,
              this._props.spacing || 5,
              this._props.itemHeight || 40
            );
            this.view.updateLayout((make, view) => make.height.equalTo(height));
            this._props.data = this._innerSections.map(n => ({
              title: n.title,
              items: n.items.map(n => n.data)
            }));
            this._matrix.view.data = this._props.data;
            if (height !== this._height && events.heightChanged) events.heightChanged(this, height);
            this._height = height;
          }
        },
        views: [this._matrix.definition]
      };
    }
  }

  set sections(sections) {
    this._sections = sections;
    this._innerSections = this._addBlankItem(this._sections, this._width, this._props.spacing || 5);
    this._props.data = this._innerSections.map(n => ({
      title: n.title,
      items: n.items.map(n => n.data)
    }));
    this._matrix.view.data = this._props.data;
  }

  get sections() {
    return this._sections;
  }

  /**
   * 为每个 section 的 items 添加空白占位的 item。
   * @param sections - 原始数据的数组，每个元素包含一个标题和一组项目。
   * @param containerWidth - 容器的宽度。
   * @param spacing - 项目之间的间距。
   * @returns 带有空白占位的 item 的数组。
   */
  protected _addBlankItem(sections: FlowlayoutSection[], containerWidth: number, spacing: number): InnerSection[] {
    return sections.map((section) => {
      let lineWidth = spacing  // 当前行已使用的宽度
      const newItems: {
        data: { [key: string]: any };
        width: number;
        blank: boolean;
        realIndex: number;
      }[] = []
      let index = 0
      for (const item of section.items) {
        const itemWidthWithSpacing = item.width + spacing
        // 检查是否需要换行：当前行宽度 + 项目宽度 + 间距 > 容器宽度
        if (lineWidth + itemWidthWithSpacing > containerWidth && lineWidth > spacing) {
          // 插入空白项目填充剩余宽度
          const blankWidth = containerWidth - lineWidth + spacing  // 计算空白项目宽度
          if (blankWidth > 0) { // 防止插入宽度为负的空白项目
            const blankItemData: {[key: string]: any} = {}
            blankItemData[this._cellRootViewId] = { hidden: true }
            newItems.push({
              data: blankItemData,
              width: blankWidth,
              blank: true,
              realIndex: -1
            })
            // 然后换行，重置lineWidth
            lineWidth = spacing + itemWidthWithSpacing
            newItems.push({
              data: item.data,
              width: item.width,
              blank: false,
              realIndex: index
            })
          } else { // 当剩余宽度恰好大于spacing但不超过2倍spacing时，需要直接换行，但这行的spacing会被稍微拉长
            // 直接换行，重置lineWidth
            lineWidth = spacing + itemWidthWithSpacing
            newItems.push({
              data: item.data,
              width: item.width,
              blank: false,
              realIndex: index
            })
          }
        } else {
          newItems.push({
            data: item.data,
            width: item.width,
            blank: false,
            realIndex: index
          })
          lineWidth += itemWidthWithSpacing
        }
        index++;
      }
      return {
        title: section.title,
        items: newItems,
      };
    });
  }

  /**
   * 计算 sections 的高度。
   * @param sections - 带有空白占位的 item 的数组。
   * @param containerWidth - 容器的宽度。
   * @param spacing - 项目之间的间距。
   * @param itemHeight - 项目的高度。
   * @returns 计算得到的高度值。
   */
  protected _calculateSectionsHeight(
    sections: InnerSection[],
    containerWidth: number,
    spacing: number,
    itemHeight: number
  ): number {
    let height = spacing  // 当前行已使用的高度
    const lineHeight = itemHeight + spacing // 每行的高度，包括项目高度和间距
    for (const section of sections) {
      let lineWidth = 0  // 当前行已使用的宽度
      for (const item of section.items) {
        const itemWidthWithSpacing = item.width + spacing
        // 检查是否需要换行：当前行宽度 + 项目宽度 + 间距 > 容器宽度
        if (lineWidth + itemWidthWithSpacing > containerWidth && lineWidth > spacing) {
          // 换行，重置lineWidth
          lineWidth = spacing + itemWidthWithSpacing
          height += lineHeight
        } else {
          lineWidth += itemWidthWithSpacing
        }
      }
    }
    return height
  }

  private _addCellIdForTemplate(template: {
    views: UiTypes.AllViewOptions[];
    props?: UiTypes.BaseViewProps
  }): {
    props: UiTypes.BaseViewProps;
    views: UiTypes.AllViewOptions[];
  } {
    if (!template || typeof template !== "object") throw new Error("Invalid template");
    const topProps = template.props;
    if (topProps && topProps.id) delete topProps.id;
    return {
      props: {},
      views: [
        {
          type: "view",
          props: {
            ...topProps,
            id: this._cellRootViewId
          },
          layout: $layout.fill,
          views: template.views
        }
      ]
    };
  }

  /**
   * 根据宽度计算高度。
   * @param width - 宽度值。
   * @returns 计算得到的高度值。
   */
  heightToWidth(width: number) {
    const innerSections = this._addBlankItem(this._sections, width, this._props.spacing || 5);
    return this._calculateSectionsHeight(innerSections, width, this._props.spacing || 5, this._props.itemHeight || 40);
  }
}
