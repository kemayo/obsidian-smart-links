// This is mostly broken out for testability
import { fail } from "assert";

// Note to self: it'd be nice if I could just use a lookbehind pattern as the
// start of my pattern, because then I don't have to make this a multi-stage
// process. Unfortunately WebKit doesn't currently support that, and so iOS
// Obsidian won't work with it.
// WebKit bug for support: https://bugs.webkit.org/show_bug.cgi?id=174931
// Desired code: `(?<=^| |\t|\n)` + making the match function simpler.

interface SmartLinkParsed {
	preText: string;
	renderFn: (el: Element) => Element;
	trigger: string;
	rendered: string;
	href: string;
	remaining: string;
}

export class SmartLinksPattern {
	boundary: RegExp = /(^| |\t|\n)$/;

	regexp: RegExp;
	hrefUri: string;
	hrefText: string;

	constructor(pattern: string, hrefUri: string, hrefText: string) {
		this.regexp = new RegExp(pattern);
		this.hrefUri = hrefUri;
		this.hrefText = hrefText;
	}

	match(text: string) : RegExpMatchArray|null {
		const match = text.match(this.regexp);
		if (match) {
			// Because of the above-mentioned lookbehind issue we're doing a
			// second check here, as a manual lookbehind.
			const preceding = text.charAt((match.index ?? 0) - 1);
			if (preceding.match(this.boundary)) {
				return match;
			}
		}
		return null;
	}

	el(el: Element, rendered: string, href: string): Element {
		const elRaw = {
			cls: "external-link",
			href,
			text: this.hrefText,
			attr: {
				"aria-label": href,
				"aria-label-position": "top",
				rel: "noopener",
				target: "_blank",
			}
		};
		
		const matched = rendered.match(/(.*)\{(.+)\}(.*)/);
		if (!matched) return el.createEl("a", elRaw);

		const ins = el.createEl("ins");
		const [lPad, active, rPad] = matched.slice(1).map(token => token.replace(this.regexp, this.hrefUri));

		if (lPad.length > 0) ins.appendText(lPad);
		elRaw.text = active;
		ins.appendChild(el.createEl("a", elRaw));
		if (rPad.length > 0) ins.appendText(rPad);

		return ins;
	}

	parse(text: string): SmartLinkParsed {
		const result = this.match(text);
		if (!result) throw new Error(`InternalError: ${text} is incompatible with ${this.regexp}`);
		
		const href = result[0].replace(this.regexp, this.hrefUri);
		if (!href) throw new Error('InternalError: Unexpectedly received nothing in `hrefUri`');

		const rendered = result[0].replace(this.regexp, this.hrefText);
		if (!rendered) throw new Error('InternalError: Unexpectedly received nothing in `hrefText`');

		const preText = text.slice(0, result.index);
		const trigger = result[0];
		const remaining = text.slice((result.index ?? 0) + trigger.length);

		return {
			preText: preText,
			renderFn: (e: Element) => this.el(e, rendered, href),
			trigger: trigger,
			rendered: rendered,
			href: href,
			remaining: remaining,
		};
	}
}