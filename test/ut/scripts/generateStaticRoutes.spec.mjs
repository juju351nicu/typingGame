import {
  createStaticRoutePaths,
  generateStaticRoutes,
} from "../../../scripts/generate-static-routes.mjs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const temporaryDirectories = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, {
        recursive: true,
        force: true,
      })
    )
  );
});

describe("createStaticRoutePaths", () => {
  it("固定画面と記事の静的routeを生成する", () => {
    const routes = createStaticRoutePaths([
      { section: "guide", id: "first-post" },
      { section: "features", id: "second_post" },
    ]);

    expect(routes).toContain("blogPostList");
    expect(routes).toContain("admin/notifications");
    expect(routes).toContain("guide/first-post");
    expect(routes).toContain("features/second_post");
  });

  it.each([
    { section: "../guide", id: "post" },
    { section: "guide", id: "post/child" },
    { section: "guide", id: ".." },
  ])("出力先を逸脱する記事routeを拒否する", (post) => {
    expect(() => createStaticRoutePaths([post])).toThrow(/静的routeとして不正/);
  });
});

describe("generateStaticRoutes", () => {
  it("各routeのindex.htmlとSPA fallbackを同じentryから生成する", async () => {
    const rootDirectory = await mkdtemp(
      path.join(os.tmpdir(), "typing-static-routes-")
    );
    temporaryDirectories.push(rootDirectory);
    const distDirectory = path.join(rootDirectory, "dist");
    const postsIndexPath = path.join(rootDirectory, "posts-index.json");
    await writeFile(
      postsIndexPath,
      JSON.stringify([{ section: "guide", id: "sample-post" }]),
      "utf8"
    );
    await mkdir(distDirectory, { recursive: true });
    await writeFile(
      path.join(distDirectory, "index.html"),
      "<!doctype html><title>Typing</title>",
      "utf8"
    );

    const routes = await generateStaticRoutes({
      distDir: distDirectory,
      postsIndexPath,
    });

    expect(routes).toContain("guide/sample-post");
    await expect(
      readFile(
        path.join(distDirectory, "guide", "sample-post", "index.html"),
        "utf8"
      )
    ).resolves.toContain("<title>Typing</title>");
    await expect(
      readFile(path.join(distDirectory, "404.html"), "utf8")
    ).resolves.toContain("<title>Typing</title>");
  });
});
