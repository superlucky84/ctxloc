import { mount } from 'lithent';

export const SkillCommandsKo = mount(() => {
  return () => (
    <div class="page-sheet">
      <h1>skill 명령어</h1>
      <p><strong>ctxloc에서는 지원하지 않습니다.</strong></p>
      <p>
        ctxloc은 로컬 <code>ctx</code> 관리와 sync에만 집중합니다.
        <code>skill</code> 작업은 <code>ctxbin</code>을 사용하세요.
      </p>
    </div>
  );
});
