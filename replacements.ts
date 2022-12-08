// This is mostly broken out for testability

export class SmartLinksPattern {
	regexp: RegExp;
	replacement: string;
	constructor(pattern: string, replacement: string) {
		this.regexp = new RegExp(`\\b${pattern}`);
		this.replacement = replacement;
	}
    match(text: string) : RegExpMatchArray|null {
        return text.match(this.regexp);
    }
}

export function parseNextLink(text: string, patterns: SmartLinksPattern[]):
		| { found: false; remaining: string }
		| { found: true; preText: string; link: string; href: string; remaining: string }
{
    let result, href;
    for (let pattern of patterns) {
        result = pattern.match(text);
        if (result) {
            href = result[0].replace(pattern.regexp, pattern.replacement);
            break;
        }
    }
    if (!result || !href) {
        return { found: false, remaining: text };
    }

    const preText = text.slice(0, result.index);
    const link = result[0];
    const remaining = text.slice((result.index ?? 0) + link.length);
    return { found: true, preText, link, href, remaining };
}
