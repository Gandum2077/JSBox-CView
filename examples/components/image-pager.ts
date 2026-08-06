import { ImagePager } from "../../index";

const sources = [
  "https://picsum.photos/seed/cview-pager-1/1200/1600",
  "https://picsum.photos/seed/cview-pager-2/1200/1600",
  "https://picsum.photos/seed/cview-pager-3/1200/1600",
];

const pager = new ImagePager({
  props: {
    srcs: sources,
    page: 0,
    doubleTapToZoom: true,
  },
  layout: $layout.fill,
  events: {
    changed: (page) => $ui.toast(`${page + 1} / ${sources.length}`),
  },
});

const move = (offset: number) => {
  const page = Math.min(Math.max(pager.page + offset, 0), sources.length - 1);
  pager.scrollToPage(page);
};

$ui.render({
  props: {
    title: "Image Pager",
    bgcolor: $color("black"),
    navButtons: [
      { symbol: "chevron.left", handler: () => move(-1) },
      { symbol: "chevron.right", handler: () => move(1) },
    ],
  },
  views: [pager.definition],
});
