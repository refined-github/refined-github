/** Converts a calver extension version into the date it was released: `25.3.10` is 2025-03-10 and `25.3` is 2025-03-01 */
export default function versionToDate(version: string): Date {
	const [year, month, day = 1] = version.split('.').map(Number);
	// Date constructor uses 0-based months
	return new Date(2000 + year, month - 1, day);
}
