import { SmartLinksPattern } from './replacements';

import { describe, expect, test } from '@jest/globals';

// FIXME: How to pass in an Obsidian `Element`?
function testResultPayload(slp: SmartLinksPattern, input: string) {
    const parsed = slp.parse(input);
    return {
        preText: parsed.preText,
        trigger: parsed.trigger,
        href: parsed.href,
        rendered: parsed.rendered,
        remaining: parsed.remaining,
    }
}

test('SmartLinkPattern creation', () => {
    const pattern = new SmartLinksPattern("T(\\d+)", "https://phabricator.wikimedia.org/T$1", "A/{$1}");
    expect(pattern.match("unrelated")).toBeFalsy();
    expect(pattern.match("T1234")).toBeTruthy();
    expect(pattern.match(" T1234 ")).toBeTruthy();
    expect(pattern.match("Foo T1234 Foo")).toBeTruthy();
    expect(pattern.match("FooT1234 Foo")).toBeFalsy();
});

test('SmartLinksPattern BASIC', () => {
    const slp = new SmartLinksPattern("T(\\d+)", "https://phabricator.wikimedia.org/T$1", "B/{$1}");

    expect(testResultPayload(slp, "T1234")).toStrictEqual({
        preText: "",
        trigger: "T1234",
        href: "https://phabricator.wikimedia.org/T1234",
        remaining: "",
        rendered: "B/{1234}",
    });

    expect(testResultPayload(slp, " T1234 ")).toStrictEqual({
        preText: " ",
        trigger: "T1234",
        href: "https://phabricator.wikimedia.org/T1234",
        remaining: " ",
        rendered: "B/{1234}",
    });
    expect(testResultPayload(slp, "T1234.")).toStrictEqual({
        preText: "",
        trigger: "T1234",
        href: "https://phabricator.wikimedia.org/T1234",
        remaining: ".",
        rendered: "B/{1234}",
    });
    expect(testResultPayload(slp, "Text\nT1234.")).toStrictEqual({
        preText: "Text\n",
        trigger: "T1234",
        href: "https://phabricator.wikimedia.org/T1234",
        remaining: ".",
        rendered: "B/{1234}",
    });
});
test('SmartLinksPattern DOLLAR', () => {
    const slp = new SmartLinksPattern("\\$([A-Z]+)", "https://finance.yahoo.com/quote/$1", "C/{$1}");

    expect(testResultPayload(slp, "$GOOG")).toStrictEqual({
        preText: "",
        trigger: "$GOOG",
        href: "https://finance.yahoo.com/quote/GOOG",
        remaining: "",
        rendered: "C/{GOOG}",
    });
    expect(testResultPayload(slp, " $GOOG ")).toStrictEqual({
        preText: " ",
        trigger: "$GOOG",
        href: "https://finance.yahoo.com/quote/GOOG",
        remaining: " ",
        rendered: "C/{GOOG}",
    });
});
test('SmartLinksPattern HASH', () => {
    const slp = new SmartLinksPattern("#(\\d+)", "https://github.com/kemayo/obsidian-smart-links/issues/$1", "D/{$1}");
    expect(testResultPayload(slp, "#2123")).toStrictEqual({
        preText: "",
        trigger: "#2123",
        href: "https://github.com/kemayo/obsidian-smart-links/issues/2123",
        remaining: "",
        rendered: "D/{2123}",
    });
    expect(testResultPayload(slp, " #2123 ")).toStrictEqual({
        preText: " ",
        trigger: "#2123",
        href: "https://github.com/kemayo/obsidian-smart-links/issues/2123",
        remaining: " ",
        rendered: "D/{2123}",
    });
});
test('SmartLinksPattern SLASH', () => {
    const slp = new SmartLinksPattern("(\\w+)@", "https://github.com/$1", "E/{$1/blip}/E");
    expect(testResultPayload(slp, "nima@")).toStrictEqual({
        preText: "",
        trigger: "nima@",
        href: "https://github.com/nima",
        remaining: "",
        rendered: "E/{nima/blip}/E",
    });
});
test('parseNextLink AT', () => {
    const slp = new SmartLinksPattern("([a-z]+)@", "https://github.com/$1", "F/{$1@}/F");
    expect(testResultPayload(slp, "nima@")).toStrictEqual({
        preText: "",
        trigger: "nima@",
        href: "https://github.com/nima",
        remaining: "",
        rendered: "F/{nima@}/F",
    });
});
test('parseNextLink MultiRender', () => {
    const slp = new SmartLinksPattern("([a-z]+)@([A-Z]+)", "https://github.com/$1/$2", "G/$1{active}$2/G");
    expect(testResultPayload(slp, "blip@BLOP")).toStrictEqual({
        preText: "",
        trigger: "blip@BLOP",
        href: "https://github.com/blip/BLOP",
        remaining: "",
        rendered: "G/blip{active}BLOP/G",
    });
});
