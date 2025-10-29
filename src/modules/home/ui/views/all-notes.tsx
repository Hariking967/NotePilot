"use client";

import React from "react";

// Mammoth is loaded dynamically at runtime in the import handler so it doesn't
// break Turbopack/SSR. See onImport below.

type Node = {
  id: string;
  name: string;
  type: "folder" | "file";
  children?: Node[];
  content?: string;
};

function findNode(nodes: Node[], id: string | null): Node | null {
  if (!id) return null;
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.type === "folder" && n.children) {
      const r = findNode(n.children, id);
      if (r) return r;
    }
  }
  return null;
}

function findParent(
  nodes: Node[],
  childId: string | null,
  parent: Node | null = null
): Node | null {
  if (!childId) return null;
  for (const n of nodes) {
    if (n.id === childId) return parent;
    if (n.type === "folder" && n.children) {
      const r = findParent(n.children, childId, n);
      if (r) return r;
    }
  }
  return null;
}

export default function AllNotes() {
  const [tree, setTree] = React.useState<Node[]>(() => [
    { id: "root-folder-1", name: "My Documents", type: "folder", children: [] },
  ]);

  const [currentFolderId, setCurrentFolderId] = React.useState<string | null>(
    tree[0].id
  );
  const [openFileId, setOpenFileId] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  function createFolder() {
    const name = window.prompt("Folder name", "New Folder");
    if (!name) return;
    const id = crypto.randomUUID();
    setTree((prev) => {
      const copy = JSON.parse(JSON.stringify(prev)) as Node[];
      const parent = findNode(copy, currentFolderId);
      const newFolder: Node = { id, name, type: "folder", children: [] };
      if (parent && parent.type === "folder") {
        parent.children = parent.children || [];
        parent.children.push(newFolder);
      } else {
        copy.push(newFolder);
      }
      return copy;
    });
  }

  function createFile() {
    const name = window.prompt("File name (without extension)", "Document");
    if (!name) return;
    const filename = name.endsWith(".docx") ? name : `${name}.docx`;
    const id = crypto.randomUUID();
    setTree((prev) => {
      const copy = JSON.parse(JSON.stringify(prev)) as Node[];
      const parent = findNode(copy, currentFolderId);
      const fileNode: Node = {
        id,
        name: filename,
        type: "file",
        content: "<p></p>",
      };
      if (parent && parent.type === "folder") {
        parent.children = parent.children || [];
        parent.children.push(fileNode);
      } else {
        copy.push(fileNode);
      }
      return copy;
    });
    setOpenFileId(id);
  }

  async function onImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".docx") && !file.name.endsWith(".doc")) {
      alert("Please upload a .docx file");
      return;
    }

    const arrayBuffer = await file.arrayBuffer();
    const mammoth = await import("mammoth");
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const html = result.value;

    const id = crypto.randomUUID();
    setTree((prev) => {
      const copy = JSON.parse(JSON.stringify(prev)) as Node[];
      const parent = findNode(copy, currentFolderId);
      const fileNode: Node = {
        id,
        name: file.name,
        type: "file",
        content: html,
      };
      if (parent && parent.type === "folder") {
        parent.children = parent.children || [];
        parent.children.push(fileNode);
      } else {
        copy.push(fileNode);
      }
      return copy;
    });
    setOpenFileId(id);
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const currentFolder = findNode(tree, currentFolderId);
  const parent = findParent(tree, currentFolderId);

  const openFile = findNode(tree, openFileId);

  function openFolder(folderId: string) {
    setCurrentFolderId(folderId);
    setOpenFileId(null);
  }

  function goUp() {
    if (!currentFolderId) return;
    const p = findParent(tree, currentFolderId);
    setCurrentFolderId(p ? p.id : null);
    setOpenFileId(null);
  }

  function updateFileContent(id: string, html: string) {
    setTree((prev) => {
      const copy = JSON.parse(JSON.stringify(prev)) as Node[];
      const node = findNode(copy, id);
      if (node && node.type === "file") node.content = html;
      return copy;
    });
  }

  return (
    <div className="flex h-full w-full">
      <aside className="w-80 border-r border-neutral-800 p-4 bg-neutral-950 text-white flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={createFolder}
            className="rounded bg-emerald-700 px-3 py-1 text-sm"
          >
            Create Folder
          </button>
          <button
            onClick={createFile}
            className="rounded bg-emerald-700 px-3 py-1 text-sm"
          >
            Create File
          </button>
          <label className="rounded bg-emerald-600 px-3 py-1 text-sm cursor-pointer">
            Import File
            <input
              ref={fileInputRef}
              onChange={onImport}
              type="file"
              accept=".docx,.doc"
              className="hidden"
            />
          </label>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <button onClick={goUp} className="text-sm text-neutral-300">
            Up
          </button>
          <div className="text-sm text-neutral-400">
            {currentFolder ? currentFolder.name : "Root"}
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="space-y-2">
            {(currentFolder?.children ?? tree).map((n) => (
              <div
                key={n.id}
                className={`flex items-center justify-between rounded px-2 py-1 ${
                  openFileId === n.id
                    ? "bg-neutral-800"
                    : "hover:bg-neutral-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <button
                    className="text-left flex-1"
                    onClick={() =>
                      n.type === "folder"
                        ? openFolder(n.id)
                        : setOpenFileId(n.id)
                    }
                  >
                    <span className="mr-2">
                      {n.type === "folder" ? "📁" : "📄"}
                    </span>
                    {n.name}
                  </button>
                </div>
                <div className="text-xs text-neutral-500">{n.type}</div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 bg-neutral-900 text-white overflow-auto flex flex-col">
        {!openFile ? (
          <div className="flex h-full flex-col items-center justify-center text-neutral-400">
            <h2 className="text-2xl font-semibold">No document selected</h2>
            <p className="mt-2">
              Select or import a .docx file or create one. The editor simulates
              an A4 document view.
            </p>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            <div className="mb-4 w-full flex items-center justify-between max-w-[900px]">
              <h2 className="text-xl font-semibold">{openFile.name}</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const blob = new Blob([openFile.content || ""], {
                      type: "text/html",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download =
                      openFile.name.replace(/\.docx?$/, "") + ".html";
                    a.click();
                  }}
                  className="rounded bg-emerald-600 px-3 py-1 text-sm"
                >
                  Download
                </button>
              </div>
            </div>

            <div className="bg-neutral-700 p-6 rounded shadow-sm flex justify-center w-full">
              <div
                className="bg-white text-black shadow w-[794px] h-[1123px] p-10 overflow-auto"
                role="document"
              >
                <div
                  contentEditable
                  suppressContentEditableWarning
                  className="min-h-full outline-none"
                  onInput={(e) =>
                    updateFileContent(
                      openFile.id,
                      (e.target as HTMLElement).innerHTML
                    )
                  }
                  dangerouslySetInnerHTML={{ __html: openFile.content || "" }}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
