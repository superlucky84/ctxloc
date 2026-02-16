import { mount } from 'lithent';

export const AgentCommandsKo = mount(() => {
  return () => (
    <div class="page-sheet">
      <h1>agent 명령어</h1>
      <p><strong>ctxloc에서는 지원하지 않습니다.</strong></p>
      <p>
        ctxloc은 <code>ctx</code>와 <code>sync</code>만 지원합니다.
        <code>agent</code> 리소스가 필요하면 <code>ctxbin</code>을 사용하세요.
      </p>
    </div>
  );
});
