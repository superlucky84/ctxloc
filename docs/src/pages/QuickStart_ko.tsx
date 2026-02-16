import { mount } from 'lithent';
import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const QuickStartKo = mount(() => {
  return () => (
    <div class="page-sheet">
      <h1>빠른 시작</h1>

      <h2>사전 준비</h2>
      <ul>
        <li>Node.js 18+</li>
        <li>원격 동기화 시 Upstash 자격증명</li>
      </ul>

      <h2>1. 로컬 컨텍스트 저장</h2>
      <CodeBlock
        language="bash"
        code={`$ npx ctxloc ctx save --value "# summary\n- implemented X\n\n# next\n- do Y"`}
      />

      <h2>2. 조회 / 추가 / 목록</h2>
      <CodeBlock
        language="bash"
        code={`$ npx ctxloc ctx load
$ npx ctxloc ctx save --append --value "extra notes"
$ npx ctxloc ctx list`}
      />

      <h2>3. 원격 동기화 (ctxbin 저장소)</h2>
      <p>
        원격 동기화 시 <code>CTXBIN_STORE_URL</code>, <code>CTXBIN_STORE_TOKEN</code>을 사용하거나
        <code>~/.ctxbin/config.json</code>을 사용합니다.
      </p>
      <CodeBlock
        language="bash"
        code={`$ export CTXBIN_STORE_URL="https://your-redis.upstash.io"
$ export CTXBIN_STORE_TOKEN="your-token"
$ npx ctxloc sync`}
      />

      <h2>4. 에이전트 요청 예시</h2>
      <CodeBlock
        language="text"
        code={`"npx ctxloc help 확인하고 현재 컨텍스트 저장해줘."
"저장 후 npx ctxloc sync도 실행해줘."`}
      />

      <h2>키 추론</h2>
      <p>
        키를 생략하면 git 기반으로 <code>{'{project}/{branch}'}</code>를 자동 추론합니다.
        자세한 규칙은 <span onClick={() => navigateTo('/ko/guide/key-inference')} class="text-indigo-600 hover:underline cursor-pointer">키 추론</span> 문서를 참고하세요.
      </p>
    </div>
  );
});
