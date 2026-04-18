"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const refresh_button_1 = require("../components/refresh-button");
const refreshButton = new refresh_button_1.RefreshButton({
    props: {
        tintColor: $color("primaryText"),
        enabled: true,
        hidden: false,
    },
    layout: (make, view) => {
        make.width.equalTo(50);
        make.height.equalTo(50);
        make.top.inset(100);
        make.centerX.equalTo(view.super);
    },
    events: {
        tapped: async () => {
            refreshButton.loading = true;
            await $wait(2);
            refreshButton.loading = false;
        },
    },
});
$ui.render({
    views: [refreshButton.definition],
});
