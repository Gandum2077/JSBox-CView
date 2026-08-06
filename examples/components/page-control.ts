import { ContentView, PageControl, PageViewer } from "../../index";

const colors = [$color("systemRed"), $color("systemGreen"), $color("systemBlue")];

let pageControl: PageControl;
const viewer = new PageViewer({
  props: {
    cviews: colors.map(
      (color, index) =>
        new ContentView({
          props: { bgcolor: color },
          layout: $layout.fill,
          views: [
            {
              type: "label",
              props: {
                text: `Page ${index + 1}`,
                font: $font("bold", 28),
                textColor: $color("white"),
                align: $align.center,
              },
              layout: $layout.center,
            },
          ],
        }),
    ),
  },
  layout: $layout.fill,
  events: {
    changed: (_sender, page) => {
      pageControl.currentPage = page;
    },
  },
});

pageControl = new PageControl({
  props: {
    numberOfPages: colors.length,
    currentPage: 0,
    pageIndicatorTintColor: $rgba(255, 255, 255, 0.45),
    currentPageIndicatorTintColor: $color("white"),
  },
  layout: (make, view) => {
    make.centerX.equalTo(view.super);
    make.bottom.equalTo(view.super.safeAreaBottom).inset(12);
    make.size.equalTo($size(160, 36));
  },
  events: {
    changed: (_sender, page) => {
      viewer.scrollToPage(page);
    },
  },
});

$ui.render({
  props: { title: "Page Control" },
  views: [viewer.definition, pageControl.definition],
});
