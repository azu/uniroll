import { transform as transformBabel, TransformOptions } from "@babel/core";

export function createTransformer(options: TransformOptions = {}) {
  return async (code: string, id: string) => {
    const ret = transformBabel(code, {
      filename: id,
      ...options,
    });
    return ret && (ret.code as string);
  };
}
