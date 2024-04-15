"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const custom_navigation_bar_1 = require("../components/custom-navigation-bar");
const navbar = new custom_navigation_bar_1.CustomNavigationBar({
    props: {
        title: "Custom Navigation Bar",
        popButtonEnabled: true,
        popButtonTitle: "Back",
        rightBarButtonItems: [
            {
                symbol: "gear",
            }
        ]
    }
});
$ui.render({
    views: [{
            type: "button",
            props: {},
            layout: $layout.fill,
            events: {
                tapped: () => {
                    $ui.push({
                        views: [navbar.definition]
                    });
                    $delay(1, () => {
                        navbar.cviews.bgview.view.alpha = 0.5;
                        navbar.cviews.separator.view.alpha = 0.5;
                    });
                    $delay(2, () => {
                        navbar.cviews.bgview.view.alpha = 0;
                        navbar.cviews.separator.view.alpha = 0;
                    });
                }
            }
        }]
});
