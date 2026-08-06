import { listDialog } from "../../../index";

const items = ["Alpha", "Beta", "Gamma", "Delta"];

$ui.render({
  props: { title: "List Dialog" },
  views: [
    {
      type: "button",
      props: { title: "单选" },
      layout: (make, view) => {
        make.centerX.equalTo(view.super);
        make.centerY.equalTo(view.super).offset(-30);
        make.size.equalTo($size(160, 44));
      },
      events: {
        tapped: () => {
          listDialog({ title: "选择一项", items, value: 1 })
            .then((index) => $ui.alert(`选择了 ${items[index]}`))
            .catch(() => $ui.toast("已取消"));
        },
      },
    },
    {
      type: "button",
      props: { title: "多选" },
      layout: (make, view) => {
        make.centerX.equalTo(view.super);
        make.top.equalTo(view.prev.bottom).offset(16);
        make.size.equalTo($size(160, 44));
      },
      events: {
        tapped: () => {
          listDialog({ title: "选择多项", items, multiSelectEnabled: true, values: [0, 2] })
            .then((indexes) => $ui.alert(indexes.map((index) => items[index]).join(", ")))
            .catch(() => $ui.toast("已取消"));
        },
      },
    },
  ],
});
