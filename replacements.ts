// This is mostly broken out for testability

// Note to self: it'd be nice if I could just use a lookbehind pattern as the
// start of my pattern, because then I don't have to make this a multi-stage
// process. Unfortunately WebKit doesn't currently support that, and so iOS
// Obsidian won't work with it.
// WebKit bug for support: https://bugs.webkit.org/show_bug.cgi?id=174931
// Desired code: `(?<=^| |\t|\n)` + making the match function simpler.

export class SmartLinksPattern {
    boundary: RegExp = /(^| |\t|\n)$/;

	regexp: RegExp;
    replacement: string;
	constructor(pattern: string, replacement: string) {
		this.regexp = new RegExp(pattern);
    	this.replacement = replacement;
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
}

export function parseNextLink(text: string, pattern: SmartLinksPattern):
		| { found: false; remaining: string }
		| { found: true; preText: string; link: string; href: string; remaining: string }
{
    let result, href;
    result = pattern.match(text);
    if (result) {
        href = result[0].replace(pattern.regexp, pattern.replacement);
    }
    if (!result || !href) {
        return { found: false, remaining: text };
    }

    const preText = text.slice(0, result.index);
    const link = result[0];
    const remaining = text.slice((result.index ?? 0) + link.length);
    return { found: true, preText, link, href, remaining };
}
