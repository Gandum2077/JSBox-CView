import { DynamicItemSizeSectionMatrix, DynamicItemSizeSectionMatrixCustomSection } from "../index";

const makeItem = (title: string, detail: string) => ({
  itemTitle: { text: title },
  itemDetail: { text: detail },
});

const sections: DynamicItemSizeSectionMatrixCustomSection[] = [
  {
    title: {
      sectionSymbol: { symbol: "pin.fill", tintColor: $color("systemRed") },
      sectionName: { text: "Pinned" },
      sectionCount: { text: "1 item" },
    },
    titleHeight: 52,
    items: [makeItem("Quick access", "This section also verifies single-item left alignment.")],
  },
  {
    title: {
      sectionSymbol: { symbol: "clock.fill", tintColor: $color("systemBlue") },
      sectionName: { text: "Recently Updated\nCustom title height: 112" },
      sectionCount: { text: "5 items" },
    },
    titleHeight: 112,
    items: [
      makeItem("Alpha", "Updated today"),
      makeItem("Beta", "Updated yesterday"),
      makeItem("Gamma", "Updated this week"),
      makeItem("Delta", "Updated this month"),
      makeItem("Epsilon", "Updated this year"),
    ],
  },
  {
    title: undefined,
    titleHeight: 52,
    items: [
      makeItem("No title cell", "The first item starts at indexPath.item 0."),
      makeItem("Another item", "This section has no custom section title."),
    ],
  },
];

const matrix = new DynamicItemSizeSectionMatrix({
  props: {
    spacing: 8,
    minItemWidth: $device.isIpad ? 180 : 142,
    maxColumns: 4,
    data: sections,
    sectionTitleTemplate: {
      props: {
        id: "custom-section-title",
        bgcolor: $color("red"),
        cornerRadius: 6,
      },
      views: [
        {
          type: "image",
          props: {
            id: "sectionSymbol",
            contentMode: $contentMode.scaleAspectFit,
          },
          layout: (make, view) => {
            make.left.inset(12);
            make.centerY.equalTo(view.super);
            make.size.equalTo($size(22, 22));
          },
        },
        {
          type: "label",
          props: {
            id: "sectionCount",
            align: $align.right,
            font: $font(12),
            textColor: $color("secondaryText"),
          },
          layout: (make, view) => {
            make.right.inset(12);
            make.centerY.equalTo(view.super);
            make.width.equalTo(64);
          },
        },
        {
          type: "label",
          props: {
            id: "sectionName",
            font: $font("bold", 14),
            lines: 2,
            textColor: $color("primaryText"),
          },
          layout: (make, view) => {
            make.left.equalTo(view.prev.prev.right).offset(8);
            make.right.lessThanOrEqualTo(view.prev.left).offset(-8);
            make.centerY.equalTo(view.super);
          },
        },
      ],
    },
    template: {
      props: {
        bgcolor: $color("yellow"),
        cornerRadius: 6,
      },
      views: [
        {
          type: "label",
          props: {
            id: "itemTitle",
            font: $font("bold", 14),
            textColor: $color("primaryText"),
          },
          layout: (make, view) => {
            make.left.top.right.inset(12);
            make.height.equalTo(20);
          },
        },
        {
          type: "label",
          props: {
            id: "itemDetail",
            font: $font(11),
            textColor: $color("secondaryText"),
            lines: 2,
          },
          layout: (make, view) => {
            make.left.right.bottom.inset(12);
            make.top.equalTo(view.prev.bottom).offset(4);
          },
        },
      ],
    },
  },
  layout: $layout.fill,
  events: {
    itemHeight: () => 80,
    didSelect: (_sender, indexPath, data) => {
      const title = (data.itemTitle as { text: string }).text;
      $ui.toast(`${indexPath.section}:${indexPath.item} ${title}`);
    },
  },
});

$ui.render({
  views: [matrix.definition],
});
