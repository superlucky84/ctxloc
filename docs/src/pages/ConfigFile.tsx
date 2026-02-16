import { mount } from 'lithent';
import { CodeBlock } from '@/components/CodeBlock';

export const ConfigFile = mount(() => {
  return () => (
    <div class="page-sheet">
      <h1>Config File</h1>

      <p>
        <code>ctxloc</code> itself does not provide <code>init</code> and does not maintain a dedicated remote config file.
        For remote sync compatibility, it reads existing <code>ctxbin</code> config as fallback.
      </p>

      <h2>Fallback File</h2>
      <CodeBlock language="text" code={`~/.ctxbin/config.json`} />

      <h2>Expected Format</h2>
      <CodeBlock
        language="json"
        code={`{
  "store_url": "https://your-redis.upstash.io",
  "store_token": "your-token"
}`}
      />

      <h2>Manual Setup</h2>
      <CodeBlock
        language="bash"
        code={`$ mkdir -p ~/.ctxbin
$ cat > ~/.ctxbin/config.json << EOF
{
  "store_url": "https://your-redis.upstash.io",
  "store_token": "your-token"
}
EOF`}
      />

      <h2>Prefer ENV for Automation</h2>
      <p>
        In CI/agent workflows, prefer <code>CTXBIN_STORE_URL</code> and <code>CTXBIN_STORE_TOKEN</code> environment variables.
      </p>
    </div>
  );
});
