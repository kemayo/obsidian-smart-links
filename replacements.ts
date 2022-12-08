// This is mostly broken out for testability

// This is a custom lookbehind which I'm using instead of \b, because I want links
// following non-word characters to be detectable. All patterns will match so long
// as they follow either the start of the string/line or any whitespace character.
const boundary = "(?<=^| |\t|\n)";

export class SmartLinksPattern {
	regexp: RegExp;
	replacement: string;
	constructor(pattern: string, replacement: string) {
		this.regexp = new RegExp(`${boundary}${pattern}`);
		this.replacement = replacement;
	}
    match(text: string) : RegExpMatchArray|null {
        return text.match(this.regexp);
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
