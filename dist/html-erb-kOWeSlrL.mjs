import { r as __exportAll } from "./chunk-DYuqS7OD.mjs";
var html_erb_exports = /* @__PURE__ */ __exportAll({
	languages: () => languages,
	parsers: () => parsers,
	printers: () => printers
});
const languages = [{
	name: "html-erb",
	parsers: ["html-erb"],
	extensions: [".html.erb"],
	vscodeLanguageIds: ["erb"]
}];
const parsers = { "html-erb": {
	preprocess: (text) => text,
	parse: (text) => {
		return { text };
	},
	astFormat: "html-erb-text",
	locStart: (node) => node.start ?? 0,
	locEnd: (node) => node.end ?? 0
} };
const printers = { "html-erb-text": { print: (path) => path.getValue().text } };
export { languages as n, html_erb_exports as t };
