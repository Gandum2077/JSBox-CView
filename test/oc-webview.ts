import { OCWebView } from "../components/oc-webview";

const initialURL = "https://www.example.com";

const normalizeURL = (value: string) => {
  const url = value.trim();
  if (!url) return initialURL;
  if (/^[a-z][a-z\d+\-.]*:\/\//i.test(url)) return url;
  return `https://${url}`;
};

const currentURL = (sender: any) => {
  const nsurl = sender.invoke("URL");
  return nsurl ? nsurl.invoke("absoluteString").rawValue() : "";
};

const currentTitle = (sender: any) => {
  const title = sender.invoke("title");
  return title ? title.rawValue() : "";
};

const syncAddress = (sender: any) => {
  const input = $("oc-webview-url") as UIInputView | undefined;
  if (!input) return;
  const url = currentURL(sender);
  if (url) input.text = url;
};

const logState = (event: string, sender: any, error?: NSError | null) => {
  const url = currentURL(sender);
  const title = currentTitle(sender);
  const message = error ? ` error=${error.localizedDescription}` : "";
  console.log(`[${event}] url=${url} title=${title}${message}`);
};

const localStorageScript = `
(() => {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key !== null) data[key] = localStorage.getItem(key);
  }
  return JSON.stringify(data);
})()
`;

const webView = new OCWebView({
  props: {
    url: initialURL,
  },
  layout: (make, view) => {
    make.top.equalTo($("oc-webview-toolbar").bottom);
    make.left.right.bottom.inset(0);
  },
  events: {
    didStart: (sender) => {
      syncAddress(sender);
      logState("didStart", sender);
    },
    didFinish: async (sender) => {
      syncAddress(sender);
      logState("didFinish", sender);
      try {
        const localStorage = await webView.exec<string>(localStorageScript);
        console.log(`[localStorage] ${localStorage || "{}"}`);
      } catch (error: any) {
        console.log(`[localStorage] error=${error?.localizedDescription || error}`);
      }
    },
    didFail: (sender, error) => {
      syncAddress(sender);
      logState("didFail", sender, error);
    },
  },
});

const loadURL = (value: string) => {
  const url = normalizeURL(value);
  const input = $("oc-webview-url") as UIInputView | undefined;
  if (input) input.text = url;
  const nsurl = $objc("NSURL").invoke("URLWithString:", url);
  const request = $objc("NSURLRequest").invoke("requestWithURL:", nsurl);
  webView.webView.invoke("loadRequest:", request);
};

$ui.render({
  views: [
    {
      type: "view",
      props: {
        id: "oc-webview-toolbar",
      },
      layout: (make, view) => {
        make.top.equalTo(view.super.safeAreaTop);
        make.left.right.inset(0);
        make.height.equalTo(88);
      },
      views: [
        {
          type: "input",
          props: {
            id: "oc-webview-url",
            text: initialURL,
            type: $kbType.url,
            bgcolor: $color("secondarySurface"),
            radius: 8,
            placeholder: "输入网址后回车",
          },
          layout: (make, view) => {
            make.top.inset(12);
            make.left.right.inset(12);
            make.height.equalTo(36);
          },
          events: {
            returned: (sender) => {
              loadURL(sender.text);
            },
          },
        },
        {
          type: "view",
          props: {},
          layout: (make, view) => {
            make.top.equalTo(view.prev.bottom).offset(8);
            make.left.right.bottom.inset(12);
          },
          views: [
            {
              type: "button",
              props: {
                title: "后退",
              },
              layout: (make, view) => {
                make.left.top.bottom.inset(0);
                make.width.equalTo(72);
              },
              events: {
                tapped: () => {
                  webView.goBack();
                },
              },
            },
            {
              type: "button",
              props: {
                title: "前进",
              },
              layout: (make, view) => {
                make.left.equalTo(view.prev.right).offset(8);
                make.top.bottom.equalTo(view.prev);
                make.width.equalTo(72);
              },
              events: {
                tapped: () => {
                  webView.goForward();
                },
              },
            },
            {
              type: "button",
              props: {
                title: "刷新",
              },
              layout: (make, view) => {
                make.left.equalTo(view.prev.right).offset(8);
                make.top.bottom.equalTo(view.prev);
                make.width.equalTo(72);
              },
              events: {
                tapped: () => {
                  webView.reload();
                },
              },
            },
            {
              type: "button",
              props: {
                title: "分享",
              },
              layout: (make, view) => {
                make.left.equalTo(view.prev.right).offset(8);
                make.top.bottom.equalTo(view.prev);
                make.width.equalTo(72);
              },
              events: {
                tapped: () => {
                  $share.sheet(currentURL(webView.webView) || initialURL);
                },
              },
            },
          ],
        },
      ],
    },
    webView.definition,
  ],
});
