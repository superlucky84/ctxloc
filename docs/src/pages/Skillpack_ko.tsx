import { mount } from 'lithent';

export const SkillpackKo = mount(() => {
  return () => (
    <div class="page-sheet">
      <h1>Skillpack (디렉터리)</h1>
      <p><strong>ctxloc에서는 지원하지 않습니다.</strong></p>
      <p>
        Skillpack은 ctxbin의 skill 워크플로우 기능입니다.
        ctxloc은 디렉터리 기반 skill 번들 저장을 구현하지 않습니다.
      </p>
    </div>
  );
});
