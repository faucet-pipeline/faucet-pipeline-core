export interface FaucetPlugin<T> {
	(config: T[], assetManager: AssetManager, options: FaucetPluginOptions): FaucetPluginFunc
}

export interface FaucetPluginFunc {
	(filepaths: string[]): Promise<unknown>
}

export interface FaucetPluginOptions {
	sourcemaps: boolean,
	compact: boolean
}

export interface AssetManager {
	resolvePath: (path: string, opts?: ResolvePathOpts) => string
	writeFile: (targetPath: string, content: Buffer, options: WriteFileOpts) => Promise<unknown>
}

export interface ResolvePathOpts {
	enforceRelative?: boolean
}

export interface WriteFileOpts {
	targetDir: string,
	fingerprint?: boolean
}
