import { mount } from 'lithent';

export const SkillCommands = mount(() => {
  return () => (
    <div class="page-sheet">
      <h1>skill Commands</h1>
      <p><strong>Not supported in ctxloc.</strong></p>
      <p>
        ctxloc is intentionally limited to local <code>ctx</code> management and sync.
        Use <code>ctxbin</code> for <code>skill</code> operations.
      </p>
    </div>
  );
});
