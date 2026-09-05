import { i as error, n as sortClasses, r as sync_default, t as sortClassList } from "./sorting-CRDUPFgk.mjs";
import { a as expiringMap, i as resolveJsFrom } from "./resolve-CCCMDi-y.mjs";
import { n as cacheForDirs } from "./utils-D8dQkKEd.mjs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
function resolveIfRelative(base, filePath) {
	if (!filePath) return null;
	return path.isAbsolute(filePath) ? filePath : path.resolve(base, filePath);
}
let pathToApiMap = expiringMap(1e4);
async function getTailwindConfig(options) {
	let base = options.base ?? process.cwd();
	let inputDir = options.filepath ? path.dirname(options.filepath) : base;
	let configPath = resolveIfRelative(base, options.configPath);
	let stylesheetPath = resolveIfRelative(base, options.stylesheetPath);
	let [mod, pkgDir] = await resolveTailwindPath({ packageName: options.packageName }, inputDir);
	let stylesheet = resolveStylesheet(stylesheetPath, base);
	let jsConfig = resolveJsConfigPath(configPath);
	if (!stylesheet && !(mod === null || mod === void 0 ? void 0 : mod.__unstable__loadDesignSystem)) jsConfig = jsConfig ?? findClosestJsConfig(inputDir);
	if (jsConfig) {
		if (!stylesheet) return pathToApiMap.remember(`${pkgDir}:${jsConfig}`, async () => {
			const { loadV3 } = await import("./v3-8UBwsu5l.mjs");
			return loadV3(pkgDir, jsConfig);
		});
		error("explicit-stylesheet-and-config-together", base, `You have specified a Tailwind CSS stylesheet and a Tailwind CSS config at the same time. Use stylesheetPath unless you are using v3. Preferring the stylesheet.`);
	}
	if (mod && !mod.__unstable__loadDesignSystem) {
		if (!stylesheet) return pathToApiMap.remember(`${pkgDir}:${jsConfig}`, async () => {
			const { loadV3 } = await import("./v3-8UBwsu5l.mjs");
			return loadV3(pkgDir, jsConfig);
		});
		mod = null;
		error("stylesheet-unsupported", base, "You have specified a Tailwind CSS stylesheet but your installed version of Tailwind CSS does not support this feature.");
	}
	if (mod && mod.__unstable__loadDesignSystem && pkgDir) stylesheet ?? (stylesheet = `${pkgDir}/theme.css`);
	return pathToApiMap.remember(`${pkgDir}:${stylesheet}`, async () => {
		const { loadV4 } = await import("./v4-DZ4xOQJ5.mjs");
		return loadV4(mod, stylesheet);
	});
}
let resolvedModCache = expiringMap(1e4);
async function resolveTailwindPath(options, baseDir) {
	let pkgName = options.packageName ?? "tailwindcss";
	let makeKey = (dir) => `${pkgName}:${dir}`;
	let cached = resolvedModCache.get(makeKey(baseDir));
	if (cached !== void 0) return cached;
	let resolve = async () => {
		let pkgDir = null;
		let mod = null;
		try {
			mod = await import(pathToFileURL(resolveJsFrom(baseDir, pkgName)).toString());
			let pkgFile = resolveJsFrom(baseDir, `${pkgName}/package.json`);
			pkgDir = path.dirname(pkgFile);
		} catch {}
		return [mod, pkgDir];
	};
	let result = await resolve();
	let [, pkgDir] = result;
	if (pkgDir) cacheForDirs(resolvedModCache, baseDir, result, pkgDir, makeKey);
	else resolvedModCache.set(makeKey(baseDir), result);
	return result;
}
function resolveJsConfigPath(configPath) {
	if (!configPath) return null;
	if (configPath.endsWith(".css")) return null;
	return configPath;
}
let configPathCache = /* @__PURE__ */ new Map();
function findClosestJsConfig(inputDir) {
	let cached = configPathCache.get(inputDir);
	if (cached !== void 0) return cached;
	let configPath = null;
	try {
		configPath = sync_default(inputDir, (_, names) => {
			if (names.includes("tailwind.config.js")) return "tailwind.config.js";
			if (names.includes("tailwind.config.cjs")) return "tailwind.config.cjs";
			if (names.includes("tailwind.config.mjs")) return "tailwind.config.mjs";
			if (names.includes("tailwind.config.ts")) return "tailwind.config.ts";
		}) ?? null;
	} catch {}
	if (configPath) cacheForDirs(configPathCache, inputDir, configPath, path.dirname(configPath));
	else configPathCache.set(inputDir, null);
	return configPath;
}
function resolveStylesheet(stylesheetPath, base) {
	if (!stylesheetPath) return null;
	if (stylesheetPath.endsWith(".js") || stylesheetPath.endsWith(".mjs") || stylesheetPath.endsWith(".cjs") || stylesheetPath.endsWith(".ts") || stylesheetPath.endsWith(".mts") || stylesheetPath.endsWith(".cts")) error("stylesheet-is-js-file", base, "Your `stylesheetPath` option points to a JS/TS config file. You must point to your project's `.css` file for v4 projects.");
	else if (stylesheetPath.endsWith(".sass") || stylesheetPath.endsWith(".scss") || stylesheetPath.endsWith(".less") || stylesheetPath.endsWith(".styl")) error("stylesheet-is-preprocessor-file", base, "Your `stylesheetPath` option points to a preprocessor file. This is unsupported and you may get unexpected results.");
	else if (!stylesheetPath.endsWith(".css")) error("stylesheet-is-not-css-file", base, "Your `stylesheetPath` option does not point to a CSS file. This is unsupported and you may get unexpected results.");
	return stylesheetPath;
}
async function createSorter(opts) {
	let preserveDuplicates = opts.preserveDuplicates ?? false;
	let preserveWhitespace = opts.preserveWhitespace ?? false;
	let api = await getTailwindConfig({
		base: opts.base,
		filepath: opts.filepath,
		configPath: opts.configPath,
		stylesheetPath: opts.stylesheetPath,
		packageName: opts.packageName
	});
	let env = {
		context: api,
		changes: [],
		options: {
			tailwindPreserveWhitespace: preserveWhitespace,
			tailwindPreserveDuplicates: preserveDuplicates,
			tailwindPackageName: opts.packageName
		},
		matcher: void 0
	};
	return {
		sortClassLists(classes) {
			return classes.map((list) => {
				return sortClassList({
					api,
					classList: list,
					removeDuplicates: !preserveDuplicates
				}).classList;
			});
		},
		sortClassAttributes(classes) {
			return classes.map((list) => sortClasses(list, { env }));
		}
	};
}
export { createSorter, getTailwindConfig };
