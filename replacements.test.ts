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

test('parseNextLink basic', () => {
    const pattern = new SmartLinksPattern("T(\\d+)", "https://phabricator.wikimedia.org/T$1");
    expect(parseNextLink("Unrelated text", pattern)).toStrictEqual({found:false, remaining:"Unrelated text"});
    expect(parseNextLink("T1234", pattern)).toStrictEqual({
        found: true,
        preText: "",
        link: "T1234",
        href: "https://phabricator.wikimedia.org/T1234",
        remaining: "",
    });
    expect(parseNextLink(" T1234 ", pattern)).toStrictEqual({
        found: true,
        preText: " ",
        link: "T1234",
        href: "https://phabricator.wikimedia.org/T1234",
        remaining: " ",
    });
    expect(parseNextLink("T1234.", pattern)).toStrictEqual({
        found: true,
        preText: "",
        link: "T1234",
        href: "https://phabricator.wikimedia.org/T1234",
        remaining: ".",
    });
    expect(parseNextLink("Text\nT1234.", pattern)).toStrictEqual({
        found: true,
        preText: "Text\n",
        link: "T1234",
        href: "https://phabricator.wikimedia.org/T1234",
        remaining: ".",
    });
    expect(parseNextLink("TICKET1234", pattern)).toStrictEqual({
        found: false,
        remaining: "TICKET1234",
    });
});
test('parseNextLink non-word', () => {
    const pattern = new SmartLinksPattern("\\$([A-Z]+)", "https://finance.yahoo.com/quote/$1");

    expect(parseNextLink("$GOOG", pattern)).toStrictEqual({
        found: true,
        preText: "",
        link: "$GOOG",
        href: "https://finance.yahoo.com/quote/GOOG",
        remaining: "",
    });
    expect(parseNextLink(" $GOOG ", pattern)).toStrictEqual({
        found: true,
        preText: " ",
        link: "$GOOG",
        href: "https://finance.yahoo.com/quote/GOOG",
        remaining: " ",
    });
});
test('parseNextLink hash', () => {
    const pattern = new SmartLinksPattern("#(\\d+)", "https://github.com/kemayo/obsidian-smart-links/issues/$1");
    expect(parseNextLink("#2", pattern)).toStrictEqual({
        found: true,
        preText: "",
        link: "#2",
        href: "https://github.com/kemayo/obsidian-smart-links/issues/2",
        remaining: "",
    });
    expect(parseNextLink(" #2 ", pattern)).toStrictEqual({
        found: true,
        preText: " ",
        link: "#2",
        href: "https://github.com/kemayo/obsidian-smart-links/issues/2",
        remaining: " ",
    });
});
