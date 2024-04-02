"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const custom_navigation_bar_1 = require("../components/custom-navigation-bar");
const navbar = new custom_navigation_bar_1.CustomNavigationBar({
    props: {
        title: "Custom Navigation Bar",
        popButtonEnabled: true,
        popButtonTitle: "Back",
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
                }
            }
        }]
});
