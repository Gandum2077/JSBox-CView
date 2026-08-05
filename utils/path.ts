function _splitProtocol(path: string): [string, string] {
  const regex = /^\w+:\/\//;
  const result = regex.exec(path);
  if (result) {
    const protocol = result[0];
    return [protocol, path.slice(protocol.length)];
  } else {
    return ["", path];
  }
}

function _normalize(path: string): string {
  if (!path) return "";
  path = path.trim();
  if (!path) return "";
  const [protocol, remainingPath] = _splitProtocol(path);
  return protocol + remainingPath.replace(/\/{2,}/g, "/");
}

/**
 * 将路径拆分为目录部分和末尾名称。
 *
 * 输入会被去除首尾空白，并在保留 `scheme://` 协议前缀的同时合并重复斜杠。
 * @param path - 待拆分的 JSBox 路径或 URL 形式字符串。
 * @returns 包含目录和末尾名称的元组。
 */
export function split(path: string): [string, string] {
  path = _normalize(path);
  const [protocol, remainingPath] = _splitProtocol(path);
  const lastIndex = remainingPath.lastIndexOf("/");
  if (lastIndex === -1) {
    return [protocol, remainingPath];
  } else if (lastIndex === 0) {
    return [protocol + "/", remainingPath.slice(1)];
  } else {
    return [protocol + remainingPath.slice(0, lastIndex), remainingPath.slice(lastIndex + 1)];
  }
}

/**
 * 获取路径的目录部分。
 * @param path - JSBox 路径或 URL 形式字符串。
 * @returns 经过规范化的目录部分。
 */
export function dirname(path: string): string {
  return split(path)[0];
}

/**
 * 获取路径的末尾名称。
 * @param path - JSBox 路径或 URL 形式字符串。
 * @returns 路径最后一段的名称。
 */
export function basename(path: string): string {
  return split(path)[1];
}

/**
 * 获取末尾名称的最后一个扩展名。
 * @param path - JSBox 路径或 URL 形式字符串。
 * @returns 带前导点的扩展名；没有扩展名时返回空字符串。
 */
export function extname(path: string): string {
  const _basename = basename(path);
  if (!_basename) return "";
  const components = _basename.split(".");
  if (components.length === 1) {
    return "";
  } else {
    return "." + components.slice(-1)[0];
  }
}

/**
 * 使用单个斜杠连接多个路径片段。
 *
 * 此函数只清理片段边界的斜杠，不解析 `.`、`..` 或文件系统语义。
 * @param args - 待连接的路径片段。
 * @returns 连接后的路径。
 */
export function join(...args: string[]): string {
  return args
    .map((part, i) => {
      if (i === 0) {
        return part.trim().replace(/[/]*$/g, "");
      } else {
        return part.trim().replace(/(^[/]*|[/]*$)/g, "");
      }
    })
    .filter((x) => x.length)
    .join("/");
}

function _getAttributes(path: string): {
  NSFileCreationDate?: Date;
  NSFileModificationDate?: Date;
  NSFileSize?: number;
} {
  if (!$file.exists(path)) throw new Error("invalid path");
  path = $file.absolutePath(path);
  const attributesOfItemAtPath = $objc("NSFileManager")
    .invoke("defaultManager")
    .invoke("attributesOfItemAtPath:error", path, null);
  return attributesOfItemAtPath.jsValue();
}

/**
 * 获取文件的创建时间。
 * @param path - JSBox 文件路径。
 * @returns Unix 时间戳，单位为毫秒；属性缺失时返回 `0`。
 * @throws 路径不存在时抛出异常。
 */
export function getCreationDate(path: string): number {
  const { NSFileCreationDate } = _getAttributes(path);
  if (!NSFileCreationDate) return 0;
  return NSFileCreationDate.getTime();
}

/**
 * 获取文件的最后修改时间。
 * @param path - JSBox 文件路径。
 * @returns Unix 时间戳，单位为毫秒；属性缺失时返回 `0`。
 * @throws 路径不存在时抛出异常。
 */
export function getModificationDate(path: string): number {
  const { NSFileModificationDate } = _getAttributes(path);
  if (!NSFileModificationDate) return 0;
  return NSFileModificationDate.getTime();
}

/**
 * 获取文件大小。
 * @param path - JSBox 文件路径。
 * @returns 文件大小，单位为字节；属性缺失时返回 `0`。
 * @throws 路径不存在时抛出异常。
 */
export function getFileSize(path: string): number {
  const { NSFileSize } = _getAttributes(path);
  return NSFileSize || 0;
}
