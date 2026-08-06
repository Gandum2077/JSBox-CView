import { ContentView, TabBar } from "../../index";

const pages = [
  new ContentView({
    props: { bgcolor: $color("primarySurface") },
    layout: $layout.fill,
    views: [
      {
        type: "label",
        props: { text: "首页", font: $font("bold", 30), align: $align.center },
        layout: $layout.center,
      },
    ],
  }),
  new ContentView({
    props: { bgcolor: $color("secondarySurface"), hidden: true },
    layout: $layout.fill,
    views: [
      {
        type: "label",
        props: { text: "设置", font: $font("bold", 30), align: $align.center },
        layout: $layout.center,
      },
    ],
  }),
];

const tabBar = new TabBar({
  props: {
    items: [
      { title: "首页", symbol: "house" },
      { title: "设置", symbol: "gearshape" },
    ],
  },
  events: {
    changed: (_sender, index) => {
      pages.forEach((page, pageIndex) => {
        page.view.hidden = pageIndex !== index;
      });
    },
    reselected: (_sender, index) => $ui.toast(`再次点击第 ${index + 1} 项`),
  },
});

$ui.render({
  props: { title: "Tab Bar" },
  views: [...pages.map((page) => page.definition), tabBar.definition],
});
