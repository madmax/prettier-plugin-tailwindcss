import * as prettier$1 from "prettier";
import { SupportLanguage, SupportOption } from "prettier";

//#region src/options.d.ts
declare const options: Record<string, SupportOption>;
//#endregion
//#region src/plugins/html-erb.d.ts
declare const languages: SupportLanguage[];
//#endregion
//#region src/index.d.ts
declare const parsers: Record<string, prettier$1.Parser<any> | (() => Promise<prettier$1.Parser<any> | undefined>) | undefined>, printers: Record<string, prettier$1.Printer<any> | (() => Promise<prettier$1.Printer<any> | undefined>) | undefined>;
interface PluginOptions {
  /**
   * Path to the Tailwind config file.
   */
  tailwindConfig?: string;
  /**
   * Path to the CSS stylesheet used by Tailwind CSS (v4+)
   */
  tailwindStylesheet?: string;
  /**
   * Path to the CSS stylesheet used by Tailwind CSS (v4+)
   *
   * @deprecated Use `tailwindStylesheet` instead
   */
  tailwindEntryPoint?: string;
  /**
   * List of custom function and tag names that contain classes.
   *
   * Default: []
   */
  tailwindFunctions?: string[];
  /**
   * List of custom attributes that contain classes.
   *
   * Default: []
   */
  tailwindAttributes?: string[];
  /**
   * Preserve whitespace around Tailwind classes when sorting.
   *
   * Default: false
   */
  tailwindPreserveWhitespace?: boolean;
  /**
   * Preserve duplicate classes inside a class list when sorting.
   *
   * Default: false
   */
  tailwindPreserveDuplicates?: boolean;
}
//#endregion
export { PluginOptions, languages, options, parsers, printers };