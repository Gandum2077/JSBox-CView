import { BaseController, Button, SplitViewController } from "../../index";

const primaryController = new BaseController({
  props: { bgcolor: $color("red") },
  events: {
    didAppear: () => {
      console.log("Page 1 did appear");
    },
    didDisappear: () => {
      console.log("Page 1 did disappear");
    },
  },
});

const dismissButton = new Button({
  props: { title: "关闭" },
  layout: (make, view) => {
    make.center.equalTo(view.super);
    make.size.equalTo($size(140, 44));
  },
  events: { tapped: () => $app.close() },
});

primaryController.rootView.views = [dismissButton];

const secondaryController = new BaseController({
  props: { bgcolor: $color("yellow") },
  events: {
    didAppear: () => {
      console.log("Page 2 did appear");
    },
    didDisappear: () => {
      console.log("Page 2 did disappear");
    },
  },
});
const items = [
  {
    controller: primaryController,
    bgcolor: $color("red"),
  },
  {
    controller: secondaryController,
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
