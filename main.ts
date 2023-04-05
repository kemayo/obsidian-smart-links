import { App, Editor, MarkdownRenderChild, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

import { SmartLinksPattern, parseNextLink, createLinkTag, LinkPlugin } from 'replacements';

import {
	ViewPlugin,
} from "@codemirror/view";

interface SmartLinksSettings {
	patterns: [{regexp: string, replacement: string}];
}

const DEFAULT_SETTINGS: SmartLinksSettings = {
	patterns: [
		{regexp: 'T(\\d+)', replacement: 'https://phabricator.wikimedia.org/T$1'},
	],
}

const isTextNodeMatchingLinkPatterns = (n: Node, ps: SmartLinksPattern[]): boolean => {
	if (n.nodeType !== n.TEXT_NODE) {
		return false;
	}
	for (const pattern of ps) {
		if (n.textContent && pattern.match(n.textContent)) {
			return true;
		}
	}
	return false;
}

export default class SmartLinks extends Plugin {
	settings: SmartLinksSettings;
	patterns: SmartLinksPattern[] = [];

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SmartLinksSettingTab(this.app, this));

		this.registerMarkdownPostProcessor((element, context) => {
			element.querySelectorAll("p, li").forEach((el) => {
				if (this.anyReplacableNodes(el)) {
					context.addChild(new SmartLinkContainer(el as HTMLElement, this));
				}
			})
		})

		this.registerEditorExtension(
			ViewPlugin.define<LinkPlugin>(
				(view) => new LinkPlugin(view, this),
				{
					decorations: (value: LinkPlugin) => value.decorations,
				}
			),
		)
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		this.rebuildPatterns();
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.rebuildPatterns();
	}

	rebuildPatterns() {
		this.patterns = [];
		this.settings.patterns.forEach((pattern) => {
			try {
				this.patterns.push(new SmartLinksPattern(pattern.regexp, pattern.replacement));
			} catch (e) {
				// it's a user-input regex; I just want to avoid it outright dying here
			}
		})
	}

	anyReplacableNodes = (el: Element): boolean => {
		for (let i = 0; i < el.childNodes.length; i++) {
			const child = el.childNodes[i];
			if (isTextNodeMatchingLinkPatterns(child, this.patterns)) {
				return true;
			}
		}
		return false;
	}
}

class SmartLinksSettingTab extends PluginSettingTab {
	plugin: SmartLinks;

	constructor(app: App, plugin: SmartLinks) {
		super(app, plugin);
		this.plugin = plugin;
	}

	refresh(): void {
		this.display();
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for Smart Links'});

		// This might be abusing the settings system a bit?
		this.plugin.settings.patterns.forEach((pattern, index) => {
			const data = { ...pattern }; // because we don't want to insta-save
			const setting = this.makePatternRow(containerEl, `#${index}`, data)
			.addButton((button) => {
				button.setButtonText("Save").onClick(async (evt) => {
					this.plugin.settings.patterns[index] = data;
					await this.plugin.saveSettings();
					this.refresh();
				})
			}).addButton((button) => {
				button.setButtonText("Remove").setClass("settings-delete-btn")
				.onClick(async (evt) => {
					this.plugin.settings.patterns.splice(index, 1);
					await this.plugin.saveSettings();
					this.refresh();
				});
			});
		});
		const data = {regexp: '', replacement: ''};
		const setting = this.makePatternRow(containerEl, "New", data).addButton((button) => {
			button.setButtonText("Add").onClick(async (evt) => {
				if (!(data.regexp && data.replacement) || setting.controlEl.querySelector('.smart-links-setting-error')) {
					return;
				}
				this.plugin.settings.patterns.push(data);
				await this.plugin.saveSettings();
				this.refresh();
			});
		});
	}

	makePatternRow(containerEl: HTMLElement, label: string, data: {regexp: string, replacement: string}): Setting {
		const rowClass = 'smart-links-setting-section';
		const setting = new Setting(containerEl).setClass(rowClass);
		setting.setName(label);
		setting.addText((text) => {
			text.setValue(data.regexp)
				.setPlaceholder("Regular expression").onChange((value) => {
					try {
						new RegExp(`\\b${value}`);
						text.inputEl.removeClass('smart-links-setting-error');
					} catch (error) {
						text.inputEl.addClass('smart-links-setting-error');
					}
					data.regexp = value;
				});
		});
		setting.addText((text) => {
			text.setValue(data.replacement)
				.setPlaceholder("Replacement").onChange((value) => {
					try {
						const regexp = new RegExp(`\\b${data.regexp}`);
						"Arbitrary text".replace(regexp, value);
						text.inputEl.removeClass('smart-links-setting-error');
					} catch (error) {
						text.inputEl.addClass('smart-links-setting-error');
					}
					data.replacement = value;
				});
		});
		return setting;
	}
}

class SmartLinkContainer extends MarkdownRenderChild {
	plugin: SmartLinks;
	constructor(containerEl: HTMLElement, plugin: SmartLinks) {
		super(containerEl);

		this.plugin = plugin;
	}

	onload(): void {
		for (let pattern of this.plugin.patterns) {
			this.containerEl.setChildrenInPlace(
				this.buildNodeReplacements(this.containerEl, pattern)
			);
		}
	}

	buildNodeReplacements(containerEl: HTMLElement, pattern: SmartLinksPattern): Node[] {
		const results: Node[] = [];

		containerEl.childNodes.forEach((node) => {
			if (!isTextNodeMatchingLinkPatterns(node, this.plugin.patterns)) {
				// pass through nodes not matching the pattern
				results.push(node);
				return;
			}
			let remaining = node.textContent || "";

			while (remaining) {
				const nextLink = parseNextLink(remaining, pattern);
				if (!nextLink.found) {
					results.push(document.createTextNode(nextLink.remaining));
					break;
				}
				results.push(document.createTextNode(nextLink.preText));
				results.push(createLinkTag(containerEl, nextLink.link, nextLink.href));
				remaining = nextLink.remaining;
			}
		});

		return results;
	}
}
