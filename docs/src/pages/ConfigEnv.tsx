import { mount } from 'lithent';
import { CodeBlock } from '@/components/CodeBlock';

export const ConfigEnv = mount(() => {
  return () => (
    <div class="page-sheet">
      <h1>Environment Variables</h1>

      <p>
        Local <code>ctx</code> commands do not need remote credentials.
        Remote credentials are required only for <code>ctxloc sync</code>.
      </p>

      <h2>One-time Setup (Recommended)</h2>
      <CodeBlock
        language="bash"
        code={`npx ctxbin init`}
      />
      <p>
        This writes <code>~/.ctxbin/config.json</code>, which <code>ctxloc sync</code> reads as fallback.
      </p>

      <h2>Variables Used for Sync</h2>
      <CodeBlock
        language="bash"
        code={`CTXBIN_STORE_URL   # Upstash Redis REST URL
CTXBIN_STORE_TOKEN # Upstash Redis REST token`}
      />

      <h2>Example</h2>
      <CodeBlock
        language="bash"
        code={`export CTXBIN_STORE_URL="https://your-redis.upstash.io"
export CTXBIN_STORE_TOKEN="your-token"
npx ctxloc sync`}
      />

      <h2>Resolution Order</h2>
      <ol>
        <li><strong>Environment variables</strong></li>
        <li><code>~/.ctxbin/config.json</code> fallback</li>
      </ol>

      <p>
        This keeps ctxloc compatible with existing ctxbin credential setup.
      </p>
    </div>
  );
});
