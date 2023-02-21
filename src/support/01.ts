import { Tagged } from "@effect-ts/core/Case"
import * as O from "@effect-ts/core/Option"

export namespace Config {
	// -------------------------------------------------------------------------------------
	// Model
	// -------------------------------------------------------------------------------------
	export interface Config<A> {
		readonly _A: A
	}

	// -------------------------------------------------------------------------------------
	// Constructors
	// -------------------------------------------------------------------------------------
	export const string = <A>(variableName: string): Config<string> => null as any

	export const number = <A>(variableName: string): Config<number> => null as any

	export const boolean = <A>(variableName: string): Config<boolean> =>
		null as any

	export const literal = <A extends readonly [string, ...string[]]>(
		...allowedValues: A
	): Config<A[number]> => null as any

	export const always = <A>(a: A): Config<A> => null as any

	// -------------------------------------------------------------------------------------
	// Combinators
	// -------------------------------------------------------------------------------------
	export const struct = <A extends Record<string, Config<any>>>(
		struct: A,
	): Config<{ [K in keyof A]: A[K] extends Config<infer B> ? B : never }> =>
		null as any

	export const optional = <A>(config: Config<A>): Config<O.Option<A>> =>
		null as any

	export const orElse =
		<B>(fb: Config<B>) =>
		<A>(fa: Config<A>): Config<A | B> =>
			null as any

	export const TODO = null as any
}

export namespace FS {
	// -------------------------------------------------------------------------------------
	// Model
	// -------------------------------------------------------------------------------------
	export class Path extends Tagged("Path")<{
		path: string
		filename: string
		extension: string
	}> {}

	export interface FileSystem<A> {
		readonly _A: A
	}

	// -------------------------------------------------------------------------------------
	// Constructors
	// -------------------------------------------------------------------------------------
	export const readFile = (path: Path): FileSystem<string> => null as any

	export const writeFile = (path: Path, content: string): FileSystem<void> =>
		null as any

	export const deleteFile = (path: Path): FileSystem<void> => null as any

	// -------------------------------------------------------------------------------------
	// Combinators
	// -------------------------------------------------------------------------------------
	export const chain =
		<A, B>(fab: (a: A) => FileSystem<B>) =>
		(fa: FileSystem<A>): FileSystem<B> =>
			null as any

	export const zipRight =
		<B>(fb: FileSystem<B>) =>
		<A>(fa: FileSystem<A>): FileSystem<B> =>
			null as any

	export const TODO = null as any
}
