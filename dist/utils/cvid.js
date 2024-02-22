"use strict";
// cvid 用于生成唯一的 id
Object.defineProperty(exports, "__esModule", { value: true });
exports.cvid = void 0;
/**
 * 生成指定长度的随机字符串
 */
function makeid(length) {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
class CVID {
    constructor({ prefix = "id_", startIndex = 0 } = {}) {
        this._prefix = prefix;
        this._index = startIndex;
    }
    get newId() {
        const id = this._prefix + this._index;
        this._index++;
        return id;
    }
}
exports.cvid = new CVID({ prefix: makeid(8) + "_" });
