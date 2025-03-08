import { SearchBar } from "../components/searchbar";

const s0 = new SearchBar({
  props: {
    style: 0,
  },
  layout: (make, view) => {
    make.centerX.equalTo(view.super);
    make.size.equalTo($size(300, 44));
    make.top.equalTo(view.super).inset(50);
  },
});

const s1 = new SearchBar({
  props: {
    style: 1,
  },
  layout: (make, view) => {
    make.centerX.equalTo(view.super);
    make.size.equalTo($size(300, 44));
    make.top.equalTo(view.super).inset(125);
  },
});

const s2 = new SearchBar({
  props: {
    style: 2,
  },
  layout: (make, view) => {
    make.centerX.equalTo(view.super);
    make.size.equalTo($size(300, 44));
    make.top.equalTo(view.super).inset(200);
  },
});

$ui.render({
  views: [s0.definition, s1.definition, s2.definition],
});
