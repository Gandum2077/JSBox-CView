"use strict";
// 用于处理路径的工具函数
Object.defineProperty(exports, "__esModule", { value: true });
exports.split = split;
exports.dirname = dirname;
exports.basename = basename;
exports.extname = extname;
exports.join = join;
exports.getCreationDate = getCreationDate;
exports.getModificationDate = getModificationDate;
exports.getFileSize = getFileSize;
function _splitProtocol(path) {
    const regex = /^\w+:\/\//;
    const result = regex.exec(path);
    if (result) {
        const protocol = result[0];
        return [protocol, path.slice(protocol.length)];
    }
    else {
        return ["", path];
    }
}
// 正规化
function _normalize(path) {
    if (!path)
        return "";
    path = path.trim();
    if (!path)
        return "";
    const [protocol, remainingPath] = _splitProtocol(path);
    return protocol + remainingPath.replace(/\/{2,}/g, "/");
}
function split(path) {
    path = _normalize(path);
    const [protocol, remainingPath] = _splitProtocol(path);
    const lastIndex = remainingPath.lastIndexOf("/");
    if (lastIndex === -1) {
        return [protocol, remainingPath];
    }
    else if (lastIndex === 0) {
        return [protocol + "/", remainingPath.slice(1)];
    }
    else {
        return [protocol + remainingPath.slice(0, lastIndex), remainingPath.slice(lastIndex + 1)];
    }
}
function dirname(path) {
    return split(path)[0];
}
function basename(path) {
    return split(path)[1];
}
function extname(path) {
    const _basename = basename(path);
    if (!_basename)
        return "";
    const components = _basename.split(".");
    if (components.length === 1) {
        return "";
    }
    else {
        return "." + components.slice(-1)[0];
    }
}
// 拼接目录
function join(...args) {
    return args
        .map((part, i) => {
        if (i === 0) {
            return part.trim().replace(/[/]*$/g, "");
        }
        else {
            return part.trim().replace(/(^[/]*|[/]*$)/g, "");
        }
    })
        .filter((x) => x.length)
        .join("/");
}
function _getAttributes(path) {
    if (!$file.exists(path))
        throw new Error("invalid path");
    path = $file.absolutePath(path);
    const attributesOfItemAtPath = $objc("NSFileManager")
        .invoke("defaultManager")
        .invoke("attributesOfItemAtPath:error", path, null);
    return attributesOfItemAtPath.jsValue();
}
function getCreationDate(path) {
    const { NSFileCreationDate } = _getAttributes(path);
    if (!NSFileCreationDate)
        return 0;
    return NSFileCreationDate.getTime();
}
function getModificationDate(path) {
    const { NSFileModificationDate } = _getAttributes(path);
    if (!NSFileModificationDate)
        return 0;
    return NSFileModificationDate.getTime();
}
function getFileSize(path) {
    const { NSFileSize } = _getAttributes(path);
    return NSFileSize || 0;
}
