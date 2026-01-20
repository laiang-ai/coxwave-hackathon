export type LogoImageInput = {
	id: string;
	name: string;
	dataUrl: string;
};

type LogoImageRecord = {
	id: string;
	name: string;
	blob: Blob;
	updatedAt: number;
};

const DB_NAME = "brand-kit";
const STORE_NAME = "logo-images";
const DB_VERSION = 1;

const canUseIndexedDb = () =>
	typeof window !== "undefined" && "indexedDB" in window;

const openLogoDb = () =>
	new Promise<IDBDatabase>((resolve, reject) => {
		if (!canUseIndexedDb()) {
			reject(new Error("IndexedDB not available"));
			return;
		}

		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME, { keyPath: "id" });
			}
		};

		request.onsuccess = () => resolve(request.result);
		request.onerror = () =>
			reject(request.error ?? new Error("Failed to open logo database"));
	});

const dataUrlToBlob = (dataUrl: string) => {
	const commaIndex = dataUrl.indexOf(",");
	if (commaIndex === -1) {
		return new Blob();
	}

	const header = dataUrl.slice(0, commaIndex);
	const data = dataUrl.slice(commaIndex + 1);
	const mimeMatch = header.match(/data:([^;]+)(;base64)?/);
	const mimeType = mimeMatch?.[1] ?? "application/octet-stream";
	const isBase64 = header.includes(";base64");

	if (!data) {
		return new Blob([], { type: mimeType });
	}

	if (!isBase64) {
		return new Blob([decodeURIComponent(data)], { type: mimeType });
	}

	const binary = atob(data);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i += 1) {
		bytes[i] = binary.charCodeAt(i);
	}
	return new Blob([bytes], { type: mimeType });
};

const toBlob = async (dataUrl: string) => {
	if (dataUrl.startsWith("data:")) {
		return dataUrlToBlob(dataUrl);
	}

	if (dataUrl.startsWith("blob:")) {
		const response = await fetch(dataUrl);
		return await response.blob();
	}

	throw new Error("Unsupported logo image URL");
};

export const storeLogoImages = async (images: LogoImageInput[]) => {
	if (!canUseIndexedDb()) return;

	try {
		const entries = await Promise.all(
			images.map(async (image) => ({
				id: image.id,
				name: image.name,
				blob: await toBlob(image.dataUrl),
				updatedAt: Date.now(),
			})),
		);

		const db = await openLogoDb();

		await new Promise<void>((resolve, reject) => {
			const transaction = db.transaction(STORE_NAME, "readwrite");
			const store = transaction.objectStore(STORE_NAME);
			store.clear();

			for (const entry of entries) {
				store.put(entry);
			}

			transaction.oncomplete = () => resolve();
			transaction.onerror = () =>
				reject(
					transaction.error ?? new Error("Failed to store logo images"),
				);
			transaction.onabort = () =>
				reject(
					transaction.error ?? new Error("Failed to store logo images"),
				);
		});

		db.close();
	} catch (error) {
		console.error("Failed to store logo images:", error);
	}
};

export const loadLogoImages = async () => {
	if (!canUseIndexedDb()) {
		return { images: [] as LogoImageInput[], revoke: () => {} };
	}

	try {
		const db = await openLogoDb();

		const records = await new Promise<LogoImageRecord[]>((resolve, reject) => {
			const transaction = db.transaction(STORE_NAME, "readonly");
			const store = transaction.objectStore(STORE_NAME);
			const request = store.getAll();

			request.onsuccess = () =>
				resolve((request.result ?? []) as LogoImageRecord[]);
			request.onerror = () =>
				reject(request.error ?? new Error("Failed to load logo images"));
		});

		db.close();

		const objectUrls: string[] = [];
		const images = records.map((record) => {
			const url = URL.createObjectURL(record.blob);
			objectUrls.push(url);
			return {
				id: record.id,
				name: record.name,
				dataUrl: url,
			};
		});

		return {
			images,
			revoke: () => {
				for (const url of objectUrls) {
					URL.revokeObjectURL(url);
				}
			},
		};
	} catch (error) {
		console.error("Failed to load logo images:", error);
		return { images: [] as LogoImageInput[], revoke: () => {} };
	}
};

export const clearLogoImages = async () => {
	if (!canUseIndexedDb()) return;

	try {
		const db = await openLogoDb();

		await new Promise<void>((resolve, reject) => {
			const transaction = db.transaction(STORE_NAME, "readwrite");
			const store = transaction.objectStore(STORE_NAME);
			store.clear();

			transaction.oncomplete = () => resolve();
			transaction.onerror = () =>
				reject(
					transaction.error ?? new Error("Failed to clear logo images"),
				);
			transaction.onabort = () =>
				reject(
					transaction.error ?? new Error("Failed to clear logo images"),
				);
		});

		db.close();
	} catch (error) {
		console.error("Failed to clear logo images:", error);
	}
};
