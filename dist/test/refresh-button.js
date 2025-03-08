"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        tapped: () => __awaiter(void 0, void 0, void 0, function* () {
            refreshButton.loading = true;
            yield $wait(2);
            refreshButton.loading = false;
        }),
    },
});
$ui.render({
    views: [refreshButton.definition],
});
