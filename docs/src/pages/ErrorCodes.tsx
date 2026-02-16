import { mount } from 'lithent';
import { CodeBlock } from '@/components/CodeBlock';

export const ErrorCodes = mount(() => {
  return () => (
    <div class="page-sheet">
      <h1>Error Codes</h1>

      <p>
        All errors are emitted as a single line to <code>stderr</code> with exit code <code>1</code>.
      </p>

      <h2>Format</h2>
      <CodeBlock language="text" code={`CTXLOC_ERR <CODE>: <message>`} />

      <h2>Codes</h2>
      <table>
        <thead>
          <tr><th>Code</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>INVALID_INPUT</code></td><td>Invalid command or flag combination</td></tr>
          <tr><td><code>MISSING_KEY</code></td><td>Key required but missing</td></tr>
          <tr><td><code>NOT_IN_GIT</code></td><td>Key inference outside git repository</td></tr>
          <tr><td><code>NOT_FOUND</code></td><td>Requested key does not exist</td></tr>
          <tr><td><code>COMMAND</code></td><td>ctxbin subprocess execution failure during sync</td></tr>
          <tr><td><code>IO</code></td><td>File I/O, JSON parse, or sync apply error</td></tr>
        </tbody>
      </table>

      <h2>Examples</h2>
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
