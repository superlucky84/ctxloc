import { mount } from 'lithent';
import { CodeBlock } from '@/components/CodeBlock';

export const IntroductionKo = mount(() => {
  return () => (
    <div class="page-sheet">
      <h1>소개</h1>

      <p>
        <code>ctxloc</code>은 <code>npx</code>로 실행되는 <strong>최소/결정론적 Node.js CLI</strong>입니다.
        리소스는 <strong>ctx 하나만</strong> 다루며, 로컬 저장 후 <code>ctxloc sync</code>로 원격(ctxbin 저장소)과 수렴합니다.
      </p>

      <h2>ctxloc의 특징</h2>
      <ul>
        <li>에이전트 handoff용 ctx 전용 CLI</li>
        <li>로컬 우선 저장 모델</li>
        <li>명시적 충돌 규칙 기반 동기화</li>
        <li>비대화형, 자동화 친화적</li>
      </ul>

      <h2>ctxloc가 아닌 것</h2>
      <ul>
        <li><code>agent</code>/<code>skill</code> 저장 도구 아님</li>
        <li>RAG/임베딩/시맨틱 검색 도구 아님</li>
        <li>불투명한 AI 메모리 시스템 아님</li>
      </ul>

      <h2>실행 모델</h2>
      <ul>
        <li><strong>런타임:</strong> Node.js 18+</li>
        <li><strong>실행:</strong> <code>npx ctxloc ...</code></li>
        <li><strong>플랫폼:</strong> macOS / Linux / Windows</li>
      </ul>

      <h2>핵심 명령어</h2>
      <CodeBlock
        language="bash"
        code={`$ npx ctxloc ctx save --value "summary"
$ npx ctxloc ctx load
$ npx ctxloc sync`}
      />

      <h2>동기화 경계</h2>
      <p>
        동기화 오케스트레이션은 <code>ctxloc sync</code>에서만 제공합니다.
        이 워크플로우에서 ctxbin이 ctxloc을 알 필요는 없습니다.
      </p>

      <h2>ctxbin과의 관계</h2>
      <ul>
        <li><strong>ctxbin</strong>: 원격 저장소 중심, 더 넓은 리소스 범위의 CLI</li>
        <li><strong>ctxloc</strong>: 로컬 우선 ctx + 명시적 sync 워크플로우 CLI</li>
      </ul>
      <p>
        저장소 링크:
        {' '}
        <a href="https://github.com/superlucky84/ctxloc" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:underline">ctxloc</a>
        {' / '}
        <a href="https://github.com/superlucky84/ctxbin" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:underline">ctxbin</a>
      </p>
    </div>
  );
});
