// components/MarkdownEditor.tsx
'use client';

import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  linkPlugin,
  tablePlugin,
  imagePlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  ListsToggle,
  CreateLink,
  InsertTable,
  InsertImage
} from '@mdxeditor/editor';

// Import the package's mandatory stylesheet
import '@mdxeditor/editor/style.css';

export default function MarkdownEditor({ value, onChange }) {
  return (
    // Added w-full, h-full, and flex-col to let the container fill the parent page layout
    <div className="w-full flex-1 h-[320px] border rounded-lg shadow-sm bg-white dark:bg-zinc-950 overflow-hidden flex flex-col">
      <MDXEditor
        markdown={value}
        onChange={onChange}
        // Added 'max-w-none' to break Tailwind's prose width bottleneck, and 'flex-1' for full height
        className="prose max-w-none w-full flex-1 p-4 dark:prose-invert focus:outline-none overflow-y-auto"
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          linkPlugin(),
          tablePlugin(),
          imagePlugin(),
          // Define an Office-style toolbar layout
          toolbarPlugin({
            toolbarContents: () => (
              <div className="flex flex-wrap items-center gap-1 bg-gray-50 dark:bg-zinc-900 p-2 border-b w-full">
                <UndoRedo />
                <div className="w-px h-6 bg-gray-300 dark:bg-zinc-700 mx-1" />
                <BlockTypeSelect />
                <div className="w-px h-6 bg-gray-300 dark:bg-zinc-700 mx-1" />
                <BoldItalicUnderlineToggles />
                <div className="w-px h-6 bg-gray-300 dark:bg-zinc-700 mx-1" />
                <ListsToggle />
                <div className="w-px h-6 bg-gray-300 dark:bg-zinc-700 mx-1" />
                <CreateLink />
                <InsertTable />
                <InsertImage />
              </div>
            )
          })
        ]}
      />
    </div>
  );
}