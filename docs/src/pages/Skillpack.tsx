import { mount } from 'lithent';

export const Skillpack = mount(() => {
  return () => (
    <div class="page-sheet">
      <h1>Skillpack (Directory)</h1>
      <p><strong>Not supported in ctxloc.</strong></p>
      <p>
        Skillpack is part of ctxbin skill workflows.
        ctxloc does not implement directory skill bundle storage.
      </p>
    </div>
  );
});
