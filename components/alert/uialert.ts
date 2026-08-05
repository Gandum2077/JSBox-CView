/** UIKit Alert 操作的样式常量。 */
export const UIAlertActionStyle = {
  /** 默认操作。 */
  Default: 0,
  /** 取消操作。 */
  Cancel: 1,
  /** 破坏性操作。 */
  Destructive: 2,
};

/** UIKit Alert 容器的显示样式常量。 */
export const UIAlertControllerStyle = {
  /** 底部操作表样式。 */
  ActionSheet: 0,
  /** 居中警告框样式。 */
  Alert: 1,
};

/** 原生 Alert 文本输入框的配置选项。 */
export interface UIAlertTextFieldOptions extends Pick<
  UiTypes.InputProps,
  "type" | "placeholder" | "text" | "textColor" | "font" | "align" | "secure"
> {
  /** 文本输入框事件。 */
  events?: {
    /** 按下 Return 键时调用；返回是否允许结束本次操作。 */
    shouldReturn?: () => boolean;
  };
}

/** 封装原生 `UIAlertAction` 的 Alert 操作。 */
export class UIAlertAction {
  /** 操作标题。 */
  title: string;
  /** `UIAlertActionStyle` 样式值。 */
  style: number;
  /** 底层 Objective-C `UIAlertAction` 实例。 */
  instance: any;

  /**
   * 创建一个原生 Alert 操作。
   * @param title - 操作标题。
   * @param style - `UIAlertActionStyle` 样式值。
   * @param handler - 用户触发操作时调用的处理函数。
   */
  constructor(title: string, style = UIAlertActionStyle.Default, handler: Function) {
    this.title = title;
    this.style = style;
    this.instance = $objc("UIAlertAction").$actionWithTitle_style_handler(
      title,
      style,
      $block("void, UIAlertAction *", () => {
        if (handler) {
          handler(this);
        }
      }),
    );
  }
}

/**
 * 封装原生 `UIAlertController` 的基础 Alert 容器。
 */
export class UIAlertController {
  /** Alert 标题。 */
  title: string;
  /** Alert 消息。 */
  message: string;
  /** `UIAlertControllerStyle` 样式值。 */
  style: number;
  /** 底层 Objective-C `UIAlertController` 实例。 */
  instance: any;

  /**
   * 创建一个原生 Alert 容器。
   * @param title - Alert 标题。
   * @param message - Alert 消息。
   * @param style - `UIAlertControllerStyle` 样式值。
   */
  constructor(title: string, message: string, style = UIAlertControllerStyle.ActionSheet) {
    this.title = title;
    this.message = message;
    this.style = style;
    this.instance = $objc("UIAlertController").$alertControllerWithTitle_message_preferredStyle(title, message, style);
  }

  /**
   * 向 Alert 添加一个操作。
   * @param action - 待添加的 Alert 操作。
   */
  addAction(action: UIAlertAction) {
    this.instance.$addAction(action.instance);
  }

  /**
   * 向 Alert 添加一个原生文本输入框。
   *
   * 选项支持 `type`、`placeholder`、`text`、`textColor`、`font`、`align`、`secure`
   * 以及 `events.shouldReturn`。
   * @param options - 文本输入框选项。
   */
  addTextField(options: UIAlertTextFieldOptions) {
    this.instance.$addTextFieldWithConfigurationHandler(
      $block("void, UITextField *", (textField: any) => {
        textField.$setClearButtonMode(1);

        if (options.type) {
          textField.$setKeyboardType(options.type);
        }
        if (options.placeholder) {
          textField.$setPlaceholder(options.placeholder);
        }
        if (options.text) {
          textField.$setText(options.text);
        }
        if (options.textColor) {
          textField.$setTextColor(options.textColor.ocValue());
        }
        if (options.font) {
          textField.$setFont(options.font.ocValue());
        }
        if (options.align) {
          textField.$setTextAlignment(options.align);
        }
        if (options.secure) {
          textField.$setSecureTextEntry(true);
        }
        if (options.events) {
          const events = options.events;
          textField.$setDelegate(
            $delegate({
              type: "UITextFieldDelegate",
              events: {
                "textFieldShouldReturn:": (textField: any) => {
                  if (events.shouldReturn) {
                    return events.shouldReturn();
                  } else {
                    return true;
                  }
                },
              },
            }),
          );
        }
      }),
    );
  }

  /**
   * 获取指定文本输入框的当前内容。
   * @param index - 文本输入框索引。
   * @returns 输入框的当前文本。
   */
  getText(index: number) {
    const textField = this.instance.$textFields().$objectAtIndex(index);
    const text = textField.$text();
    return text.jsValue();
  }

  /** 在当前 JSBox 界面上显示 Alert。 */
  present() {
    this.instance.$show();
  }
}
