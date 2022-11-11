# Obsidian Smart Links

This is a plugin for [Obsidian](https://obsidian.md) that lets you define custom "smart" links which will be auto-linked when reading documents.

If you're used to writing in an environment that auto-links certain strings and don't want to build new habits, this will help with that. E.g. `T12345` in phabricator, or `#4324` in github.

## Usage

Install and enable the plugin. Once you do, you'll find there's a new section in your settings called "Smart Links". In it you can add/remove replacement rules. You'll need to write a regular expression and a replacement string for it. This can range from very simple to very complicated.

| Regular expression | Replacement                             |
|--------------------|-----------------------------------------|
| `T(\d+)`           | `https://phabricator.wikimedia.org/T$1` |
| `(?:AAPL\|GOOG)`   | `https://finance.yahoo.com/quote/$&`    |
| `go\/[_\d\w-/]+`   | `http://$&`                             |

The replacements work using normal Javascript regular expression replacement syntax. I'm so very sorry.

## Credits

The reading-mode code was heavily influenced by [Obsidian GoLinks](https://github.com/xavdid/obsidian-golinks) -- this plugin is (arguably) a customizable superset of that one's functionality.
