import { getFilterCommandsDisposable } from "./filter";
import { getInputCommandsDisposable } from "./input";
import { getSwitchCommandsDisposable } from "./switch";
import { getClearCommandsDisposable } from "./clear";

export function getCommandDisposables() {
	return [
		...getClearCommandsDisposable(),
		...getFilterCommandsDisposable(),
		...getSwitchCommandsDisposable(),
		...getInputCommandsDisposable(),
	];
}
