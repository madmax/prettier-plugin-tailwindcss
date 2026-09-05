import type { TestEntry } from './utils.js'
import { no, t, yes } from './utils.js'

let html: TestEntry[] = [
  t`<div class="${yes}"></div>`,
  t`<!-- <div class="${no}"></div> -->`,
  t`<div class="${no} {{ 'p-0 sm:p-0 m-0' }}"></div>`,
  t`<div not-class="${no}"></div>`,
  ['<div class="  sm:p-0   p-0 "></div>', '<div class="p-0 sm:p-0"></div>'],
  t`<div class></div>`,
  t`<div class=""></div>`,
  // Ensure duplicate classes are removed
  ['<div class="sm:p-0 p-0 p-0"></div>', '<div class="p-0 sm:p-0"></div>'],
  // Duplicates are not removed for unknown classes
  [
    '<div class="idonotexist sm:p-0 p-0 idonotexist p-0 idonotexist"></div>',
    '<div class="idonotexist idonotexist idonotexist p-0 sm:p-0"></div>',
  ],
  // Ensure duplicate can be kept
  [
    '<div class="sm:p-0 p-0 p-0"></div>',
    '<div class="p-0 p-0 sm:p-0"></div>',
    {
      tailwindPreserveDuplicates: true,
    },
  ],

  // … is moved to the end of the list
  ['<div class="... sm:p-0 p-0"></div>', '<div class="p-0 sm:p-0 ..."></div>'],
  ['<div class="… sm:p-0 p-0"></div>', '<div class="p-0 sm:p-0 …"></div>'],
  ['<div class="sm:p-0 ... p-0"></div>', '<div class="p-0 sm:p-0 ..."></div>'],
  ['<div class="sm:p-0 … p-0"></div>', '<div class="p-0 sm:p-0 …"></div>'],
  ['<div class="sm:p-0 p-0 ..."></div>', '<div class="p-0 sm:p-0 ..."></div>'],
  ['<div class="sm:p-0 p-0 …"></div>', '<div class="p-0 sm:p-0 …"></div>'],
]

let css: TestEntry[] = [
  t`@apply ${yes};`,
  t`/* @apply ${no}; */`,
  t`@not-apply ${no};`,
  ['@apply sm:p-0\n   p-0;', '@apply p-0\n   sm:p-0;', { tailwindPreserveWhitespace: true }],

  // Quote conversion for custom at-rules
  [`@import "./file.css";`, `@import './file.css';`],
  [`@plugin "./file.js";`, `@plugin './file.js';`],
  [`@config "./file.js";`, `@config './file.js';`],
  [`@source "./file.js";`, `@source './file.js';`],
  [`@source not "./file.js";`, `@source not './file.js';`],
  [`@source inline("flex");`, `@source inline('flex');`],

  [
    `@import "tailwindcss";\n\n@import "./theme.css";\n\n@source "./file.js";\n\n.foo {\n  color: red;\n}`,
    `@import 'tailwindcss';\n\n@import './theme.css';\n\n@source './file.js';\n\n.foo {\n  color: red;\n}`,
  ],
  [
    `@import "tailwindcss";\n\n@import "./theme.css";\n\n@plugin "./file.js";\n\n.foo {\n  color: red;\n}`,
    `@import 'tailwindcss';\n\n@import './theme.css';\n\n@plugin './file.js';\n\n.foo {\n  color: red;\n}`,
  ],
  [
    `@import "tailwindcss";\n\n@import "./theme.css";\n\n@config "./file.js";\n\n.foo {\n  color: red;\n}`,
    `@import 'tailwindcss';\n\n@import './theme.css';\n\n@config './file.js';\n\n.foo {\n  color: red;\n}`,
  ],
]

export let javascript: TestEntry[] = [
  t`;<div class="${yes}" />`,
  t`;<div ns:class="${no}" />`,
  t`/* <div class="${no}" /> */`,
  t`// <div class="${no}" />`,
  t`;<div not-class="${no}" />`,
  t`;<div class={\`${yes}\`} />`,
  t`;<div class={\`${yes} \${'${yes}'} \${'${yes}' ? '${yes}' : '${yes}'}\`} />`,
  t`;<div class={'${yes}'} />`,
  t`;<div class={'${yes}' + '${yes}'} />`,
  t`;<div class={'${yes}' ? '${yes}' + '${yes}' : '${yes}'} />`,
  t`;<div class={clsx('${yes}', ['${yes}'])} />`,
  t`;<div class={clsx({ '${yes}': '${yes}' })} />`,
  t`;<div class={{ '${yes}': '${yes}' }['${yes}']} />`,
  t`;<div class />`,
  t`;<div class="" />`,
  [
    `;<div class={\`sm:block inline flex\${someVar}\`} />`,
    `;<div class={\`inline sm:block flex\${someVar}\`} />`,
  ],
  [
    `;<div class={\`\${someVar}sm:block md:inline flex\`} />`,
    `;<div class={\`\${someVar}sm:block flex md:inline\`} />`,
  ],
  [
    `;<div class={\`sm:p-0 p-0 \${someVar}sm:block md:inline flex\`} />`,
    `;<div class={\`p-0 sm:p-0 \${someVar}sm:block flex md:inline\`} />`,
  ],
  [`;<div class="block px-1\u3000py-2" />`, `;<div class="px-1\u3000py-2 block" />`],

  // Whitespace is normalized and duplicates are removed
  [';<div class="   m-0  sm:p-0  p-0   " />', ';<div class="m-0 p-0 sm:p-0" />'],
  [";<div class={'   m-0  sm:p-0  p-0   '} />", ";<div class={'m-0 p-0 sm:p-0'} />"],
  [';<div class={` sm:p-0\n  p-0   `} />', ';<div class={`p-0 sm:p-0`} />'],
  [';<div class="flex flex" />', ';<div class="flex" />'],
  [';<div class={`   flex  flex `} />', ';<div class={`flex`} />'],
  [
    ';<div class={`   flex  flex flex${someVar}block block`} />',
    ';<div class={`flex flex${someVar}block block`} />',
  ],
  [';<div class={`flex ` + `text-red-500`} />', ';<div class={`flex ` + `text-red-500`} />'],
  [
    ';<div class={`flex ` + `  ` + `text-red-500`} />',
    ';<div class={`flex ` + ` ` + `text-red-500`} />',
  ],

  t`;<div class={"before:content-['\\\\2248']"} />`,
  t`;<div class={\`before:content-['\\\\2248']\`} />`,
  t`;<div class="before:content-['\\\\2248']" />`,

  [
    `;<div class={'object-cover' + (standalone ? ' aspect-square w-full' : ' min-h-0 grow basis-0')}></div>`,
    `;<div class={'object-cover' + (standalone ? ' aspect-square w-full' : ' min-h-0 grow basis-0')}></div>`,
  ],
  [
    `;<div class="[&>.a\\_p]:after:content-['\\2'] [&>.a\\_p]:z-0"></div>`,
    `;<div class="[&>.a\\_p]:z-0 [&>.a\\_p]:after:content-['\\2']"></div>`,
  ],
]
javascript = javascript.concat(
  javascript.map((test) => [
    test[0].replace(/class/g, 'className'),
    test[1].replace(/class/g, 'className'),
    test[2],
  ]),
)

let vue: TestEntry[] = [
  ...html,
  t`<div :class="'${yes}'"></div>`,
  t`<!-- <div :class="'${no}'"></div> -->`,
  t`<div :class></div>`,
  t`<div :class=""></div>`,
  t`<div :class="'${yes}' + '${yes}'"></div>`,
  t`<div :class="['${yes}', '${yes}']"></div>`,
  t`<div :class="[cond ? '${yes}' : '${yes}']"></div>`,
  t`<div :class="[someVar ?? '${yes}']"></div>`,
  t`<div :class="{ '${yes}': true }"></div>`,
  t`<div :class="clsx('${yes}')"></div>`,
  t`<div :class="\`${yes}\`"></div>`,
  t`<div :class="\`${yes} \${someVar}\`"></div>`,
  t`<div :class="someVar! ? \`${yes}\` : \`${yes}\`"></div>`, // ts
  t`<div :class="someVar ? someFunc(someVar as string) + '${yes}' : ''"></div>`, // ts
  [
    `<div :class="\`sm:block inline flex\${someVar}\`"></div>`,
    `<div :class="\`inline sm:block flex\${someVar}\`"></div>`,
  ],
  [
    `<div :class="\`\${someVar}sm:block md:inline flex\`"></div>`,
    `<div :class="\`\${someVar}sm:block flex md:inline\`"></div>`,
  ],
  [
    `<div :class="\`sm:p-0 p-0 \${someVar}sm:block md:inline flex\`"></div>`,
    `<div :class="\`p-0 sm:p-0 \${someVar}sm:block flex md:inline\`"></div>`,
  ],

  [`<div :class="'   flex  flex '"></div>`, `<div :class="'flex'"></div>`],
  [`<div :class="\`   flex  flex \`"></div>`, `<div :class="\`flex\`"></div>`],
  [`<div :class="' flex ' + ' underline '"></div>`, `<div :class="'flex ' + ' underline'"></div>`],
  [
    `<div :class="' sm:p-5 ' + ' flex ' + ' underline ' + ' sm:m-5 '"></div>`,
    `<div :class="'sm:p-5 ' + ' flex' + ' underline' + ' sm:m-5'"></div>`,
  ],

  [
    `<div :class="'before:content-[\\'\\\\2248\\']'" />`,
    `<div :class="'before:content-[\\'\\\\2248\\']'" />`,
  ],
]

let glimmer: TestEntry[] = [
  t`<div class='${yes}'></div>`,
  t`<!-- <div class='${no}'></div> -->`,
  t`<div class='${yes} {{"${yes}"}}'></div>`,
  t`<div class='${yes} {{"${yes}"}} ${yes}'></div>`,
  t`<div class='${yes} {{"${yes}"}} {{if someVar "${yes}" "${yes}"}}'></div>`,
  t`<div class='${yes} {{"${yes}"}} {{if someVar "${yes}" "${yes}"}}' {{if someVar "attr='${no}'" "attr='${no}'"}}></div>`,
  [
    `<div class='md:inline flex sm:block{{someVar}}'></div>`,
    `<div class='flex md:inline sm:block{{someVar}}'></div>`,
  ],
  [
    `<div class='sm:p-0 p-0 {{someVar}}sm:block md:inline flex'></div>`,
    `<div class='p-0 sm:p-0 {{someVar}}sm:block flex md:inline'></div>`,
  ],
  t`<div not-class='${no}'></div>`,
  ["<div class='  sm:p-0   p-0 '></div>", "<div class='p-0 sm:p-0'></div>"],
  t`<div class></div>`,
  t`<div class=''></div>`,
  t`{{link 'Some page' href=person.url class='${no}'}}`,
  t`<div class='{{if @isTrue (concat "border-l-4 border-" @borderColor)}}'></div>`,
  [
    `<div class='{{if @isTrue (concat "border-l-4 border-x-4 border-" @borderColor)}}'></div>`,
    `<div class='{{if @isTrue (concat "border-x-4 border-l-4 border-" @borderColor)}}'></div>`,
  ],
  [
    `<div class='{{if @isTrue (concat "border-l-4 border " @borderColor)}}'></div>`,
    `<div class='{{if @isTrue (concat "border border-l-4 " @borderColor)}}'></div>`,
  ],
  [
    `<div class='{{if @isTrue (nope "border-l-4 border-" @borderColor)}}'></div>`,
    `<div class='{{if @isTrue (nope "border- border-l-4" @borderColor)}}'></div>`,
  ],

  [`<div class='flex  flex '></div>`, `<div class='flex'></div>`],

  [
    `<div class='sm:p-0   p-0  p-0 {{someVar}}sm:block flex md:inline   flex '></div>`,
    `<div class='p-0 sm:p-0 {{someVar}}sm:block flex md:inline'></div>`,
  ],
]

let htmlErb: TestEntry[] = [
  ['<div class="sm:p-0 p-0"></div>', '<div class="p-0 sm:p-0"></div>'],
  ['<div CLASS = "sm:p-0 p-0"></div>', '<div CLASS = "p-0 sm:p-0"></div>'],
  ["<div class='sm:p-0 p-0'></div>", "<div class='p-0 sm:p-0'></div>"],
  ['<div class="  sm:p-0   p-0 "></div>', '<div class="p-0 sm:p-0"></div>'],
  ['<div class="sm:p-0 p-0 p-0"></div>', '<div class="p-0 sm:p-0"></div>'],
  [
    `<div class="sm:p-0
p-0"></div>`,
    '<div class="p-0 sm:p-0"></div>',
  ],

  ['<%= tag class: "sm:p-0 p-0" %>', '<%= tag class: "p-0 sm:p-0" %>'],
  ["<%= tag class: 'sm:p-0 p-0' %>", "<%= tag class: 'p-0 sm:p-0' %>"],
  ['<%= tag class: "sm:p-0 p-0 bg-[#FFF]" %>', '<%= tag class: "bg-[#FFF] p-0 sm:p-0" %>'],
  ['<%- tag class: "sm:p-0 p-0" -%>', '<%- tag class: "p-0 sm:p-0" -%>'],
  ['<%= tag class: "sm:p-0 p-0", id: "x" %>', '<%= tag class: "p-0 sm:p-0", id: "x" %>'],
  ['<%= tag class: "sm:p-0 p-0" do %>', '<%= tag class: "p-0 sm:p-0" do %>'],
  ['<%= tag class: "sm:p-0 p-0" do |x| %>', '<%= tag class: "p-0 sm:p-0" do |x| %>'],
  ['<%= tag class: "sm:p-0 p-0" end %>', '<%= tag class: "p-0 sm:p-0" end %>'],
  ['<%= tag class: "sm:p-0 p-0" # note %>', '<%= tag class: "p-0 sm:p-0" # note %>'],
  ['<%= tag(class: "sm:p-0 p-0") %>', '<%= tag(class: "p-0 sm:p-0") %>'],

  // Interpolation and complex Ruby expressions stay unchanged
  ['<%= tag class: "sm:p-0 p-0 #{"m-1"}" %>', '<%= tag class: "sm:p-0 p-0 #{"m-1"}" %>'],
  ['<%= tag class: "sm:p-0 p-0 #{foo}" %>', '<%= tag class: "sm:p-0 p-0 #{foo}" %>'],
  ['<%= tag class: foo ? "sm:p-0 p-0" : "m-0" %>', '<%= tag class: foo ? "sm:p-0 p-0" : "m-0" %>'],
  ['<%= tag class: "sm:p-0 p-0" + extra %>', '<%= tag class: "sm:p-0 p-0" + extra %>'],
  ['<%= tag class: ("sm:p-0 p-0") %>', '<%= tag class: ("sm:p-0 p-0") %>'],
  ['<%= tag class: class_names("sm:p-0 p-0") %>', '<%= tag class: class_names("sm:p-0 p-0") %>'],

  // Same-quote ERB inside HTML class values must not truncate/corrupt
  ['<div class="sm:p-0 p-0 <%= "m-2" %>"></div>', '<div class="p-0 sm:p-0 <%= "m-2" %>"></div>'],
  ['<div class="<%= foo ? "sm:p-0 p-0" : "m-0" %>"></div>', '<div class="<%= foo ? "sm:p-0 p-0" : "m-0" %>"></div>'],
  ['<div class="<%= class_names("sm:p-0 p-0") %>"></div>', '<div class="<%= class_names("sm:p-0 p-0") %>"></div>'],
  ['<div class="<%= dom_id(@user, "prefix") %>"></div>', '<div class="<%= dom_id(@user, "prefix") %>"></div>'],
  [
    '<div class="sm:p-0 p-0 <%= foo ? "m-2" : "m-4" %> flex inline"></div>',
    '<div class="p-0 sm:p-0 <%= foo ? "m-2" : "m-4" %> flex inline"></div>',
  ],

  // Static segments around multiple ERB blocks sort independently
  [
    '<div class="sm:p-0 p-0 <%= a %> sm:m-0 m-0 <%= b %> sm:flex flex"></div>',
    '<div class="p-0 sm:p-0 <%= a %> m-0 sm:m-0 <%= b %> flex sm:flex"></div>',
  ],
  ['<div class="sm:p-0   p-0 <%= x %>  flex"></div>', '<div class="p-0   sm:p-0 <%= x %>  flex"></div>'],
  [
    `<div class="sm:p-0
p-0 <%= x %>"></div>`,
    `<div class="p-0
sm:p-0 <%= x %>"></div>`,
  ],
  ['<div class=\'sm:p-0 p-0 <%= "m-2" %>\'></div>', '<div class=\'p-0 sm:p-0 <%= "m-2" %>\'></div>'],

  // All complete ERB forms are preserved byte-for-byte
  ['<div class="sm:p-0 p-0 <%= x %>"></div>', '<div class="p-0 sm:p-0 <%= x %>"></div>'],
  ['<div class="sm:p-0 p-0 <%- x %>"></div>', '<div class="p-0 sm:p-0 <%- x %>"></div>'],
  ['<div class="sm:p-0 p-0 <% x %>"></div>', '<div class="p-0 sm:p-0 <% x %>"></div>'],
  ['<div class="sm:p-0 p-0 <%# x %>"></div>', '<div class="p-0 sm:p-0 <%# x %>"></div>'],
  ['<div class="sm:p-0 p-0 <%= x -%>"></div>', '<div class="p-0 sm:p-0 <%= x -%>"></div>'],
  ['<div class="sm:p-0 p-0 <%- x -%>"></div>', '<div class="p-0 sm:p-0 <%- x -%>"></div>'],

  // Partial tokens adjacent to ERB are left in place
  ['<div class="sm:p-0 p-0 flex<%= x %>"></div>', '<div class="p-0 sm:p-0 flex<%= x %>"></div>'],
  ['<div class="foo<%= x %>sm:p-0 p-0"></div>', '<div class="foo<%= x %>sm:p-0 p-0"></div>'],

  // No cross-boundary duplicate removal
  ['<div class="p-0 sm:p-0 <%= x %> p-0 sm:p-0"></div>', '<div class="p-0 sm:p-0 <%= x %> p-0 sm:p-0"></div>'],

  // Entities and opposite quotes inside class values
  ['<div class="sm:p-0 p-0 foo&#34;bar"></div>', '<div class="foo&#34;bar p-0 sm:p-0"></div>'],
  [`<div class="sm:p-0 p-0 before:content-['hi']"></div>`, `<div class="p-0 before:content-['hi'] sm:p-0"></div>`],

  // Negative HTML lexical contexts
  t`<div data-class="${no}"></div>`,
  t`<div not-class="${no}"></div>`,
  t`<div className="${no}"></div>`,
  t`<div :class="${no}"></div>`,
  t`<div title="class='${no}'"></div>`,
  t`<!-- <div class="${no}"></div> -->`,
  t`<!DOCTYPE html class="${no}">`,
  t`</div class="${no}">`,
  t`<script><div class="${no}"></div></script>`,
  t`<style><div class="${no}"></div></style>`,
  t`<textarea><div class="${no}"></div></textarea>`,
  t`<title><div class="${no}"></div></title>`,
  t`<iframe><div class="${no}"></div></iframe>`,
  t`<xmp><div class="${no}"></div></xmp>`,
  t`<%= '<div class="${no}"></div>' %>`,
  t`<% if true %><div class="${yes}"></div><% end %>`,
  t`<%= tag superclass: "${no}" %>`,

  // Malformed / incomplete constructs are preserved
  ['<div class="sm:p-0 p-0>', '<div class="sm:p-0 p-0>'],
  ['<div class="sm:p-0 p-0 <%= foo">', '<div class="sm:p-0 p-0 <%= foo">'],
  ['<% tag class: "sm:p-0 p-0"', '<% tag class: "sm:p-0 p-0"'],
  ['<div class="sm:p-0 p-0', '<div class="sm:p-0 p-0'],
  ['<%# tag class: "sm:p-0 p-0" %>', '<%# tag class: "sm:p-0 p-0" %>'],

  // ERB inside start tags / attribute values is opaque (no Ruby class pass)
  [
    '<div data-value="<%= tag class: "sm:p-0 p-0" %>"></div>',
    '<div data-value="<%= tag class: "sm:p-0 p-0" %>"></div>',
  ],
  ['<div data-value=<%= tag class: "sm:p-0 p-0" %>></div>', '<div data-value=<%= tag class: "sm:p-0 p-0" %>></div>'],
  ['<div <%= attributes(class: "sm:p-0 p-0") %>></div>', '<div <%= attributes(class: "sm:p-0 p-0") %>></div>'],

  // Unsupported Ruby lexical syntax fails the whole ERB block closed
  ['<%= /class: "sm:p-0 p-0",/ %>', '<%= /class: "sm:p-0 p-0",/ %>'],
  ['<%= %q(class: "sm:p-0 p-0",) %>', '<%= %q(class: "sm:p-0 p-0",) %>'],
  ['<%= `class: "sm:p-0 p-0"` %>', '<%= `class: "sm:p-0 p-0"` %>'],
  ['<%= <<~HTML\nclass: "sm:p-0 p-0"\nHTML\n%>', '<%= <<~HTML\nclass: "sm:p-0 p-0"\nHTML\n%>'],
  ['<%\n=begin\nclass: "sm:p-0 p-0"\n=end\n%>', '<%\n=begin\nclass: "sm:p-0 p-0"\n=end\n%>'],
  ['<%%= tag class: "sm:p-0 p-0" %>', '<%%= tag class: "sm:p-0 p-0" %>'],
  ['<%= "class: sm:p-0 p-0" %>', '<%= "class: sm:p-0 p-0" %>'],
  ['<%= tag class: "sm:p-0 p-0 #@foo" %>', '<%= tag class: "sm:p-0 p-0 #@foo" %>'],
  ['<%= tag class: "sm:p-0 p-0 #@@foo" %>', '<%= tag class: "sm:p-0 p-0 #@@foo" %>'],
  ['<%= tag class: "sm:p-0 p-0 #$foo" %>', '<%= tag class: "sm:p-0 p-0 #$foo" %>'],
  ['<%= tag class: "sm:p-0 p-0 \\"foo\\"" %>', '<%= tag class: "sm:p-0 p-0 \\"foo\\"" %>'],
  ['<%= tag class: "sm:p-0\\ p-0" %>', '<%= tag class: "sm:p-0\\ p-0" %>'],
  ['<%= tag class: "sm:p-0 p-0\\\nflex" %>', '<%= tag class: "sm:p-0 p-0\\\nflex" %>'],

  // Unquoted attributes: slash is content; invalid quote/`=`/`<` fail the start tag
  ['<img src=/assets/foo/bar class="sm:p-0 p-0">', '<img src=/assets/foo/bar class="p-0 sm:p-0">'],
  ['<div data-url=/assets/class="sm:p-0 p-0"></div>', '<div data-url=/assets/class="sm:p-0 p-0"></div>'],
  ['<div data=<%= x %>class="sm:p-0 p-0"></div>', '<div data=<%= x %>class="sm:p-0 p-0"></div>'],
  ['<div class="sm:p-0 p-0><span class="m-0 p-0"></span>', '<div class="sm:p-0 p-0><span class="m-0 p-0"></span>'],

  // CDATA and raw/RCDATA bodies, including /> and uppercase close
  [
    '<![CDATA[<div class="sm:p-0 p-0">]]><div class="sm:p-0 p-0"></div>',
    '<![CDATA[<div class="sm:p-0 p-0">]]><div class="p-0 sm:p-0"></div>',
  ],
  ['<script><div class="sm:p-0 p-0"></div></SCRIPT>', '<script><div class="sm:p-0 p-0"></div></SCRIPT>'],
  ['<script/><div class="sm:p-0 p-0"></div>', '<script/><div class="sm:p-0 p-0"></div>'],
  ['<script><div class="sm:p-0 p-0"></div>', '<script><div class="sm:p-0 p-0"></div>'],
  ['<plaintext><div class="sm:p-0 p-0"></div>', '<plaintext><div class="sm:p-0 p-0"></div>'],

  // Representative fdb shapes
  [
    '<div class="attachment--<%= foo ? "sm:p-0 p-0" : "m-0" %> attachment--<%= bar ? "flex inline" : "block" %>"></div>',
    '<div class="attachment--<%= foo ? "sm:p-0 p-0" : "m-0" %> attachment--<%= bar ? "flex inline" : "block" %>"></div>',
  ],
  [
    '<div class="<%= dom_id(@user, "prefix") %> sm:p-0 p-0 sm:m-0 m-0 sm:flex flex"></div>',
    '<div class="<%= dom_id(@user, "prefix") %> m-0 flex p-0 sm:m-0 sm:flex sm:p-0"></div>',
  ],
  [
    `<div
  class="sm:p-0 p-0 <%= foo ? "m-2" : "m-4" %>"
>`,
    `<div
  class="p-0 sm:p-0 <%= foo ? "m-2" : "m-4" %>"
>`,
  ],
  ['<div class="sm:p-0\r\np-0"></div>', '<div class="p-0 sm:p-0"></div>'],
]

export let tests: Record<string, TestEntry[]> = {
  html,
  glimmer,
  lwc: html,
  vue: [
    //
    ...vue,
    t`<div :class="\`${yes} \${someVar} ${yes} \${'${yes}'}\`"></div>`,
  ],
  angular: [
    ...html,
    t`<div [ngClass]="'${yes}'"></div>`,
    t`<!-- <div [ngClass]="'${no}'"></div> -->`,
    t`<div [ngClass]></div>`,
    t`<div [ngClass]=""></div>`,
    t`<div [ngClass]="'${yes}' + '${yes}'"></div>`,
    t`<div [ngClass]="['${yes}', '${yes}']"></div>`,
    t`<div [ngClass]="[cond ? '${yes}' : '${yes}']"></div>`,
    t`<div [ngClass]="[someVar ?? '${yes}']"></div>`,
    t`<div [ngClass]="{ '${yes}': true }"></div>`,
    t`<div [ngClass]="clsx('${yes}')"></div>`,
    t`<div [ngClass]="{ '${yes}': (some.thing | urlPipe: { option: true } | async), '${yes}': true }"></div>`,
    t`<div [ngClass]="{ '${yes}': foo && bar?.['baz'] }" class="${yes}"></div>`,

    [
      `<div [ngClass]="' flex ' + ' italic      underline ' + ' block '"></div>`,
      `<div [ngClass]="'flex ' + ' italic underline ' + ' block'"></div>`,
    ],

    // TODO: Enable this test — it causes console noise but not a failure
    // t`<div [ngClass]="{ '${no}': foo && definitely&a:syntax*error }" class="${yes}"></div>`,

    t`<div [ngClass]="\`${yes}\`"></div>`,
  ],
  css: [
    //
    ...css,
    t`@apply ${yes} !important;`,
  ],
  scss: [
    ...css,
    t`@apply ${yes} #{!important};`,
    t`@apply ${yes} #{'!important'};`,
    t`@apply ${yes} #{"!important"};`,

    // These shouldn't ever be used but they are valid
    // syntax so we might as well not break them
    t`@apply ${yes} #{""!important""};`,
    t`@apply ${yes} #{'''!important'''};`,
    t`@apply ${yes} #{"'"'"!important"'"'"};`,
  ],
  less: [
    //
    ...css,
    t`@apply ${yes} !important;`,
    t`@apply ~"${yes}";`,
    t`@apply ~'${yes}';`,
  ],
  babel: javascript,
  typescript: javascript,
  'babel-ts': javascript,
  flow: javascript,
  'babel-flow': javascript,
  acorn: javascript,
  meriyah: javascript,
  'html-erb': htmlErb,
  mdx: javascript
    .filter((test) => !test[0].startsWith('/*') && !test[1].startsWith('/*'))
    .map((test) => [test[0].replace(/^;/, ''), test[1].replace(/^;/, ''), test[2]]),
}
