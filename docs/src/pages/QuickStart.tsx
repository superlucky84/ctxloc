import { mount } from 'lithent';
import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const QuickStart = mount(() => {
  return () => (
    <div class="page-sheet">
      <h1>Quick Start</h1>

      <h2>Prerequisites</h2>
      <ul>
        <li>Node.js 18+</li>
        <li>Optional for sync: Upstash credentials (ctxbin-compatible)</li>
      </ul>

      <h2>1. Save Local Context</h2>
      <CodeBlock
        language="bash"
        code={`$ npx ctxloc ctx save --value "# summary\n- implemented X\n\n# next\n- do Y"`}
      />

      <h2>2. Load / Append / List</h2>
      <CodeBlock
        language="bash"
        code={`$ npx ctxloc ctx load
$ npx ctxloc ctx save --append --value "extra notes"
$ npx ctxloc ctx list`}
      />

      <h2>3. Sync with Remote (ctxbin storage)</h2>
      <p>
        Before first sync, set remote credentials once with <code>npx ctxbin init</code>.
        It writes <code>~/.ctxbin/config.json</code>, which <code>ctxloc sync</code> can read.
      </p>
      <CodeBlock
        language="bash"
        code={`$ npx ctxbin init
$ npx ctxloc sync`}
      />
      <p>
        Or provide credentials directly through environment variables:
      </p>
      <CodeBlock
        language="bash"
        code={`$ export CTXBIN_STORE_URL="https://your-redis.upstash.io"
$ export CTXBIN_STORE_TOKEN="your-token"
$ npx ctxloc sync`}
      />

      <h2>4. Agent Workflow</h2>
      <CodeBlock
        language="text"
        code={`"Run npx ctxloc help and save the current context."
"Run npx ctxloc sync after saving."`}
      />

      <h2>Key Inference</h2>
      <p>
        Without explicit key, ctxloc infers <code>{'{project}/{branch}'}</code> from git repository metadata.
        See <span onClick={() => navigateTo('/guide/key-inference')} class="text-indigo-600 hover:underline cursor-pointer">Key Inference</span>.
      </p>
    </div>
  );
});
