export function markdownToAsciiDoc(markdown: string): string {
	// Split the input markdown string into lines
	const lines = markdown.split("\n").filter((line) => line.trim() !== "");

	// Check if the second line is a separator line
	const separatorLine = lines[1].trim();
	// Regex explanation:
	// ^: Asserts the start of the line.
	// (\|\s*-+\s*)+: Matches one or more occurrences of:
	//   \|: A literal pipe character.
	//   \s*: Zero or more whitespace characters.
	//   -+: One or more dashes.
	//   \s*: Zero or more whitespace characters.
	// \|: A literal pipe character at the end.
	// $: Asserts the end of the line.
	if (!/^(\|\s*-+\s*)+\|$/.test(separatorLine)) {
		throw new Error("Invalid markdown table: missing separator line.");
	}

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

// Helper function to convert Markdown links to AsciiDoc links
function convertLinks(text: string): string {
	const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
	return text.replace(markdownLinkRegex, "link:$2[$1]");
}
