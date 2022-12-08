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
    expect(parseNextLink("TICKET1234", patterns)).toStrictEqual({
        found: false,
        remaining: "TICKET1234",
    });
});
