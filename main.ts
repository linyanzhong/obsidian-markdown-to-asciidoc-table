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
			editorCallback: (editor: Editor, view: MarkdownView) => {
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
					{ line: end, ch: 0 },
				);
			},
		});
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData(),
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

// Helper function to convert Markdown links to AsciiDoc links
function convertLinks(text: string): string {
	const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
	return text.replace(markdownLinkRegex, "link:$2[$1]");
}

function markdownToAsciiDoc(markdown: string): string {
	// Split the input markdown string into lines
	const lines = markdown.split("\n").filter((line) => line.trim() !== "");

	// Extract the header and rows
	const header = lines[0]
		.split("|")
		.map((cell) => convertLinks(cell.trim()))
		.slice(1, -1);
	const rows = lines.slice(2).map((line) =>
		line
			.split("|")
			.map((cell) => convertLinks(cell.trim()))
			.slice(1, -1),
	);

	// Build the AsciiDoc table
	let asciidoc = `\`\`\`asciidoc-table\n[cols="${"1,"
		.repeat(header.length)
		.slice(0, -1)}", options="header"]\n|===\n`;

	// Add the header row
	asciidoc += header.map((cell) => `| ${cell}`).join("\n") + "\n\n";

	// Add the data rows
	rows.forEach((row) => {
		asciidoc += row.map((cell) => `| ${cell}`).join("\n") + "\n\n";
	});

	// Close the AsciiDoc table
	asciidoc += "|===\n```\n";

	return asciidoc;
}
