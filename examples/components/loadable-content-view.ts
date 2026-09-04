import { Label, LoadableContentState, LoadableContentView } from "../../index";

const content = new Label({
  props: {
    text: "数据已经加载完成。切换状态时，这个内容视图仍保留在原来的视图层级中。",
    lines: 0,
    align: $align.center,
    font: $font(18),
  },
  layout: (make, view) => {
    make.left.right.inset(28);
    make.centerY.equalTo(view.super);
    make.height.equalTo(100);
  },
});

const loadable = new LoadableContentView({
  props: {
    content,
    state: "loading",
    empty: {
      title: "暂无收藏",
      message: "收藏内容后，它们会显示在这里。",
    },
    error: {
      message: "请检查网络连接后重试。",
    },
  },
  layout: (make, view) => {
    make.left.top.right.equalTo(view.super.safeArea);
    make.bottom.equalTo(view.super.safeAreaBottom).inset(64);
  },
  events: {
    retry: async () => {
      loadable.showLoading();
      await $wait(1);
      loadable.showContent();
    },
  },
});

const states: LoadableContentState[] = ["loading", "content", "empty", "error"];

$ui.render({
  props: { title: "LoadableContentView" },
  views: [
    loadable.definition,
    {
      type: "tab",
      props: {
        items: ["加载", "内容", "空", "错误"],
        index: 0,
      },
      layout: (make, view) => {
        make.left.right.inset(16);
        make.bottom.equalTo(view.super.safeAreaBottom).inset(10);
        make.height.equalTo(36);
      },
      events: {
        changed: (sender) => {
          loadable.state = states[sender.index];
        },
      },
    },
  ],
});
