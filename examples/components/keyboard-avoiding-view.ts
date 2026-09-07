import { Button, ContentView, Input, KeyboardAvoidingView, Label, Sheet } from "../../index";

const description = new Label({
  props: {
    text: "这里没有监听 keyboardHeightChanged。聚焦输入框后，可直接下拉关闭 Sheet，验证退出时是否稳定。",
    lines: 0,
    font: $font(17),
  },
  layout: (make, view) => {
    make.left.right.inset(20);
    make.top.equalTo(view.super.safeAreaTop).offset(24);
    make.height.equalTo(64);
  },
});

const input = new Input({
  props: {
    placeholder: "点击显示键盘",
    bgcolor: $color("secondarySurface"),
    cornerRadius: 10,
  },
  layout: (make, view) => {
    make.left.right.inset(20);
    make.bottom.equalTo(view.super.safeAreaBottom).inset(20);
    make.height.equalTo(44);
  },
  events: {
    returned: (sender) => sender.blur(),
  },
});

const content = new ContentView({
  props: { bgcolor: $color("primarySurface") },
  views: [description.definition, input.definition],
});

const keyboardAvoidingView = new KeyboardAvoidingView({
  props: {
    content,
    usesBottomSafeArea: false,
  },
  layout: $layout.fill,
});

const sheet = new Sheet({
  cview: keyboardAvoidingView,
  presentMode: 1,
});

const presentButton = new Button({
  props: { title: "打开键盘避让 Sheet" },
  layout: (make, view) => {
    make.center.equalTo(view.super);
    make.size.equalTo($size(220, 44));
  },
  events: {
    tapped: () => sheet.present(),
  },
});

$ui.render({
  props: { title: "Keyboard Avoiding View" },
  views: [presentButton.definition],
});
