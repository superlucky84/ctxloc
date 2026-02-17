import { mount } from 'lithent';
import { CodeBlock } from '@/components/CodeBlock';

export const StorageModel = mount(() => {
  return () => (
    <div class="page-sheet">
      <h1>Storage Model</h1>

      <h2>Local Store (Primary)</h2>
      <p>ctxloc stores each ctx key as one local file.</p>
      <CodeBlock
        language="text"
        code={`Directory: ~/.ctxloc/store/
File     : {base64url(key)}.ctx
Content  : metadata envelope + body`}
      />
      <CodeBlock language="text" code={`Example key: my-project/main`} />

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
