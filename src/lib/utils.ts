export type ClassValue = string | number | null | boolean | undefined | ClassValue[] | { [key: string]: boolean | undefined | null };

/**
 * 简化版的 cn 工具函数,合并 className 并去重
 * 不依赖外部库,避免打包体积
 */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  const push = (val: ClassValue) => {
    if (!val) return;
    if (typeof val === 'string' || typeof val === 'number') {
      out.push(String(val));
    } else if (Array.isArray(val)) {
      val.forEach(push);
    } else if (typeof val === 'object') {
      for (const key in val) {
        if (val[key]) out.push(key);
      }
    }
  };
  inputs.forEach(push);
  return out.join(' ');
}
