import { mount } from 'lithent';
import { CodeBlock } from '@/components/CodeBlock';

export const KeyInference = mount(() => {
  return () => (
    <div class="page-sheet">
      <h1>Key Inference</h1>

      <p>
        For <code>ctx</code> commands, omitted keys are inferred from git repository metadata.
      </p>

      <h2>Key Format</h2>
      <CodeBlock language="text" code={`key = {project}/{branch}`} />

      <h2>Project Name Resolution</h2>
      <ol>
        <li>If <code>package.json</code> exists at git root and has <code>name</code>, use it</li>
        <li>Otherwise use git root folder name</li>
      </ol>

      <h2>Branch Resolution</h2>
      <CodeBlock language="bash" code={`git rev-parse --abbrev-ref HEAD`} />

      <h2>Warning Case</h2>
      <p>
        If package name differs from folder name, ctxloc prints a warning and uses package name.
      </p>
      <CodeBlock
        language="text"
        code={`CTXLOC_WARN: package.json name "my-app" differs from folder name "repo". Using "my-app".`}
      />

      <h2>Failure Case</h2>
      <p>Outside git, omitted key fails with <code>NOT_IN_GIT</code>.</p>
      <CodeBlock language="text" code={`CTXLOC_ERR NOT_IN_GIT: not inside a git repository`} />

      <h2>Explicit Key</h2>
      <CodeBlock
        language="bash"
        code={`$ npx ctxloc ctx save my-project/main --value "context"
$ npx ctxloc ctx load my-project/main`}
      />
    </div>
  );
});
