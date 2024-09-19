import { describe, it, expect } from 'vitest';
import { markdownToAsciiDoc } from '../markdownToAsciiDoc';

describe('markdownToAsciiDoc', () => {
	it('should convert a simple markdown table to AsciiDoc', () => {
		const markdown = `
| Header1 | Header2 |
| ------- | ------- |
| Cell1   | Cell2   |
| Cell3   | Cell4   |
		`.trim();

		const expectedAsciiDoc = `
\`\`\`asciidoc-table
[cols="1,1", options="header"]
|===
| Header1
| Header2

| Cell1
| Cell2

| Cell3
| Cell4

|===
\`\`\`
		`.trim();

		expect(markdownToAsciiDoc(markdown).trim()).toBe(expectedAsciiDoc);
	});

	it('should throw an error for invalid markdown table', () => {
		const invalidMarkdown = `
| Header1 | Header2 |
| Cell1   | Cell2   |
		`.trim();

		expect(() => markdownToAsciiDoc(invalidMarkdown)).toThrow(
			'Invalid markdown table: missing separator line.'
		);
	});
});
