import path from "path";

import { inject, injectable } from "inversify";
import {
	ExtensionContext,
	Uri,
	Webview,
	WebviewView,
	WebviewViewProvider,
	window,
} from "vscode";

import { TYPES } from "../../container/types";

import { IRequestMessage } from "./utils/message";
import { Source } from "./data/source";
import { linksMap } from "./data/link";

@injectable()
export class HistoryWebviewViewProvider implements WebviewViewProvider {
	webview?: Webview;

	constructor(
		@inject(TYPES.ExtensionContext) private context: ExtensionContext,
		private source: Source
	) { }

	resolveWebviewView(webviewView: WebviewView) {
		const { extensionUri } = this.context;

		this.source.getCommitsEventEmitter().event(({ totalCount }) => {
			webviewView.description = `${totalCount} commits in total`;
		});

		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [Uri.joinPath(extensionUri, "dist")],
		};
		webviewView.webview.html = this.generateWebviewContent(
			webviewView.webview
		);
		this.webview = webviewView.webview;
		this.registerRequestHandlers(webviewView.webview);
	}

	getWebview() {
		if (!this.webview) {
			window.showErrorMessage("webview not initialized");
			return;
		}
		return this.webview;
	}

	generateWebviewContent(webview: Webview) {
		const { extensionPath } = this.context;
		const scriptPath = Uri.file(
			path.join(extensionPath, "dist", "view.js")
		);
		const scriptUri = webview.asWebviewUri(scriptPath);
		// const scriptUri = scriptPath.with({ scheme: "vscode-resource" });
		const nonce = this.getNonce();
		// TODO: enhance content policy
		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Git History</title>
			</head>
			<body>
				<div id="root"></div>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
	}

	private getNonce() {
		let text = "";
		const possible =
			"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		for (let i = 0; i < 32; i++) {
			text += possible.charAt(
				Math.floor(Math.random() * possible.length)
			);
		}
		return text;
	}

	private registerRequestHandlers(webview: Webview) {
		// TODO: complete type
		const REQUEST_HANDLER_MAP: {
			[request: string]: any;
		} = {
			initialize: () => linksMap.get(Object.getPrototypeOf(this.source)),
		};

		webview.onDidReceiveMessage(async (message: IRequestMessage) => {
			const { id, type, what, params } = message;
			if (id === undefined || type === undefined) {
				return;
			}

			switch (type) {
				case "promise":
					const response = (
						REQUEST_HANDLER_MAP[what] ||
						this.source[what as keyof Source].bind(this.source)
					)(...params);
					const result =
						response instanceof Promise ? await response : response;
					webview.postMessage({ id, type, result });
					break;
				case "subscription":
					(
						REQUEST_HANDLER_MAP[what] ||
						this.source[what as keyof Source].bind(this.source)
					)((e: any) => {
						webview.postMessage({ id, type, result: e });
					}, params);
					break;
			}
		});
	}
}
