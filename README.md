# Obsidian Smart Links

This is a plugin for [Obsidian](https://obsidian.md) that lets you define custom "smart" links which will be auto-linked when editing or reading documents.

If you're used to writing in an environment that auto-links certain strings and don't want to build new habits, this will help with that. E.g. `T12345` in Phabricator, `#4324` in GitHub, or `REF-123` in Jira.

It'll turn this...

![edit mode](https://user-images.githubusercontent.com/2187/206587959-dd4237a7-98ce-43a7-9373-4f4c695d3efe.png)

Into this...

![reading mode](https://user-images.githubusercontent.com/2187/206588016-a13f5b4a-19a7-48ce-bc4b-9cb86bf25e43.png)

![target focus](https://user-images.githubusercontent.com/2187/206588064-da4c6242-a29d-4d36-95d6-0b4fb4979c09.png)

You can add your own replacement patterns in Obsidian's settings:

![settings](https://user-images.githubusercontent.com/2187/206587877-382c293e-8c71-419d-b11b-f2043ff9163b.png)

## Usage

Install and enable the plugin. Once you do, you'll find there's a new section in your settings called "Smart Links". In it you can add/remove replacement rules. You'll need to write a regular expression and a replacement string for it. This can range from very simple to very complicated.

| Regular expression | Replacement                              |
|--------------------|------------------------------------------|
| `T\d+`             | `https://phabricator.wikimedia.org/$&`   |
| `\$([A-Z]+)`       | `https://finance.yahoo.com/quote/$1`     |
| `REF-(\d+)`        | `https://my.atlassian.net/browse/REF-$1` |
| `go\/[_\d\w-/]+`   | `http://$&`                              |

The replacements work using normal Javascript regular expression replacement syntax. I'm so very sorry. Remember that you'll need to escape characters with special meaning in regular expressions. Matches are restricted so they'll only occur immediately after either the start of a line or some whitespace.

## Credits

The reading-mode code was heavily influenced by [Obsidian GoLinks](https://github.com/xavdid/obsidian-golinks) -- this plugin is (arguably) a customizable superset of that one's functionality.

The editing-mode code was made possible by [the documentation on the unofficial Obsidian Plugin Developer Docs site](https://marcus.se.net/obsidian-plugin-docs/) which is maintained by volunteer contributors.
