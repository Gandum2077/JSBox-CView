"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const searchbar_1 = require("../components/searchbar");
const s0 = new searchbar_1.SearchBar({
    props: {
        style: 0
    },
    layout: (make, view) => {
        make.centerX.equalTo(view.super);
        make.size.equalTo($size(300, 44));
        make.top.equalTo(view.super).inset(50);
    }
});
const s1 = new searchbar_1.SearchBar({
    props: {
        style: 1
    },
    layout: (make, view) => {
        make.centerX.equalTo(view.super);
        make.size.equalTo($size(300, 44));
        make.top.equalTo(view.super).inset(125);
    }
});
const s2 = new searchbar_1.SearchBar({
    props: {
        style: 2
    },
    layout: (make, view) => {
        make.centerX.equalTo(view.super);
        make.size.equalTo($size(300, 44));
        make.top.equalTo(view.super).inset(200);
    }
});
$ui.render({
    views: [s0.definition, s1.definition, s2.definition]
});
