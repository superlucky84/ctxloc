import { mount } from 'lithent';
import { CodeBlock } from '@/components/CodeBlock';

export const ConfigFileKo = mount(() => {
  return () => (
    <div class="page-sheet">
      <h1>설정 파일</h1>

      <p>
        <code>ctxloc</code>은 <code>init</code> 명령이나 전용 원격 설정 파일을 제공하지 않습니다.
        원격 sync 호환을 위해 기존 <code>ctxbin</code> 설정 파일을 폴백으로 읽습니다.
      </p>

      <h2>폴백 파일 경로</h2>
      <CodeBlock language="text" code={`~/.ctxbin/config.json`} />

      <h2>기대 형식</h2>
      <CodeBlock
        language="json"
        code={`{
  "store_url": "https://your-redis.upstash.io",
  "store_token": "your-token"
}`}
      />

      <h2>수동 설정</h2>
      <CodeBlock
        language="bash"
        code={`$ mkdir -p ~/.ctxbin
$ cat > ~/.ctxbin/config.json << EOF
{
  "store_url": "https://your-redis.upstash.io",
  "store_token": "your-token"
}
EOF`}
      />

      <h2>자동화 환경 권장</h2>
      <p>CI/에이전트 워크플로우에서는 환경 변수 사용을 권장합니다.</p>
    </div>
  );
});
