import { mount } from 'lithent';
import { CodeBlock } from '@/components/CodeBlock';

const RECOMMENDED_BLOCK = `## ctxloc

컨텍스트 저장 요청을 받으면:
1. \`npx ctxloc help\` 실행
2. \`npx ctxloc ctx save\`로 현재 컨텍스트 저장
3. 원격 수렴이 필요하면 \`npx ctxloc sync\` 실행

저장 포맷:
- summary
- decisions
- open
- next
- risks`;

async function copyBlock(event: Event) {
  const target = event.currentTarget as HTMLButtonElement | null;
  if (!target) return;
  const original = target.textContent || '복사';
  try {
    await navigator.clipboard.writeText(RECOMMENDED_BLOCK);
    target.textContent = '복사됨';
    setTimeout(() => {
      target.textContent = original;
    }, 1200);
  } catch {
    target.textContent = '실패';
    setTimeout(() => {
      target.textContent = original;
    }, 1200);
  }
}

export const AgentAddonKo = mount(() => {
  return () => (
    <div class="page-sheet">
      <h1>에이전트 추가 지침</h1>
      <p>
        ctxloc은 별도의 <code>agent-addon.md</code> 파일을 기본 제공하지 않습니다.
        아래 블록을 프로젝트 지침 파일에 붙여서 사용할 수 있습니다.
      </p>
      <button
        onClick={copyBlock}
        class="mb-3 px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
      >
        블록 복사
      </button>
      <CodeBlock language="markdown" code={RECOMMENDED_BLOCK} />
    </div>
  );
});
