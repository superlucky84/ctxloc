import { mount } from 'lithent';
import { CodeBlock } from '@/components/CodeBlock';

const RECOMMENDED_BLOCK = `## ctxloc

When asked to preserve progress/context:
1. Run \`npx ctxloc help\`.
2. Save current context with \`npx ctxloc ctx save\`.
3. Run \`npx ctxloc sync\` when remote convergence is requested.

Use this structure when saving ctx:
- summary
- decisions
- open
- next
- risks`;

async function copyBlock(event: Event) {
  const target = event.currentTarget as HTMLButtonElement | null;
  if (!target) return;
  const original = target.textContent || 'Copy';
  try {
    await navigator.clipboard.writeText(RECOMMENDED_BLOCK);
    target.textContent = 'Copied';
    setTimeout(() => {
      target.textContent = original;
    }, 1200);
  } catch {
    target.textContent = 'Failed';
    setTimeout(() => {
      target.textContent = original;
    }, 1200);
  }
}

export const AgentAddon = mount(() => {
  return () => (
    <div class="page-sheet">
      <h1>Agent Add-on</h1>
      <p>
        ctxloc does not ship a separate <code>agent-addon.md</code> file.
        Use the snippet below in your project instruction file if you want consistent agent behavior.
      </p>
      <button
        onClick={copyBlock}
        class="mb-3 px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
      >
        Copy Block
      </button>
      <CodeBlock language="markdown" code={RECOMMENDED_BLOCK} />
    </div>
  );
});
