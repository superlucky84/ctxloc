import { mount } from 'lithent';

export const SkillrefKo = mount(() => {
  return () => (
    <div class="page-sheet">
      <h1>Skillref (GitHub)</h1>
      <p><strong>ctxloc에서는 지원하지 않습니다.</strong></p>
      <p>
        Skillref는 GitHub 디렉터리 참조를 위한 ctxbin 기능입니다.
        ctxloc은 <code>ctx</code>와 <code>sync</code>만 지원합니다.
      </p>
    </div>
  );
});
