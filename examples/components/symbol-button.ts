import { SymbolButton } from "../../index";

const button = new SymbolButton({
  props: {
    symbol: "heart",
    tintColor: $color("systemRed"),
    insets: $insets(16, 16, 16, 16),
    menu: {
      title: "更多操作",
      items: [
        { title: "收藏", symbol: "star", handler: () => $ui.toast("已收藏") },
        { title: "分享", symbol: "square.and.arrow.up", handler: () => $ui.toast("分享") },
      ],
    },
  },
  layout: (make, view) => {
    make.center.equalTo(view.super);
    make.size.equalTo($size(72, 72));
  },
  events: {
    tapped: () => {
      button.symbol = "heart.fill";
      $ui.toast("已喜欢；长按可显示菜单");
    },
  },
});

$ui.render({
  props: { title: "Symbol Button" },
  views: [button.definition],
});
