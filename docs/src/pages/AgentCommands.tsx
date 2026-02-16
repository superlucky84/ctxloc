import { mount } from 'lithent';

export const AgentCommands = mount(() => {
  return () => (
    <div class="page-sheet">
      <h1>agent Commands</h1>
      <p>
        <strong>Not supported in ctxloc.</strong>
      </p>
      <p>
        ctxloc intentionally supports only <code>ctx</code> commands and <code>sync</code>.
        Use <code>ctxbin</code> if you need <code>agent</code> resource operations.
      </p>
    </div>
  );
});
