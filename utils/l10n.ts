let language = $device.info.language;

if (language.startsWith("zh-Hans")) {
  language = "zh-Hans";
} else if (language.startsWith("zh-Hant")) {
  language = "zh-Hant";
} else if (language.startsWith("en")) {
  language = "en";
} else {
  language = "en";
}

const strings: Record<string, Record<string, string>> = {
  "zh-Hans": {
    DUPLICATE_VALUES: "取值重复",
    DONE: "完成",
    ADD: "添加",
    SEARCH: "搜索",
    PREVIOUS: "上一步",
    NEXT: "下一步",
    REMOVE: "移除",
    EDIT: "编辑",
    FINISHED: "完成",
    INVALID_VALUES: "取值不合法",
    CANCEL: "取消",
    CLIPBOARD: "剪贴板",
    OK: "好的",
  },
  "zh-Hant": {
    DUPLICATE_VALUES: "值重複",
    DONE: "完成",
    ADD: "新增",
    SEARCH: "搜尋",
    PREVIOUS: "上一步",
    NEXT: "下一步",
    REMOVE: "移除",
    EDIT: "編輯",
    FINISHED: "完成",
    INVALID_VALUES: "值無效",
    CANCEL: "取消",
    CLIPBOARD: "剪貼簿",
    OK: "確定",
  },
  en: {
    DUPLICATE_VALUES: "Duplicate values",
    DONE: "Done",
    ADD: "Add",
    SEARCH: "Search",
    PREVIOUS: "Previous",
    NEXT: "Next",
    REMOVE: "Remove",
    EDIT: "Edit",
    FINISHED: "Finished",
    INVALID_VALUES: "Invalid values",
    CANCEL: "Cancel",
    CLIPBOARD: "Clipboard",
    OK: "OK",
  },
};

/**
 * 在本项目中实现语言本地化文本。不建议用于其他项目。
 *
 * 当前语言或键没有定义时，直接返回原始键。
 * @param key - 本地化文本键。
 * @returns 匹配的本地化文本，或原始键。
 */
export function l10n(key: string) {
  if (!strings[language]) return key;
  const value = strings[language][key];
  return value || key;
}
