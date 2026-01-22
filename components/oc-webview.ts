import { Base } from "./base";

/**
 * # OCWebView
 *
 * 通过OC Runtime构建的Web视图，该控件是为了解决UIWebView无法通过CloudFlare人机检测的问题
 * （TIPS：推测JSBox的网页视图实际上运行在一个iframe中，所以会出现该问题）
 *
 * ## Argumnets
 *
 * props:
 * - url: string
 *
 * layout
 *
 * events:
 * - didStart?: (sender: any) => void;
 * - didFinish?: (sender: any) => void;
 * - didFail?: (sender: any, error: NSError | null) => void;
 * 
 * events中sender的any类型实际为WKWebView OC类型
 *
 * ## Methods
 *
 * - url
 * - canGoBack
 * - canGoForward
 * - goBack()
 * - goForward()
 * - stopLoading()
 * - reload()
 *
 */
export class OCWebView extends Base<UIView, UiTypes.RuntimeOptions> {
  _defineView: () => UiTypes.RuntimeOptions;
  webView: any; // 实际为WKWebView OC类型
  constructor({
    props,
    layout,
    events,
  }: {
    props: { url: string };
    events: {
      didStart?: (sender: any) => void; // 此处的any实际为WKWebView OC类型
      didFinish?: (sender: any) => void;
      didFail?: (sender: any, error: NSError | null) => void;
    };
    layout: (make: MASConstraintMaker, view: UIView) => void;
  }) {
    super();
    // ====== 创建 WebView ======
    const config = $objc("WKWebViewConfiguration").invoke("new");
    config.invoke(
      "setWebsiteDataStore:",
      $objc("WKWebsiteDataStore").invoke("defaultDataStore"),
    );
    const webView = $objc("WKWebView").invoke(
      "alloc.initWithFrame:configuration:",
      $rect(0, 0, 0, 0),
      config,
    );
    this.webView = webView;

    this._defineView = () => {
      return {
        type: "runtime",
        props: {
          id: this.id,
          view: webView,
        },
        layout,
        events: {
          ready: (sender) => {
            // ====== 设置 delegate ======
            const navDelegate = $delegate({
              type: "WKNavigationDelegate",
              events: {
                "webView:didStartProvisionalNavigation:": (
                  wv: any,
                  nav: any,
                ) => {
                  events.didStart && events.didStart(wv);
                },
                "webView:didFinishNavigation:": (wv: any, nav: any) => {
                  events.didFinish && events.didFinish(wv);
                },
                "webView:didFailNavigation:withError:": (
                  wv: any,
                  nav: any,
                  e: any,
                ) => {
                  events.didFail && events.didFail(wv, e ? e.jsValue() : null);
                },
                "webView:didFailProvisionalNavigation:withError:": (
                  wv: any,
                  nav: any,
                  e: any,
                ) => {
                  events.didFail && events.didFail(wv, e ? e.jsValue() : null);
                },
              },
            });

            webView.invoke("setNavigationDelegate:", navDelegate);

            // ===== 加载URL ======
            const urlStr = props.url;
            const url = $objc("NSURL").invoke("URLWithString:", urlStr);
            const req = $objc("NSURLRequest").invoke("requestWithURL:", url);
            webView.invoke("loadRequest:", req);
          },
        },
      };
    };
  }

  get url(): string {
    const nsurl = this.webView.invoke("URL");
    return nsurl ? nsurl.invoke("absoluteString").rawValue() : "";
  }

  get canGoBack(): boolean {
    return this.webView.invoke("canGoBack");
  }

  get canGoForward(): boolean {
    return this.webView.invoke("canGoForward");
  }

  goBack() {
    if (this.canGoBack) this.webView.invoke("goBack");
  }

  goForward() {
    if (this.canGoForward) this.webView.invoke("goForward");
  }

  stopLoading() {
    this.webView.invoke("stopLoading");
  }

  reload() {
    this.webView.invoke("reload");
  }
}
