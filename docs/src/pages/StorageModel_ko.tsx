import { mount } from 'lithent';
import { CodeBlock } from '@/components/CodeBlock';

export const StorageModelKo = mount(() => {
  return () => (
    <div class="page-sheet">
      <h1>저장소 모델</h1>

      <h2>로컬 저장소(기본)</h2>
      <p>ctxloc은 ctx 키 하나를 로컬 파일 하나로 저장합니다.</p>
      <CodeBlock
        language="text"
        code={`디렉터리: ~/.ctxloc/store/
파일명   : {base64url(key)}.ctx
내용     : 메타데이터 + 본문`}
      />
      <CodeBlock language="text" code={`예시 키: my-project/main`} />

      <h2>원격 저장소(sync 대상)</h2>
      <p><code>ctxloc sync</code>는 <code>ctxbin</code> CLI 계약을 통해 원격 ctx를 읽고 씁니다.</p>
      <CodeBlock
        language="text"
        code={`Redis Hash: ctx
Field     : {project}/{branch}
Value     : metadata envelope + body`}
      />

      <h2>메타데이터 포맷</h2>
      <CodeBlock
        language="text"
        code={`ctxbin-meta@1
{"savedAt":"2026-02-16T12:00:00.000Z","by":"optional"}
---
markdown body`}
      />

      <h2>sync 승자 규칙</h2>
      <ul>
        <li><code>savedAt</code>가 더 최신인 값 승리</li>
        <li>메타가 있는 값이 legacy 무메타 값보다 우선</li>
        <li>동일 타임스탬프 tie-break: 원격 승리</li>
      </ul>
    </div>
  );
});
