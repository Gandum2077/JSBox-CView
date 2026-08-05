/**
 * 生成指定长度的随机字母数字字符串。
 * @param length - 字符串长度。
 * @returns 随机字母数字字符串。
 */
function makeid(length: number) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

/** 带固定前缀的递增标识符生成器。 */
class CVID {
  _prefix: string;
  _index: number;

  constructor({ prefix = "id_", startIndex = 0 } = {}) {
    this._prefix = prefix;
    this._index = startIndex;
  }

  /**
   * 获取下一个标识符并递增内部序号。
   * @returns 由前缀和当前序号组成的标识符。
   */
  get newId() {
    const id = this._prefix + this._index;
    this._index++;
    return id;
  }
}

/**
 * CView 全局标识符生成器。
 *
 * 每次运行使用随机前缀，同一次运行内通过递增序号保持唯一。
 */
export const cvid = new CVID({ prefix: makeid(8) + "_" });
