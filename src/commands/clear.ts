import { commands } from "vscode";

import { container } from "../container/inversify.config";
import { DisposableController } from "../disposables";

export const CLEAR_ALL_SELECTIONS_ID = "git-history.history.clear";

export function getClearCommandsDisposable() {
  const disposables = container.get(DisposableController);

  return [
    commands.registerCommand(CLEAR_ALL_SELECTIONS_ID, () => {
      const webview = disposables.getWebviewInstance();
      webview?.postMessage({ type: 'clear' });
    }),
  ];
}
