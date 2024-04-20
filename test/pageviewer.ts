import { PageViewer } from "../components/pageviewer";
import { ContentView } from "../components/single-views";
const pageViewer = new PageViewer({
  props: {
    page: 0,
    cviews: [
      new ContentView({ props: { bgcolor: $color("red") }, layout: $layout.fill }),
      new ContentView({ props: { bgcolor: $color("green") }, layout: $layout.fill }),
      new ContentView({ props: { bgcolor: $color("blue") }, layout: $layout.fill })
    ]
  },
  layout: $layout.fill,
  events: {
    floatPageChanged: (cview, floatPage) => {
      console.log(floatPage);
    }
  }
});

$ui.render({
  views: [pageViewer.definition]
});