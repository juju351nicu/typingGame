import { readFileSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createInterface } from "node:readline/promises";

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

const formatPostDate = (date) => {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
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

const createMarkdown = ({ title, date, description }) => {
  return `# ${title}

#### ${date}

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
    const date = formatPostDate(new Date());
    const markdownPath = path.posix.join(BLOG_ROOT, "posts", section, `${id}.md`);
    assertUniquePost(posts, id, markdownPath);

    const post = {
      id,
      section,
      date,
      title,
      description,
      url: markdownPath,
    };

    const markdownFilePath = path.join(POSTS_ROOT, section, `${id}.md`);
    await mkdir(path.dirname(markdownFilePath), { recursive: true });
    await writeFile(
      markdownFilePath,
      createMarkdown({ title, date, description }),
      "utf8"
    );

    posts.push(post);
    await writeFile(POSTS_INDEX_PATH, `${JSON.stringify(posts, null, 2)}\n`, "utf8");

    console.log(`Created: ${markdownFilePath}`);
    console.log(`Updated: ${POSTS_INDEX_PATH}`);
  } finally {
    prompt.close();
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
