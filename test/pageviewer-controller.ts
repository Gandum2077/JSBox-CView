import { PageViewerController } from "../controller/pageviewer-controller";
import { BaseController } from "../controller/base-controller";
import { PageViewer } from "../components/pageviewer";

const items = [{
  controller: new BaseController({props: {bgcolor: $color("red")}}),
  title: "Page 1"
}, {
  controller: new BaseController({props: {bgcolor: $color("yellow")}}),
  title: "Page 2"
}]

const pageViewerController = new PageViewerController({
  props: {
    items
  }
});

pageViewerController.uirender({});