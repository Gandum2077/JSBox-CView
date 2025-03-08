export const UIAlertActionStyle = {
  Default: 0,
  Cancel: 1,
  Destructive: 2,
};

export const UIAlertControllerStyle = {
  ActionSheet: 0,
  Alert: 1,
};

export class UIAlertAction {
  title: string;
  style: number;
  instance: any;

  constructor(
    title: string,
    style = UIAlertActionStyle.Default,
    handler: Function
  ) {
    this.title = title;
    this.style = style;
    this.instance = $objc("UIAlertAction").$actionWithTitle_style_handler(
      title,
      style,
      $block("void, UIAlertAction *", () => {
        if (handler) {
          handler(this);
        }
      })
    );
  }
}

/**
 * Alert的基础类
 */
export class UIAlertController {
  title: string;
  message: string;
  style: number;
  instance: any;
  constructor(
    title: string,
    message: string,
    style = UIAlertControllerStyle.ActionSheet
  ) {
    this.title = title;
    this.message = message;
    this.style = style;
    this.instance = $objc(
      "UIAlertController"
    ).$alertControllerWithTitle_message_preferredStyle(title, message, style);
  }

  addAction(action: UIAlertAction) {
    this.instance.$addAction(action.instance);
  }

  addTextField(options: any) {
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
            })
          );
        }
      })
    );
  }

  getText(index: number) {
    const textField = this.instance.$textFields().$objectAtIndex(index);
    const text = textField.$text();
    return text.jsValue();
  }

  present() {
    this.instance.$show();
  }
}
