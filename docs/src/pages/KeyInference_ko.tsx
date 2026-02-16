import { mount } from 'lithent';
import { CodeBlock } from '@/components/CodeBlock';

export const KeyInferenceKo = mount(() => {
  return () => (
    <div class="page-sheet">
      <h1>키 추론</h1>

      <p><code>ctx</code> 명령에서 키를 생략하면 git 메타데이터로 자동 추론합니다.</p>

      <h2>키 형식</h2>
      <CodeBlock language="text" code={`key = {project}/{branch}`} />

      <h2>프로젝트명 결정 순서</h2>
      <ol>
        <li>git 루트의 <code>package.json</code>에 <code>name</code>이 있으면 그 값 사용</li>
        <li>없으면 git 루트 폴더명 사용</li>
      </ol>

      <h2>브랜치 결정</h2>
      <CodeBlock language="bash" code={`git rev-parse --abbrev-ref HEAD`} />

      <h2>경고 케이스</h2>
      <p>package 이름과 폴더명이 다르면 경고를 출력하고 package 이름을 사용합니다.</p>
      <CodeBlock
        language="text"
        code={`CTXLOC_WARN: package.json name "my-app" differs from folder name "repo". Using "my-app".`}
      />

      <h2>실패 케이스</h2>
      <p>git 저장소 밖에서 키 생략 시 <code>NOT_IN_GIT</code> 에러가 발생합니다.</p>
      <CodeBlock language="text" code={`CTXLOC_ERR NOT_IN_GIT: not inside a git repository`} />

      <h2>명시적 키 사용</h2>
      <CodeBlock
        language="bash"
        code={`$ npx ctxloc ctx save my-project/main --value "context"
$ npx ctxloc ctx load my-project/main`}
      />
    </div>
  );
});
