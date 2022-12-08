import { SmartLinksPattern, parseNextLink } from './replacements';

import {describe, expect, test} from '@jest/globals';

test('SmartLinkPattern creation', () => {
    const pattern = new SmartLinksPattern("T(\\d+)", "https://phabricator.wikimedia.org/T$1");
    expect(pattern.match("unrelated")).toBeFalsy();
    expect(pattern.match("T1234")).toBeTruthy();
    expect(pattern.match(" T1234 ")).toBeTruthy();
    expect(pattern.match("Foo T1234 Foo")).toBeTruthy();
    expect(pattern.match("FooT1234 Foo")).toBeFalsy();
});

test('parseNextLink', () => {
    const patterns = [
        new SmartLinksPattern("T(\\d+)", "https://phabricator.wikimedia.org/T$1"),
        new SmartLinksPattern("\\$([A-Z]+)", "https://finance.yahoo.com/quote/$1"),
        new SmartLinksPattern("#(\\d+)", "https://github.com/kemayo/obsidian-smart-links/issues/$1"),
    ];
    expect(parseNextLink("Unrelated text", patterns)).toStrictEqual({found:false, remaining:"Unrelated text"});
    expect(parseNextLink("T1234", patterns)).toStrictEqual({
        found: true,
        preText: "",
        link: "T1234",
        href: "https://phabricator.wikimedia.org/T1234",
        remaining: "",
    });
    expect(parseNextLink(" T1234 ", patterns)).toStrictEqual({
        found: true,
        preText: " ",
        link: "T1234",
        href: "https://phabricator.wikimedia.org/T1234",
        remaining: " ",
    });
    expect(parseNextLink("T1234.", patterns)).toStrictEqual({
        found: true,
        preText: "",
        link: "T1234",
        href: "https://phabricator.wikimedia.org/T1234",
        remaining: ".",
    });
    expect(parseNextLink("Text\nT1234.", patterns)).toStrictEqual({
        found: true,
        preText: "Text\n",
        link: "T1234",
        href: "https://phabricator.wikimedia.org/T1234",
        remaining: ".",
    });
    expect(parseNextLink("TICKET1234", patterns)).toStrictEqual({
        found: false,
        remaining: "TICKET1234",
    });
    expect(parseNextLink("$GOOG", patterns)).toStrictEqual({
        found: true,
        preText: "",
        link: "$GOOG",
        href: "https://finance.yahoo.com/quote/GOOG",
        remaining: "",
    });
    expect(parseNextLink(" $GOOG ", patterns)).toStrictEqual({
        found: true,
        preText: " ",
        link: "$GOOG",
        href: "https://finance.yahoo.com/quote/GOOG",
        remaining: " ",
    });
    expect(parseNextLink("#2", patterns)).toStrictEqual({
        found: true,
        preText: "",
        link: "#2",
        href: "https://github.com/kemayo/obsidian-smart-links/issues/2",
        remaining: "",
    });
    expect(parseNextLink(" #2 ", patterns)).toStrictEqual({
        found: true,
        preText: " ",
        link: "#2",
        href: "https://github.com/kemayo/obsidian-smart-links/issues/2",
        remaining: " ",
    });
});
