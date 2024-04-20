"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pageviewer_1 = require("../components/pageviewer");
const single_views_1 = require("../components/single-views");
const pageViewer = new pageviewer_1.PageViewer({
    props: {
        page: 0,
        cviews: [
            new single_views_1.ContentView({ props: { bgcolor: $color("red") }, layout: $layout.fill }),
            new single_views_1.ContentView({ props: { bgcolor: $color("green") }, layout: $layout.fill }),
            new single_views_1.ContentView({ props: { bgcolor: $color("blue") }, layout: $layout.fill })
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
