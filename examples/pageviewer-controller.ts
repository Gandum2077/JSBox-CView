import { BaseController, PageViewerController } from "../index";

const items = [
  {
    controller: new BaseController({
      props: { bgcolor: $color("red") },
      events: {
        didAppear: () => console.log("Page 1 appear"),
        didDisappear: () => console.log("Page 1 disappear"),
      },
    }),
    title: "Page 1",
  },
  {
    controller: new BaseController({
      props: { bgcolor: $color("yellow") },
      events: {
        didAppear: () => console.log("Page 2 appear"),
        didDisappear: () => console.log("Page 2 disappear"),
      },
    }),
    title: "Page 2",
  },
];

const pageViewerController = new PageViewerController({
  props: {
    items,
  },
});

pageViewerController.uirender({});
