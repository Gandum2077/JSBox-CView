import { ContentView, CustomNavigationBar, Label, NavBarState, Tab } from "../../index";

const styleNames = ["隐藏", "最小", "普通", "扩展"];
let initialStyle = 2;

const createDemo = (style: NavBarState) => {
  const statusLabel = new Label({
    props: {
      text: `当前形态：${styleNames[style]}`,
      font: $font("bold", 20),
      align: $align.center,
      textColor: $color("primaryText"),
    },
    layout: (make, view) => {
      make.left.right.inset(24);
      make.bottom.equalTo(view.super.centerY).offset(-28);
      make.height.equalTo(28);
    },
  });

  const descriptionLabel = new Label({
    props: {
      text: "切换 Tab 观察导航栏的布局与动画\n标题、右侧按钮和扩展工具区也都可以交互",
      font: $font(14),
      lines: 0,
      align: $align.center,
      textColor: $color("secondaryText"),
    },
    layout: (make, view) => {
      make.left.right.inset(32);
      make.top.equalTo(view.super.centerY).offset(34);
    },
  });

  const toolView = new ContentView({
    props: { bgcolor: $color("clear") },
    layout: $layout.fill,
    views: [
      {
        type: "label",
        props: {
          text: "扩展工具区",
          font: $font("bold", 14),
          textColor: $color("secondaryText"),
        },
        layout: (make, view) => {
          make.left.inset(16);
          make.centerY.equalTo(view.super);
        },
      },
      {
        type: "button",
        props: {
          title: "筛选",
          symbol: "line.3.horizontal.decrease",
          titleColor: $color("systemBlue"),
          bgcolor: $color("clear"),
        },
        layout: (make, view) => {
          make.right.inset(12);
          make.centerY.equalTo(view.super);
          make.size.equalTo($size(88, 36));
        },
        events: {
          tapped: () => $ui.toast("点击了自定义工具区"),
        },
      },
    ],
  });

  let titleTapCount = 0;
  const navbar = new CustomNavigationBar({
    props: {
      style,
      title: "CustomNavigationBar",
      popButtonEnabled: true,
      popButtonTitle: "示例",
      popToRootEnabled: true,
      toolView,
      rightBarButtonItems: [
        {
          title: "完成",
          handler: () => $ui.toast("文本按钮"),
        },
        {
          symbol: "ellipsis.circle",
          handler: () => $ui.toast("Symbol 按钮"),
        },
      ],
    },
    events: {
      hidden: () => (statusLabel.view.text = "当前形态：隐藏"),
      minimized: () => (statusLabel.view.text = "当前形态：最小"),
      restored: () => (statusLabel.view.text = "当前形态：普通"),
      expanded: () => (statusLabel.view.text = "当前形态：扩展"),
      popHandler: () => $ui.toast("返回上一页"),
      popToRootHandler: () => $ui.toast("长按返回根页面"),
      titleTapped: (sender) => {
        titleTapCount += 1;
        sender.title = `标题已点击 ${titleTapCount} 次`;
      },
    },
  });

  const styleTab = new Tab({
    props: {
      items: styleNames,
      index: style,
    },
    layout: (make, view) => {
      make.left.right.inset(24);
      make.centerY.equalTo(view.super);
      make.height.equalTo(36);
    },
    events: {
      changed: (sender) => {
        navbar.style = sender.index as NavBarState;
      },
    },
  });

  $ui.push({
    props: { navBarHidden: true, statusBarStyle: 0 },
    views: [statusLabel.definition, styleTab.definition, descriptionLabel.definition, navbar.definition],
  });
};

const initialStyleTab = new Tab({
  props: {
    items: styleNames,
    index: initialStyle,
  },
  layout: (make, view) => {
    make.left.right.inset(24);
    make.centerY.equalTo(view.super).offset(-18);
    make.height.equalTo(36);
  },
  events: {
    changed: (sender) => {
      initialStyle = sender.index as NavBarState;
    },
  },
});

$ui.render({
  props: { title: "Custom Navigation Bar" },
  views: [
    {
      type: "label",
      props: {
        text: "选择导航栏的初始形态",
        font: $font("bold", 18),
        align: $align.center,
        textColor: $color("primaryText"),
      },
      layout: (make, view) => {
        make.left.right.inset(24);
        make.bottom.equalTo(view.super.centerY).offset(-52);
        make.height.equalTo(24);
      },
    },
    initialStyleTab.definition,
    {
      type: "button",
      props: {
        title: "打开完整能力演示",
        symbol: "rectangle.topthird.inset.filled",
      },
      layout: (make, view) => {
        make.centerX.equalTo(view.super);
        make.top.equalTo(view.super.centerY).offset(36);
        make.size.equalTo($size(240, 52));
      },
      events: {
        tapped: () => createDemo(initialStyle),
      },
    },
  ],
});
