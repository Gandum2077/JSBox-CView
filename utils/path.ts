// 用于处理路径的工具函数

function _splitProtocol(path: string): [string, string]{
  const regex = /^\w+:\/\//;
  const result = regex.exec(path);
  if (result) {
    const protocol = result[0];
    return [protocol, path.slice(protocol.length)];
  } else {
    return ["", path];
  }
}

// 正规化
function _normalize(path: string): string {
  if (!path) return "";
  path = path.trim();
  if (!path) return "";
  const [protocol, remainingPath] = _splitProtocol(path);
  return protocol + remainingPath.replace(/\/{2,}/g, "/");
}

export function split(path: string): [string, string]{
  path = _normalize(path);
  const [protocol, remainingPath] = _splitProtocol(path);
  const lastIndex = remainingPath.lastIndexOf("/");
  if (lastIndex === -1) {
    return [protocol, remainingPath];
  } else if (lastIndex === 0) {
    return [protocol + "/", remainingPath.slice(1)];
  } else {
    return [
      protocol + remainingPath.slice(0, lastIndex),
      remainingPath.slice(lastIndex + 1)
    ];
  }
}

export function dirname(path: string): string{
  return split(path)[0];
}

export function basename(path: string): string {
  return split(path)[1];
}

export function extname(path: string): string{
  const _basename = basename(path);
  if (!_basename) return "";
  const components = _basename.split(".");
  if (components.length === 1) {
    return "";
  } else {
    return "." + components.slice(-1)[0];
  }
}

// 拼接目录
export function join(...args: string[]): string {
  return args
    .map((part, i) => {
      if (i === 0) {
        return part.trim().replace(/[/]*$/g, "");
      } else {
        return part.trim().replace(/(^[/]*|[/]*$)/g, "");
      }
    })
    .filter(x => x.length)
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

export function getCreationDate(path: string): number{
  const { NSFileCreationDate } = _getAttributes(path);
  if (!NSFileCreationDate) return 0;
  return NSFileCreationDate.getTime();
}

export function getModificationDate(path: string): number{
  const { NSFileModificationDate } = _getAttributes(path);
  if (!NSFileModificationDate) return 0;
  return NSFileModificationDate.getTime();
}

export function getFileSize(path: string): number{
  const { NSFileSize } = _getAttributes(path);
  return NSFileSize || 0;
}
