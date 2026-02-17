import { mount } from 'lithent';
import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const CtxCommandsKo = mount(() => {
  return () => (
    <div class="page-sheet">
      <h1>ctx 명령어</h1>

      <p><code>ctxloc</code>은 <code>ctx</code> 리소스만 지원합니다.</p>

      <h2>키 추론</h2>
      <p>
        키를 생략하면 git 메타데이터로 자동 추론합니다.
        자세한 내용은 <span onClick={() => navigateTo('/ko/guide/key-inference')} class="text-indigo-600 hover:underline cursor-pointer">키 추론</span> 참고.
      </p>
      <CodeBlock
        language="text"
        code={`key = {project}/{branch}
project = package.json "name" 또는 폴더명
branch  = git rev-parse --abbrev-ref HEAD`}
      />

      <h2>Load</h2>
      <CodeBlock
        language="bash"
        code={`$ npx ctxloc ctx load
$ npx ctxloc ctx load my-project/main
$ npx ctxloc ctx load --meta`}
      />

      <h2>Save</h2>
      <p>입력 방식은 <code>--value</code>, <code>--file</code>, stdin 중 정확히 하나여야 합니다.</p>
      <CodeBlock
        language="bash"
        code={`$ npx ctxloc ctx save --value "markdown"
$ npx ctxloc ctx save --file context.md
$ cat context.md | npx ctxloc ctx save
$ npx ctxloc ctx save my-project/main --value "markdown"`}
      />

      <h2>Append</h2>
      <CodeBlock
        language="bash"
        code={`$ npx ctxloc ctx save --append --value "more"
$ npx ctxloc ctx save my-project/main --append --file note.md`}
      />

      <h2>List</h2>
      <CodeBlock language="bash" code={`$ npx ctxloc ctx list`} />

      <h2>Delete</h2>
      <CodeBlock
        language="bash"
        code={`$ npx ctxloc ctx delete
$ npx ctxloc ctx delete my-project/main`}
      />

      <h2>동기화</h2>
      <p><code>ctxloc sync</code>로 로컬 ctx와 원격 ctxbin 저장소를 동기화합니다.</p>
      <CodeBlock
        language="bash"
        code={`$ npx ctxloc sync
$ npx ctxloc sync --missing copy   # 기본값
$ npx ctxloc sync --missing delete # 한쪽만 있는 키 삭제
$ npx ctxloc sync --missing skip   # 한쪽만 있는 키 유지`}
      />
    </div>
  );
});
