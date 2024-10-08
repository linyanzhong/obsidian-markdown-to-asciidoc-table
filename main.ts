import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";
import { markdownToAsciiDoc } from "./markdownToAsciiDoc";

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: "default",
};

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: "to-asciidoc-table",
			name: "To AsciiDoc Table",
			editorCallback: this.convertContent,
		});
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	/**
	 * Converts a markdown table in the editor to an AsciiDoc table.
	 * It identifies the table based on the cursor position, extracts it,
	 * converts it using the markdownToAsciiDoc function, and replaces
	 * the original markdown table with the converted AsciiDoc table.
	 *
	 * @param editor - The editor instance where the command is executed.
	 * @param view - The current markdown view.
	 */
	private convertContent(editor: Editor, view: MarkdownView) {
		const cursor = editor.getCursor();
		const lines = editor.getValue().split("\n");

		// Find the start and end of the table
		let start = cursor.line;
		while (start > 0 && lines[start - 1].includes("|")) {
			start--;
		}

		let end = cursor.line;
		while (end < lines.length && lines[end].includes("|")) {
			end++;
		}

		// Extract the table
		const tableLines = lines.slice(start, end).join("\n");
		const asciidocTable = markdownToAsciiDoc(tableLines);

		// Replace the markdown table with the AsciiDoc table
		editor.replaceRange(
			asciidocTable,
			{ line: start, ch: 0 },
			{ line: end, ch: 0 }
		);
	}
}
