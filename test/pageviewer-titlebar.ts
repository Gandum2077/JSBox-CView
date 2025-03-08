import { PageViewerTitleBar } from "../components/pageviewer-titlebar";

const pageViewerTitleBar = new PageViewerTitleBar({
  props: {
    items: ["Page 1", "Page 2", "Page 3"],
    index: 0,
  },
  layout: (make, view) => {
    make.left.right.inset(0);
    make.top.equalTo(view.super.safeAreaTop);
    make.height.equalTo(44);
  },
  events: {},
});

$ui.render({
  views: [pageViewerTitleBar.definition],
});
