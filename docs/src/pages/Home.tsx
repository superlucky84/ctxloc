import { mount } from 'lithent';
import { CodeBlock } from '@/components/CodeBlock';
import { navigateTo } from '@/store';

export const Home = mount(() => {
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
          Local-first context CLI for AI agents.
          Save branch-scoped ctx locally, then sync with ctxbin storage when needed.
        </p>

        <div class="flex flex-wrap justify-center gap-4 mb-12">
          <button
            onClick={() => navigateTo('/guide/quick-start')}
            class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Get Started
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
        <h2 class="text-indigo-700 dark:text-indigo-300">Core Workflow</h2>
        <ol>
          <li>Save ctx locally while working</li>
          <li>Run <code>ctxloc sync</code> to converge local and remote</li>
          <li>Continue work on another machine/agent with synced ctx</li>
        </ol>
        <CodeBlock
          language="bash"
          code={`$ npx ctxloc ctx save --value "summary + next"
$ npx ctxloc sync
$ npx ctxloc ctx load`}
        />
      </div>

      <div class="mb-12 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h2>ctxbin Relationship</h2>
        <p>
          <strong>ctxbin</strong> is the original remote storage CLI.
          <strong> ctxloc</strong> is a local-first companion focused on <code>ctx</code> plus deterministic sync.
        </p>
        <ul>
          <li>ctxloc handles local ctx operations and sync orchestration.</li>
          <li>ctxbin remains an independent project and does not need ctxloc-specific behavior.</li>
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
        <h2>AI Agent Usage</h2>
        <p>
          Ask your agent to read built-in usage and persist current context:
        </p>
        <CodeBlock
          language="text"
          code={`"Run npx ctxloc help, follow the guide, then save current context."`}
        />
      </div>

      <div class="grid md:grid-cols-2 gap-6 mb-12">
        <div class="p-6 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors" onClick={() => navigateTo('/commands/ctx')}>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            ctx Commands
          </h3>
          <p class="text-gray-600 dark:text-gray-400">
            Save/load/list/delete branch-scoped ctx with metadata.
          </p>
        </div>

        <div class="p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Deterministic Sync
          </h3>
          <p class="text-gray-600 dark:text-gray-400">
            Conflict resolution by metadata timestamp (`savedAt`) with deterministic tie-breaks.
          </p>
        </div>

        <div class="p-6 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors" onClick={() => navigateTo('/guide/key-inference')}>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Key Inference
          </h3>
          <p class="text-gray-600 dark:text-gray-400">
            Auto key: <code>{'{project}/{branch}'}</code> from package name/folder + git branch.
          </p>
        </div>

        <div class="p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            ctxloc-only Sync Entry
          </h3>
          <p class="text-gray-600 dark:text-gray-400">
            Sync orchestration is exposed only by <code>ctxloc sync</code>.
          </p>
        </div>
      </div>

      <div class="mb-12">
        <h2>What ctxloc is NOT</h2>
        <ul>
          <li>Not AI memory</li>
          <li>Not a RAG system</li>
          <li>Not semantic search</li>
          <li>Not skill/agent storage CLI</li>
        </ul>
      </div>
    </div>
  );
});
