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
	export const string = (_variableName: string): Config<string> => null as any

	export const number = (_variableName: string): Config<number> => null as any

	export const boolean = (_variableName: string): Config<boolean> => null as any

	export const literal = <A extends readonly [string, ...string[]]>(
		..._allowedValues: A
	): Config<A[number]> => null as any

	export const always = <A>(_a: A): Config<A> => null as any

	// -------------------------------------------------------------------------------------
	// Combinators
	// -------------------------------------------------------------------------------------
	export const struct = <A extends Record<string, Config<any>>>(
		_struct: A,
	): Config<{ [K in keyof A]: A[K] extends Config<infer B> ? B : never }> =>
		null as any

	export const optional = <A>(_config: Config<A>): Config<O.Option<A>> =>
		null as any

	export const orElse =
		<B>(_fb: Config<B>) =>
		<A>(_fa: Config<A>): Config<A | B> =>
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
	export const readFile = (_path: Path): FileSystem<string> => null as any

	export const writeFile = (_path: Path, _content: string): FileSystem<void> =>
		null as any

	export const deleteFile = (_path: Path): FileSystem<void> => null as any

	// -------------------------------------------------------------------------------------
	// Combinators
	// -------------------------------------------------------------------------------------
	export const chain =
		<A, B>(_fab: (a: A) => FileSystem<B>) =>
		(_fa: FileSystem<A>): FileSystem<B> =>
			null as any

	export const zipRight =
		<B>(_fb: FileSystem<B>) =>
		<A>(_fa: FileSystem<A>): FileSystem<B> =>
			null as any

	export const TODO = null as any
}

export namespace Cron {
	 
	 
	 
	 
	 export const TODO = null as any
}
