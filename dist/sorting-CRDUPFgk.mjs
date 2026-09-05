import { t as bigSign } from "./utils-D8dQkKEd.mjs";
import { dirname, resolve } from "path";
import { readdirSync, statSync } from "fs";
let seen = /* @__PURE__ */ new Set();
function warn(key, arg, ...args) {
	if (seen.has(key)) return;
	seen.add(key);
	console.warn(arg, ...args);
}
function error(key, arg, ...args) {
	if (seen.has(key)) return;
	seen.add(key);
	console.error(arg, ...args);
}
function sync_default(start, callback) {
	let dir = resolve(".", start);
	let tmp;
	if (!statSync(dir).isDirectory()) dir = dirname(dir);
	while (true) {
		tmp = callback(dir, readdirSync(dir));
		if (tmp) return resolve(dir, tmp);
		dir = dirname(tmp = dir);
		if (tmp === dir) break;
	}
}
function sortClasses(classStr, { env, ignoreFirst = false, ignoreLast = false, removeDuplicates = true, collapseWhitespace = {
	start: true,
	end: true
} }) {
	if (typeof classStr !== "string" || classStr === "") return classStr;
	if (classStr.includes("{{")) return classStr;
	if (env.options.tailwindPreserveWhitespace) collapseWhitespace = false;
	if (env.options.tailwindPreserveDuplicates) removeDuplicates = false;
	if (collapseWhitespace && /^[\t\r\f\n ]+$/.test(classStr)) return " ";
	let result = "";
	let parts = classStr.split(/([\t\r\f\n ]+)/);
	let classes = parts.filter((_, i) => i % 2 === 0);
	let whitespace = parts.filter((_, i) => i % 2 !== 0);
	if (classes[classes.length - 1] === "") classes.pop();
	if (collapseWhitespace) whitespace = whitespace.map(() => " ");
	let prefix = "";
	if (ignoreFirst) prefix = `${classes.shift() ?? ""}${whitespace.shift() ?? ""}`;
	let suffix = "";
	if (ignoreLast) suffix = `${whitespace.pop() ?? ""}${classes.pop() ?? ""}`;
	let { classList, removedIndices } = sortClassList({
		classList: classes,
		api: env.context,
		removeDuplicates
	});
	whitespace = whitespace.filter((_, index) => !removedIndices.has(index + 1));
	for (let i = 0; i < classList.length; i++) result += `${classList[i]}${whitespace[i] ?? ""}`;
	if (collapseWhitespace) {
		prefix = prefix.replace(/\s+$/g, " ");
		suffix = suffix.replace(/^\s+/g, " ");
		result = result.replace(/^\s+/, collapseWhitespace.start ? "" : " ").replace(/\s+$/, collapseWhitespace.end ? "" : " ");
	}
	return prefix + result + suffix;
}
function sortClassList({ classList, api, removeDuplicates }) {
	let orderedClasses = api.getClassOrder(classList);
	orderedClasses.sort(([nameA, a], [nameZ, z]) => {
		if (nameA === "..." || nameA === "…") return 1;
		if (nameZ === "..." || nameZ === "…") return -1;
		if (a === z) return 0;
		if (a === null) return -1;
		if (z === null) return 1;
		return bigSign(a - z);
	});
	let removedIndices = /* @__PURE__ */ new Set();
	if (removeDuplicates) {
		let seenClasses = /* @__PURE__ */ new Set();
		orderedClasses = orderedClasses.filter(([cls, order], index) => {
			if (seenClasses.has(cls)) {
				removedIndices.add(index);
				return false;
			}
			if (order !== null) seenClasses.add(cls);
			return true;
		});
	}
	return {
		classList: orderedClasses.map(([className]) => className),
		removedIndices
	};
}
export { warn as a, error as i, sortClasses as n, sync_default as r, sortClassList as t };
