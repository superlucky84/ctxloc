import { mount } from 'lithent';
import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const HomeKo = mount(() => {
  return () => (
    <div class="page-sheet">
      <div class="text-center py-12">
        <div class="mx-auto mb-4 flex h-20 w-20 items-center justify-center bg-white/80 shadow-md ring-1 ring-gray-200 dark:bg-white/10 dark:ring-gray-700 md:h-24 md:w-24">
          <img src="/ctxloc/ctxloc.png" alt="ctxloc logo" class="h-14 w-14 md:h-16 md:w-16" />
        </div>
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          ctxloc
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          AI 에이전트를 위한 로컬 우선 컨텍스트 CLI입니다.
          로컬에 ctx를 저장하고 필요할 때 ctxbin 저장소와 동기화합니다.
        </p>

        <div class="flex flex-wrap justify-center gap-4 mb-12">
          <button
            onClick={() => navigateTo('/ko/guide/quick-start')}
            class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            시작하기
          </button>
          <a
            href="https://github.com/superlucky84/ctxloc"
            target="_blank"
            rel="noopener noreferrer"
            class="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
          >
            GitHub
          </a>
        </div>
      </div>

      <div class="mb-12 p-6 rounded-lg border-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20">
        <h2 class="text-indigo-700 dark:text-indigo-300">핵심 워크플로우</h2>
        <ol>
          <li>작업 중에는 로컬에 ctx 저장</li>
          <li><code>ctxloc sync</code>로 로컬/원격 수렴</li>
          <li>다른 머신/에이전트에서 동기화된 ctx로 이어서 작업</li>
        </ol>
        <CodeBlock
          language="bash"
          code={`$ npx ctxloc ctx save --value "summary + next"
$ npx ctxloc sync
$ npx ctxloc ctx load`}
        />
      </div>

      <div class="mb-12 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h2>ctxbin과의 관계</h2>
        <p>
          <strong>ctxbin</strong>은 원격 저장소 중심의 원본 CLI이고,
          <strong> ctxloc</strong>은 로컬 우선 <code>ctx</code> + 결정론적 sync에 집중한 보완 도구입니다.
        </p>
        <ul>
          <li>ctxloc은 로컬 ctx 작업과 sync 오케스트레이션을 담당합니다.</li>
          <li>ctxbin은 독립 프로젝트로 유지되며 ctxloc 전용 동작을 요구하지 않습니다.</li>
        </ul>
        <div class="flex flex-wrap gap-3">
          <a
            href="https://github.com/superlucky84/ctxloc"
            target="_blank"
            rel="noopener noreferrer"
            class="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            ctxloc GitHub
          </a>
          <a
            href="https://github.com/superlucky84/ctxbin"
            target="_blank"
            rel="noopener noreferrer"
            class="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            ctxbin GitHub
          </a>
        </div>
      </div>

      <div class="mb-12">
        <h2>AI 에이전트 사용</h2>
        <p>다음처럼 요청하면 됩니다:</p>
        <CodeBlock
          language="text"
          code={`"npx ctxloc help 확인하고, 현재 컨텍스트 저장해줘."`}
        />
      </div>

      <div class="grid md:grid-cols-2 gap-6 mb-12">
        <div class="p-6 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors" onClick={() => navigateTo('/ko/commands/ctx')}>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">ctx 명령어</h3>
          <p class="text-gray-600 dark:text-gray-400">브랜치 단위 ctx를 메타데이터와 함께 저장/조회/삭제합니다.</p>
        </div>

        <div class="p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">결정론적 동기화</h3>
          <p class="text-gray-600 dark:text-gray-400"><code>savedAt</code> 기준 충돌 해결 + 고정 tie-break 정책을 사용합니다.</p>
        </div>

        <div class="p-6 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors" onClick={() => navigateTo('/ko/guide/key-inference')}>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">키 추론</h3>
          <p class="text-gray-600 dark:text-gray-400"><code>{'{project}/{branch}'}</code> 형식을 자동 추론합니다.</p>
        </div>

        <div class="p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">ctxloc 전용 sync</h3>
          <p class="text-gray-600 dark:text-gray-400">동기화 진입점은 <code>ctxloc sync</code>만 제공합니다.</p>
        </div>
      </div>

      <div class="mb-12">
        <h2>ctxloc가 아닌 것</h2>
        <ul>
          <li>AI 메모리 시스템 아님</li>
          <li>RAG 시스템 아님</li>
          <li>시맨틱 검색 도구 아님</li>
          <li>skill/agent 저장 도구 아님</li>
        </ul>
      </div>
    </div>
  );
});
