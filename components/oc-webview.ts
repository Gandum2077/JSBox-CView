import { Base } from "./base";

/** OCWebView 的初始页面属性。 */
export interface OCWebViewProps {
  /** 首次加载并被记作初始地址的 URL。 */
  url: string;
}

/** OCWebView 的网页导航事件。 */
export interface OCWebViewEvents {
  /** 开始导航时触发。 */
  didStart?: (sender: any) => void;
  /** 导航完成时触发。 */
  didFinish?: (sender: any) => void;
  /** 导航失败时触发。 */
  didFail?: (sender: any, error: NSError | null) => void;
}

/**
 * 基于 Objective-C `WKWebView` 的网页组件。
 *
 * 组件使用系统默认网站数据存储，可共享 Cookie 等网站数据，适合账号登录、Cloudflare 验证等依赖原生浏览器状态的流程；
 * 仅展示普通网页时应优先使用 {@link Web}。`didStart`、`didFinish` 和 `didFail` 的 `sender` 均为 Objective-C
 * `WKWebView` 对象，失败回调的 `error` 为 `NSError` 转换后的 JSValue，转换失败时为 `null`。
 *
 * 创建时传入的 URL 会被保存为初始地址。{@link reload} 刷新当前页面，{@link reloadFromOrigin} 则重新导航到初始地址。
 * {@link exec} 提供 Promise 形式的 JavaScript 执行接口，{@link eval} 保留兼容旧代码的回调形式。
 * @example
 * ```ts
 * const web = new OCWebView({
 *   props: { url: "https://example.com" },
 *   events: {
 *     didFinish: sender => console.log(sender.invoke("title").rawValue())
 *   },
 *   layout: $layout.fill
 * })
 *
 * const title = await web.exec<string>("document.title")
 * ```
 */
export class OCWebView extends Base<UIView, UiTypes.RuntimeOptions> {
  /** 返回承载原生 `WKWebView` 的运行时视图定义。 */
  _defineView: () => UiTypes.RuntimeOptions;

  /** 当前组件使用的 Objective-C `WKWebView` 实例。 */
  webView: any;

  /** 创建组件时传入、供 {@link reloadFromOrigin} 使用的初始地址。 */
  private _originUrl: string;

  /** 创建并配置原生 `WKWebView`。 */
  constructor({
    props,
    layout,
    events,
  }: {
    /** 组件属性。 */
    props: OCWebViewProps;
    /** 网页导航事件。 */
    events: OCWebViewEvents;
    /** 组件根视图的布局回调。 */
    layout: (make: MASConstraintMaker, view: UIView) => void;
  }) {
    super();
    // ====== 创建 WebView ======
    const config = $objc("WKWebViewConfiguration").invoke("new");
    config.invoke("setWebsiteDataStore:", $objc("WKWebsiteDataStore").invoke("defaultDataStore"));
    const webView = $objc("WKWebView").invoke("alloc.initWithFrame:configuration:", $rect(0, 0, 0, 0), config);
    this.webView = webView;
    this._originUrl = props.url;

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
                "webView:didStartProvisionalNavigation:": (wv: any, nav: any) => {
                  events.didStart && events.didStart(wv);
                },
                "webView:didFinishNavigation:": (wv: any, nav: any) => {
                  events.didFinish && events.didFinish(wv);
                },
                "webView:didFailNavigation:withError:": (wv: any, nav: any, e: any) => {
                  events.didFail && events.didFail(wv, e ? e.jsValue() : null);
                },
                "webView:didFailProvisionalNavigation:withError:": (wv: any, nav: any, e: any) => {
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

  /**
   * 获取当前页面地址。
   * @returns 当前 URL；页面尚未产生 URL 时返回空字符串。
   */
  get url(): string {
    const nsurl = this.webView.invoke("URL");
    return nsurl ? nsurl.invoke("absoluteString").rawValue() : "";
  }

  /** 设置并立即加载新的页面地址。 */
  set url(urlStr: string) {
    const url = $objc("NSURL").invoke("URLWithString:", urlStr);
    const req = $objc("NSURLRequest").invoke("requestWithURL:", url);
    this.webView.invoke("loadRequest:", req);
  }

  /**
   * 获取当前页面标题。
   * @returns 页面标题；标题不可用时返回空字符串。
   */
  get title(): string {
    const title = this.webView.invoke("title");
    return title ? title.rawValue() : "";
  }

  /**
   * 判断当前页面是否可以后退。
   * @returns 可以后退时为 `true`。
   */
  get canGoBack(): boolean {
    return this.webView.invoke("canGoBack");
  }

  /**
   * 判断当前页面是否可以前进。
   * @returns 可以前进时为 `true`。
   */
  get canGoForward(): boolean {
    return this.webView.invoke("canGoForward");
  }

  /** 在存在后退记录时返回上一页面。 */
  goBack() {
    if (this.canGoBack) this.webView.invoke("goBack");
  }

  /** 在存在前进记录时进入下一页面。 */
  goForward() {
    if (this.canGoForward) this.webView.invoke("goForward");
  }

  /** 停止当前页面加载。 */
  stopLoading() {
    this.webView.invoke("stopLoading");
  }

  /** 刷新当前页面。 */
  reload() {
    this.webView.invoke("reload");
  }

  /** 重新导航到创建组件时传入的初始 URL。 */
  reloadFromOrigin() {
    this.url = this._originUrl;
  }

  /**
   * 在当前页面执行 JavaScript。
   *
   * Objective-C 返回值会尽量转换为 JSValue；执行失败时 Promise 会以对应错误拒绝。
   * @template T 预期的 JavaScript 返回值类型。
   * @param script 要执行的 JavaScript 源码。
   * @returns JavaScript 的异步执行结果。
   */
  exec<T = any>(script: string): Promise<T> {
    return new Promise((resolve, reject) => {
      this.webView.invoke(
        "evaluateJavaScript:completionHandler:",
        script,
        $block("void, id, NSError *", (result: any, error: any) => {
          const jsError = error ? error.jsValue() : null;
          if (jsError) {
            reject(jsError);
            return;
          }
          if (!result) {
            resolve(result);
            return;
          }
          if (typeof result.jsValue === "function") {
            resolve(result.jsValue());
            return;
          }
          resolve(result);
        }),
      );
    });
  }

  /**
   * 以回调形式在当前页面执行 JavaScript。
   *
   * 新代码通常应优先使用 {@link exec}。
   */
  eval({
    script,
    handler,
  }: {
    /** 要执行的 JavaScript 源码。 */
    script: string;
    /** 收到执行结果或错误时调用的处理函数。 */
    handler: (result: any, error?: NSError) => void;
  }) {
    this.exec(script).then(
      (result) => handler(result),
      (error) => handler(undefined, error),
    );
  }
}
