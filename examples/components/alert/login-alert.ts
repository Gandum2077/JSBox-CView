import { loginAlert } from "../../../index";

$ui.render({
  props: { title: "Login Alert" },
  views: [
    {
      type: "button",
      props: { title: "登录" },
      layout: (make, view) => {
        make.center.equalTo(view.super);
        make.size.equalTo($size(160, 44));
      },
      events: {
        tapped: () => {
          loginAlert({
            title: "登录",
            message: "两个输入框都填写后确认",
            placeholder1: "用户名",
            placeholder2: "密码",
          })
            .then(({ username, password }) => {
              $ui.alert({
                title: `你好，${username}`,
                message: `密码长度：${password.length}`,
              });
            })
            .catch(() => $ui.toast("已取消"));
        },
      },
    },
  ],
});
