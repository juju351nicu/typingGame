import { readFileSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createInterface } from "node:readline/promises";
import { spawn } from "node:child_process";

const BLOG_ROOT = "blog_store";
const POSTS_ROOT = path.join(BLOG_ROOT, "posts");
const POSTS_INDEX_PATH = path.join(BLOG_ROOT, "posts_index.json");
const DEFAULT_SECTION = "guide";

const slugify = (value) => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const readPostsIndex = async () => {
  const postsIndexText = await readFile(POSTS_INDEX_PATH, "utf8");
  return JSON.parse(postsIndexText);
};

const assertUniquePost = (posts, id, markdownPath) => {
  const hasSameId = posts.some((post) => post.id === id);
  if (hasSameId) {
    throw new Error(`同じ id の記事が既に存在します: ${id}`);
  }

  const hasSameUrl = posts.some((post) => post.url === markdownPath);
  if (hasSameUrl) {
    throw new Error(`同じ Markdown パスの記事が既に存在します: ${markdownPath}`);
  }
};

const createMarkdown = ({ id, section, title, date, description }) => {
  return `---
id: ${id}
title: ${title}
date: ${date}
section: ${section}
description: ${description}
---

# ${title}

${description}

---

## はじめに

ここに本文を入力します。
`;
};

const createPrompt = async () => {
  if (!process.stdin.isTTY) {
    const input = readFileSync(0, "utf8");
    const answers = input.split(/\r?\n/);
    let index = 0;

    return {
      ask: async (message) => {
        process.stdout.write(message);
        const answer = answers[index] ?? "";
        index += 1;
        process.stdout.write(`${answer}\n`);
        return answer.trim();
      },
      close: () => {},
    };
  }

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });

  const ask = async (message) => {
    return (await rl.question(message)).trim();
  };

  return {
    ask,
    close: () => rl.close(),
  };
};

const runGeneratePosts = async () => {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ["scripts/generate-posts.mjs"], {
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`posts_index.json の生成に失敗しました。code: ${code}`));
    });
  });
};

const main = async () => {
  const prompt = await createPrompt();

  try {
    const title = await prompt.ask("title: ");
    if (title === "") {
      throw new Error("title は必須です。");
    }

    const sectionInput = await prompt.ask(`section (${DEFAULT_SECTION}): `);
    const section = slugify(sectionInput || DEFAULT_SECTION);
    if (section === "") {
      throw new Error("section は英数字・空白・ハイフンを含めて入力してください。");
    }

    const description = await prompt.ask("description: ");
    if (description === "") {
      throw new Error("description は必須です。");
    }

    let id = slugify(title);
    if (id === "") {
      const manualId = await prompt.ask("id（日本語タイトルのため手入力）: ");
      id = slugify(manualId);
    }
    if (id === "") {
      throw new Error("id は英数字・空白・ハイフンを含めて入力してください。");
    }

    const posts = await readPostsIndex();
    const date = new Date().toISOString().slice(0, 10);
    const markdownPath = path.posix.join(BLOG_ROOT, "posts", section, `${id}.md`);
    assertUniquePost(posts, id, markdownPath);

    const markdownFilePath = path.join(POSTS_ROOT, section, `${id}.md`);
    await mkdir(path.dirname(markdownFilePath), { recursive: true });
    await writeFile(
      markdownFilePath,
      createMarkdown({ id, section, title, date, description }),
      "utf8"
    );

    // Markdownを唯一の情報源にして、記事一覧は生成スクリプトで作り直す。
    await runGeneratePosts();

    console.log(`Created: ${markdownFilePath}`);
  } finally {
    prompt.close();
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
