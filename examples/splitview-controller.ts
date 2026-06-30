import { BaseController, SplitViewController } from "../index";

const items = [
  {
    controller: new BaseController({
      props: { bgcolor: $color("red") },
      events: {
        didAppear: () => {
          console.log("Page 1 did appear");
        },
        didDisappear: () => {
          console.log("Page 1 did disappear");
        },
      },
    }),
    bgcolor: $color("red"),
  },
  {
    controller: new BaseController({
      props: { bgcolor: $color("yellow") },
      events: {
        didAppear: () => {
          console.log("Page 2 did appear");
        },
        didDisappear: () => {
          console.log("Page 2 did disappear");
        },
      },
    }),
    bgcolor: $color("green"),
  },
];

const pageViewerController = new SplitViewController({
  props: {
    items,
  },
  events: {},
});

pageViewerController.uirender();
