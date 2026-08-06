import { ContentView, DynamicRowHeightList, getTextHeight } from "../../index";

const font = $font(16);

class TextRow extends ContentView {
  private readonly text: string;

  constructor(text: string, bgcolor: UIColor) {
    super({
      props: { bgcolor },
      layout: $layout.fill,
      views: [
        {
          type: "label",
          props: {
            text,
            font,
            lines: 0,
            textColor: $color("primaryText"),
          },
          layout: (make, view) => {
            make.edges.equalTo(view.super).insets($insets(12, 16, 12, 16));
          },
        },
      ],
    });
    this.text = text;
  }

  heightToWidth(width: number) {
    return getTextHeight(this.text, {
      width: width - 32,
      font,
      inset: 24,
      lineSpacing: 0,
    });
  }
}

const rows = [
  new TextRow("短文本行", $color("primarySurface")),
  new TextRow(
    "DynamicRowHeightList 会把列表当前宽度传给每个行组件的 heightToWidth(width)，因此旋转设备或改变分栏宽度后仍能得到正确高度。",
    $color("secondarySurface"),
  ),
  new TextRow(
    "行组件需要同时提供完整的内部约束和同步高度计算。本例的多行 Label 约束到四边，高度计算则使用相同字体和水平内边距。",
    $color("primarySurface"),
  ),
];

const list = new DynamicRowHeightList({
  rows,
  props: { separatorHidden: false },
  layout: $layout.fill,
  events: {
    didSelect: (_sender, indexPath) => $ui.toast(`第 ${indexPath.row + 1} 行`),
  },
});

$ui.render({
  props: { title: "Dynamic Row Height List" },
  views: [list.definition],
});
