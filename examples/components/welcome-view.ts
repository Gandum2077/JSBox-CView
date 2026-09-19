import { ContentView, WelcomeView } from "../../index";

const introduction =
  "欢迎使用 CView\n\n旋转设备或调整窗口大小，主体会根据可用宽度重新计算高度。空间充足时居中，空间不足时可以上下滚动。\n\n底部操作随内容一起滚动，顶部返回保持可用，右上角操作按页面配置。";
const font = $font(16);
const background = $color("#F7CD82", "#925F07");
const buttonColor = $color("#272C34");
const welcome = new WelcomeView({
  props: {
    leadingSymbol: "xmark",
    horizontalInset: 38,
    pages: [
      {
        logo: { props: { symbol: "sparkles", tintColor: $color("#009FCC") }, size: 128 },
        logoSpacing: { min: 24, max: 80 },
        bgcolor: background,
        trailingAction: { title: "跳过", tapped: (view) => view.scrollToPage(1) },
        content: new ContentView({
          props: { bgcolor: $color("clear") },
          layout: $layout.fill,
          views: [
            {
              type: "label",
              props: { text: introduction, font, lines: 0, textColor: $color("#303030", "#FFFFFF") },
              layout: $layout.fill,
            },
          ],
        }),
        contentHeight: (width) => Math.ceil($text.sizeThatFits({ text: introduction, width, font }).height),
        buttons: [
          { props: { title: "我已了解", bgcolor: buttonColor }, tapped: (_sender, view) => view.scrollToPage(1) },
        ],
      },
      {
        content: new ContentView({
          props: { bgcolor: $color("clear") },
          layout: $layout.fill,
          views: [
            {
              type: "label",
              props: { text: "登录选项\n\n这里可以替换为自己的表单组件。", lines: 0, align: $align.center },
              layout: $layout.fill,
            },
          ],
        }),
        bgcolor: $color("#D9EBF5", "#243746"),
        trailingAction: { title: "完成", tapped: () => $ui.toast("完成引导") },
        contentHeight: 219,
        buttons: [
          { props: { title: "网页登录", bgcolor: buttonColor }, tapped: () => $ui.toast("网页登录") },
          { props: { title: "Cookie 登录", bgcolor: buttonColor }, tapped: () => $ui.toast("Cookie 登录") },
        ],
      },
    ],
  },
  layout: $layout.fill,
  events: { leadingTapped: () => $app.close() },
});

$ui.render({ props: { navBarHidden: true, statusBarStyle: 0, theme: "auto" }, views: [welcome.definition] });
