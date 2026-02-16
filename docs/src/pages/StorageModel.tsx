import { mount } from 'lithent';
import { CodeBlock } from '@/components/CodeBlock';

export const StorageModel = mount(() => {
  return () => (
    <div class="page-sheet">
      <h1>Storage Model</h1>

      <h2>Local Store (Primary)</h2>
      <p>ctxloc stores ctx in a local JSON file.</p>
      <CodeBlock
        language="json"
        code={`{
  "ctx": {
    "my-project/main": "ctxbin-meta@1\\n{...}\\n---\\nbody"
  }
}`}
      />
      <CodeBlock language="text" code={`Default path: ~/.ctxloc/store.json`} />

      <h2>Remote Store (Sync Target)</h2>
      <p>
        <code>ctxloc sync</code> reads/writes remote ctx through <code>ctxbin</code> CLI contracts.
      </p>
      <CodeBlock
        language="text"
        code={`Redis Hash: ctx
Field     : {project}/{branch}
Value     : metadata envelope + body`}
      />

      <h2>Metadata Envelope</h2>
      <CodeBlock
        language="text"
        code={`ctxbin-meta@1
{"savedAt":"2026-02-16T12:00:00.000Z","by":"optional"}
---
markdown body`}
      />

      <h2>Sync Winner Rules</h2>
      <ul>
        <li>Newer <code>savedAt</code> wins</li>
        <li>Metadata-bearing value beats metadata-missing legacy value</li>
        <li>Equal timestamp tie-break: remote wins</li>
      </ul>
    </div>
  );
});
