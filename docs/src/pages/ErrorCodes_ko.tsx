import { mount } from 'lithent';
import { CodeBlock } from '@/components/CodeBlock';

export const ErrorCodesKo = mount(() => {
  return () => (
    <div class="page-sheet">
      <h1>에러 코드</h1>

      <p>모든 에러는 <code>stderr</code>에 한 줄 형식으로 출력되며 종료 코드는 <code>1</code>입니다.</p>

      <h2>형식</h2>
      <CodeBlock language="text" code={`CTXLOC_ERR <CODE>: <message>`} />

      <h2>코드 목록</h2>
      <table>
        <thead>
          <tr><th>코드</th><th>설명</th></tr>
        </thead>
        <tbody>
          <tr><td><code>INVALID_INPUT</code></td><td>잘못된 명령/플래그 조합</td></tr>
          <tr><td><code>MISSING_KEY</code></td><td>필수 키 누락</td></tr>
          <tr><td><code>NOT_IN_GIT</code></td><td>git 외부에서 키 추론 시도</td></tr>
          <tr><td><code>NOT_FOUND</code></td><td>요청한 키가 없음</td></tr>
          <tr><td><code>COMMAND</code></td><td>sync 중 ctxbin 하위 명령 실행 실패</td></tr>
          <tr><td><code>IO</code></td><td>파일 I/O, JSON 파싱, sync 반영 실패</td></tr>
        </tbody>
      </table>

      <h2>예시</h2>
      <CodeBlock
        language="text"
        code={`CTXLOC_ERR NOT_IN_GIT: not inside a git repository
CTXLOC_ERR NOT_FOUND: no value for ctx:my-project/main
CTXLOC_ERR COMMAND: ctxbin command failed: ...
CTXLOC_ERR IO: invalid JSON in store file: ...`}
      />
    </div>
  );
});
