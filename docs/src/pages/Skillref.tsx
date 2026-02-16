import { mount } from 'lithent';

export const Skillref = mount(() => {
  return () => (
    <div class="page-sheet">
      <h1>Skillref (GitHub)</h1>
      <p><strong>Not supported in ctxloc.</strong></p>
      <p>
        Skillref is a ctxbin feature for GitHub directory references.
        ctxloc is intentionally limited to <code>ctx</code> and <code>sync</code>.
      </p>
    </div>
  );
});
