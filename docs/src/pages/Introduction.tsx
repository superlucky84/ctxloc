import { mount } from 'lithent';
import { CodeBlock } from '@/components/CodeBlock';

export const Introduction = mount(() => {
  return () => (
    <div class="page-sheet">
      <h1>Introduction</h1>

      <p>
        <code>ctxloc</code> is a <strong>minimal, deterministic Node.js CLI</strong> executed via <code>npx</code>.
        It focuses on one resource: <strong>ctx</strong>.
        You store context locally, then run <code>ctxloc sync</code> to converge with remote ctxbin storage.
      </p>

      <h2>What ctxloc IS</h2>
      <ul>
        <li>ctx-only CLI for agent handoff context</li>
        <li>Local-first storage model</li>
        <li>Deterministic sync with explicit conflict rules</li>
        <li>Non-interactive and automation-friendly</li>
      </ul>

      <h2>What ctxloc is NOT</h2>
      <ul>
        <li>Not <code>agent</code>/<code>skill</code> storage</li>
        <li>Not RAG, embeddings, or semantic retrieval</li>
        <li>Not opaque AI memory</li>
      </ul>

      <h2>Execution Model</h2>
      <ul>
        <li><strong>Runtime:</strong> Node.js 18+</li>
        <li><strong>Execution:</strong> <code>npx ctxloc ...</code></li>
        <li><strong>Platform:</strong> macOS / Linux / Windows</li>
      </ul>

      <h2>Core Commands</h2>
      <CodeBlock
        language="bash"
        code={`$ npx ctxloc ctx save --value "summary"
$ npx ctxloc ctx load
$ npx ctxloc sync`}
      />

      <h2>Sync Boundary</h2>
      <p>
        Sync orchestration is intentionally exposed only by <code>ctxloc sync</code>.
        The workflow does not require <code>ctxbin</code> to know anything about ctxloc.
      </p>

      <h2>Relationship to ctxbin</h2>
      <ul>
        <li><strong>ctxbin</strong>: remote storage-oriented CLI with broader resources.</li>
        <li><strong>ctxloc</strong>: local-first ctx CLI with explicit sync workflow.</li>
      </ul>
      <p>
        Repositories:
        {' '}
        <a href="https://github.com/superlucky84/ctxloc" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:underline">ctxloc</a>
        {' / '}
        <a href="https://github.com/superlucky84/ctxbin" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:underline">ctxbin</a>
      </p>
    </div>
  );
});
