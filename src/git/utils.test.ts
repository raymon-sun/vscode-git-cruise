import { deepStrictEqual } from "assert";
import { Uri } from "vscode";
import {
	createChangeFileTree,
	PathCollection,
	PathType,
	compareFileTreeNode,
	FileNode,
	FolderNode,
} from "./utils";

suite("Git utils", () => {
	test("should create a file tree when given change list", () => {
		const mockChanges = [
			{
				status: 1,
				uri: {
					path: "/projects/public/sword-practice/README.md",
				},
			},
			{
				status: 5,
				uri: {
					path: "/projects/public/sword-practice/src/hands-up.ts",
				},
			},
			{
				status: 2,
				uri: {
					path: "/projects/public/sword-practice/assets/beans",
				},
			},
			{
				status: 3,
				uri: {
					path: "/projects/public/sword-practice/src/actions/throw.ts",
				},
			},
		];
		const tree = createChangeFileTree(
			mockChanges as any[],
			"/projects/public/sword-practice"
		);

		deepStrictEqual<PathCollection>(tree, {
			src: {
				type: PathType.FOLDER,
				path: "/projects/public/sword-practice/src",
				children: {
					actions: {
						type: PathType.FOLDER,
						path: "/projects/public/sword-practice/src/actions",
						children: {
							["throw.ts"]: {
								type: PathType.FILE,
								status: 3,
								uri: {
									path: "/projects/public/sword-practice/src/actions/throw.ts",
								} as Uri,
							},
						},
					},
					["hands-up.ts"]: {
						type: PathType.FILE,
						status: 5,
						uri: {
							path: "/projects/public/sword-practice/src/hands-up.ts",
						} as Uri,
					},
				},
			},
			assets: {
				type: PathType.FOLDER,
				path: "/projects/public/sword-practice/assets",
				children: {
					beans: {
						type: PathType.FILE,
						status: 2,
						uri: {
							path: "/projects/public/sword-practice/assets/beans",
						} as Uri,
					},
				},
			},
			["README.md"]: {
				type: PathType.FILE,
				status: 1,
				uri: {
					path: "/projects/public/sword-practice/README.md",
				} as Uri,
			},
		});
	});

	test("should sort the given file nodes", () => {
		deepStrictEqual(
			compareFileTreeNode(
				[
					"utils",
					{
						type: PathType.FOLDER,
					} as FolderNode,
				],
				[
					"utils",
					{
						type: PathType.FILE,
					} as FileNode,
				]
			),
			-1
		);

		deepStrictEqual(
			compareFileTreeNode(
				[
					"tests",
					{
						type: PathType.FILE,
					} as FileNode,
				],
				[
					"tests",
					{
						type: PathType.FOLDER,
					} as FolderNode,
				]
			),
			1
		);

		deepStrictEqual(
			compareFileTreeNode(
				[
					"state",
					{
						type: PathType.FILE,
					} as FileNode,
				],
				[
					"tsconfig.json",
					{
						type: PathType.FILE,
					} as FileNode,
				]
			),
			-1
		);

		deepStrictEqual(
			compareFileTreeNode(
				[
					".gitignore",
					{
						type: PathType.FILE,
					} as FileNode,
				],
				[
					".editorconfig",
					{
						type: PathType.FILE,
					} as FileNode,
				]
			),
			1
		);
	});
});
