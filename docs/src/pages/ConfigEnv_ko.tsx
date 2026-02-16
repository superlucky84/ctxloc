import { mount } from 'lithent';
import { CodeBlock } from '@/components/CodeBlock';

export const ConfigEnvKo = mount(() => {
  return () => (
    <div class="page-sheet">
      <h1>환경 변수</h1>

      <p>
        로컬 <code>ctx</code> 명령은 원격 자격증명이 필요 없습니다.
        원격 자격증명은 <code>ctxloc sync</code>에서만 필요합니다.
      </p>

      <h2>1회 설정(권장)</h2>
      <CodeBlock
        language="bash"
        code={`npx ctxbin init`}
      />
      <p>
        위 명령은 <code>~/.ctxbin/config.json</code>을 생성하며, <code>ctxloc sync</code>가 이를 폴백으로 읽습니다.
      </p>

      <h2>sync에서 사용하는 변수</h2>
      <CodeBlock
        language="bash"
        code={`CTXBIN_STORE_URL   # Upstash Redis REST URL
CTXBIN_STORE_TOKEN # Upstash Redis REST token`}
      />

      <h2>예시</h2>
      <CodeBlock
        language="bash"
        code={`export CTXBIN_STORE_URL="https://your-redis.upstash.io"
export CTXBIN_STORE_TOKEN="your-token"
npx ctxloc sync`}
      />

      <h2>해석 순서</h2>
      <ol>
        <li><strong>환경 변수</strong></li>
        <li><code>~/.ctxbin/config.json</code> 폴백</li>
      </ol>

      <p>기존 ctxbin 자격증명 설정과 호환되도록 설계되었습니다.</p>
    </div>
  );
});
