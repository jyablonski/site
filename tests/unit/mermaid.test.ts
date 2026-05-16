import { describe, expect, it } from 'vitest';
import type { Root } from 'mdast';
import { escapeMermaidHtml, remarkMermaid } from '../../src/lib/mermaid';

describe('mermaid', () => {
  it('escapes html in diagram source', () => {
    expect(escapeMermaidHtml('a < b & c > d')).toBe('a &lt; b &amp; c &gt; d');
  });

  it('converts mermaid code fences to pre.mermaid html', () => {
    const tree: Root = {
      type: 'root',
      children: [
        {
          type: 'code',
          lang: 'mermaid',
          value: 'graph LR\n  A --> B',
        },
      ],
    };

    remarkMermaid()(tree);

    expect(tree.children[0]).toEqual({
      type: 'html',
      value: '<pre class="mermaid">graph LR\n  A --&gt; B</pre>',
    });
  });

  it('leaves non-mermaid code blocks unchanged', () => {
    const tree: Root = {
      type: 'root',
      children: [{ type: 'code', lang: 'ts', value: 'const x = 1' }],
    };

    remarkMermaid()(tree);

    expect(tree.children[0]).toEqual({
      type: 'code',
      lang: 'ts',
      value: 'const x = 1',
    });
  });
});
