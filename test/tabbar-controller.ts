import { TabBarController } from "../controller/tabbar-controller";
import { BaseController } from "../controller/base-controller";
import { PageViewer } from "../components/pageviewer";

const items = [{
  controller: new BaseController({
    props: { bgcolor: $color("red") },
    events: {
      didAppear: () => {
        console.log("Page 1 did appear");
      },
      didDisappear: () => {
        console.log("Page 1 did disappear");
      }
    }
  }),
  title: "Page 1"
}, {
  controller: new BaseController({ 
    props: { bgcolor: $color("yellow") },
    events: {
      didAppear: () => {
        console.log("Page 2 did appear");
      },
      didDisappear: () => {
        console.log("Page 2 did disappear");
      }
    }
  }),
  title: "Page 2"
}]

const pageViewerController = new TabBarController({
  props: {
    items
  },
  events: {
    changed: (sender, index) => {
      console.log(`Index changed to ${index}`);
    },
    doubleTapped: (sender, index) => {
      console.log(`Double tapped on index ${index}`);
    }
  }
});

pageViewerController.uirender({});