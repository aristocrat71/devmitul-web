/**
 * A strict, dependency-free reader for the site's Markdown content files.
 *
 * The files under `content/` are the single source of truth for the copy on the
 * page. This module knows nothing about any of them: it turns a file into
 * blocks and hands them over, and each section's own schema decides what a
 * valid block is (`src/sections/projects/schema.ts` is the first).
 *
 * The grammar is deliberately tiny, because the file has to stay a document a
 * person reads rather than a config file wearing Markdown:
 *
 * ```
 * # Title          the document — everything before the first `##` is the
 *                  preamble, and its bullets are document-level fields
 * - key: value     a field of the enclosing block (`**key:**` reads the same)
 * ## Name          starts a record; the heading is its name
 * ### Section      a named list inside the record
 * 1. item          its items (`- item` reads the same)
 * ```
 *
 * **Fields are read only from a block's body, before its first `###`.** That
 * one rule is what lets a `### Notes` section hold free prose — bullets, colons
 * and all — without the parser mistaking a sentence for a field. It is also why
 * a section heading is never optional punctuation: it closes the field list.
 *
 * Everything the parser can't place it drops, so prose, blank lines and `---`
 * rules cost nothing. It throws only where silence would be worse than a crash:
 * a nameless record, or a field written twice.
 *
 * Reading the file is intentionally free of anything bundler-shaped so that the
 * same parse can run in the browser and under `bun scripts/content-check.ts`.
 */

/** A content-file error. Always carries `file:line` so the message is actionable. */
export class ContentError extends Error {
  constructor(where: string, message: string) {
    super(`${where} — ${message}`);
    this.name = "ContentError";
  }
}

/**
 * One `##` record, or the document preamble — they are the same shape on
 * purpose, so page-level copy (a URL, a caption) is written the same way as
 * per-record copy and read by the same helpers.
 */
export interface MarkdownBlock {
  /** The `##` heading text; for the preamble, the document's `#` title. */
  title: string;
  /** `file:line` of the heading. Every error message about this block starts here. */
  where: string;
  /** `- key: value` bullets in the body, keyed by normalized name. */
  fields: Map<string, string>;
  /** Items under each `###` heading, keyed by normalized heading. */
  lists: Map<string, string[]>;
}

export interface MarkdownDoc {
  preamble: MarkdownBlock;
  records: MarkdownBlock[];
}

const HEADING = /^(#{1,6})\s+(.*)$/;
/** `- **key:** value`, and the `**key**: value` spelling of the same thing. */
const BOLD_FIELD = /^[-*]\s+\*\*\s*([^:*]+?)\s*:?\s*\*\*\s*:?\s*(.*)$/;
/** `- key: value`. The key may not contain a colon; the value may. */
const PLAIN_FIELD = /^[-*]\s+([^:*]+?)\s*:\s*(.*)$/;
const LIST_ITEM = /^(?:\d+[.)]|[-*])\s+(.*)$/;

/** Keys are matched case- and spacing-insensitively; the file stays prose. */
const normalize = (text: string) => text.trim().toLowerCase().replace(/\s+/g, " ");

export function parseMarkdownDoc(source: string, file: string): MarkdownDoc {
  const preamble: MarkdownBlock = {
    title: "",
    where: `${file}:1`,
    fields: new Map(),
    lists: new Map(),
  };
  const records: MarkdownBlock[] = [];

  let block = preamble;
  /** The `###` list being filled, or null while inside a block's own body. */
  let list: string[] | null = null;

  source.split(/\r?\n/).forEach((raw, index) => {
    const line = raw.trim();
    if (!line) return;
    const where = `${file}:${index + 1}`;

    const heading = HEADING.exec(line);
    if (heading) {
      const depth = heading[1].length;
      const text = heading[2].trim();

      if (depth === 1) {
        preamble.title = text;
        list = null;
        return;
      }

      if (depth === 2) {
        if (!text) throw new ContentError(where, "a `##` record needs a name");
        block = { title: text, where, fields: new Map(), lists: new Map() };
        records.push(block);
        list = null;
        return;
      }

      // `###` and deeper — a named list inside the current block. Deeper
      // headings start their own list rather than continuing the one above, so
      // prose that follows one can never leak into the list before it.
      if (!text) throw new ContentError(where, "a `###` section needs a name");
      list = [];
      block.lists.set(normalize(text), list);
      return;
    }

    if (list) {
      const item = LIST_ITEM.exec(line);
      // Prose inside a section is commentary about it, never an item.
      if (item) list.push(item[1].trim());
      return;
    }

    const field = BOLD_FIELD.exec(line) ?? PLAIN_FIELD.exec(line);
    if (!field) return; // Prose in a block's body.

    const key = normalize(field[1]);
    if (block.fields.has(key)) {
      throw new ContentError(where, `\`${key}:\` is set twice — one of them is being ignored`);
    }
    block.fields.set(key, field[2].trim());
  });

  return { preamble, records };
}

/** A field that must be present and non-empty. */
export function requireField(block: MarkdownBlock, key: string): string {
  const value = block.fields.get(key);
  if (value === undefined) {
    throw new ContentError(block.where, `\`${block.title}\` has no \`${key}:\` line`);
  }
  if (!value) {
    throw new ContentError(block.where, `\`${block.title}\`'s \`${key}:\` line is empty`);
  }
  return value;
}

/** A `###` section that must be present and hold at least one item. */
export function requireList(block: MarkdownBlock, key: string): string[] {
  const items = block.lists.get(key);
  if (!items?.length) {
    throw new ContentError(
      block.where,
      `\`${block.title}\` has no \`### ${key}\` items — check the heading's spelling`,
    );
  }
  return items;
}

/**
 * Rejects field names the schema doesn't know.
 *
 * A mistyped key is the failure this file is most exposed to, and it is silent
 * by nature: the line still reads perfectly to a person, it just never reaches
 * the page. So an unknown key is an error, not a shrug.
 */
export function rejectUnknownFields(block: MarkdownBlock, known: readonly string[]): void {
  const unknown = [...block.fields.keys()].filter((key) => !known.includes(key));
  if (!unknown.length) return;
  throw new ContentError(
    block.where,
    `\`${block.title}\` has ${unknown.map((key) => `\`${key}:\``).join(", ")} — ` +
      `not a field this page reads. Known fields: ${known.join(", ")}`,
  );
}
