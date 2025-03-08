import { CustomNavigationBar } from "../components/custom-navigation-bar";

const navbar = new CustomNavigationBar({
  props: {
    title: "Custom Navigation Bar",
    popButtonEnabled: true,
    popButtonTitle: "Back",
    rightBarButtonItems: [
      {
        symbol: "gear",
        handler: (sender) => console.log(sender),
      },
    ],
  },
});

$ui.render({
  views: [
    {
      type: "button",
      props: {},
      layout: $layout.fill,
      events: {
        tapped: () => {
          $ui.push({
            views: [navbar.definition],
          });
          $delay(1, () => {
            navbar.cviews.bgview.view.alpha = 0.5;
            navbar.cviews.separator.view.alpha = 0.5;
          });
          $delay(2, () => {
            navbar.cviews.bgview.view.alpha = 0;
            navbar.cviews.separator.view.alpha = 0;
          });
        },
      },
    },
  ],
});
