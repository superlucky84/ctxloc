import { mount } from 'lithent';
import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const CtxCommands = mount(() => {
  return () => (
    <div class="page-sheet">
      <h1>ctx Commands</h1>

      <p>
        <code>ctxloc</code> supports only one resource: <code>ctx</code>.
      </p>

      <h2>Key Inference</h2>
      <p>
        If key is omitted, ctxloc infers it from git metadata.
        See <span onClick={() => navigateTo('/guide/key-inference')} class="text-indigo-600 hover:underline cursor-pointer">Key Inference</span>.
      </p>
      <CodeBlock
        language="text"
        code={`key = {project}/{branch}
project = package.json "name" field, or folder name
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
      <p>Exactly one input method must be used: <code>--value</code>, <code>--file</code>, or stdin.</p>
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
      <CodeBlock
        language="bash"
        code={`$ npx ctxloc ctx list`}
      />

      <h2>Delete</h2>
      <CodeBlock
        language="bash"
        code={`$ npx ctxloc ctx delete
$ npx ctxloc ctx delete my-project/main`}
      />

      <h2>Sync Command</h2>
      <p>Use <code>ctxloc sync</code> to synchronize local ctx with remote ctxbin storage.</p>
      <CodeBlock
        language="bash"
        code={`$ npx ctxloc sync`}
      />
    </div>
  );
});
