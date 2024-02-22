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
	export const string = (_variableName: string): Config<string> =>
		undefined as never

	export const number = (_variableName: string): Config<number> =>
		undefined as never

	export const boolean = (_variableName: string): Config<boolean> =>
		undefined as never

	export const literal = <A extends readonly [string, ...string[]]>(
		..._allowedValues: A
	): Config<A[number]> => undefined as never

	export const always = <A>(_a: A): Config<A> => undefined as never

	// -------------------------------------------------------------------------------------
	// Combinators
	// -------------------------------------------------------------------------------------
	export const struct = <A extends Record<string, Config<any>>>(
		_struct: A,
	): Config<{ [K in keyof A]: A[K] extends Config<infer B> ? B : never }> =>
		undefined as never

	export const optional = <A>(_config: Config<A>): Config<O.Option<A>> =>
		undefined as never

	export const orElse =
		<B>(_fb: Config<B>) =>
		<A>(_fa: Config<A>): Config<A | B> =>
			undefined as never

	export const TODO = undefined as never
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
	export const readFile = (_path: Path): FileSystem<string> =>
		undefined as never

	export const writeFile = (_path: Path, _content: string): FileSystem<void> =>
		undefined as never

	export const deleteFile = (_path: Path): FileSystem<void> =>
		undefined as never

	// -------------------------------------------------------------------------------------
	// Combinators
	// -------------------------------------------------------------------------------------
	export const chain =
		<A, B>(_fab: (a: A) => FileSystem<B>) =>
		(_fa: FileSystem<A>): FileSystem<B> =>
			undefined as never

	export const zipRight =
		<B>(_fb: FileSystem<B>) =>
		<A>(_fa: FileSystem<A>): FileSystem<B> =>
			undefined as never

	export const TODO = undefined as never
}

export namespace GUARD {
	export const TODO = undefined as never
}

export namespace API {
	export const TODO = undefined as never
}


export namespace CSRequestFilterDSL {
	 // -------------------------------------------------------------------------------------
	 // Model
	 // -------------------------------------------------------------------------------------
	 export class SupportRequest extends Tagged("SupportRequest")<{
			object: string
			body: string
			from: string
			requestedAt: Date
	 }> {}
	 
	 // In reality this would most likely be asynchronous to support complex rules but good enough for our example
	 export type EmailFilter = (request: SupportRequest) => boolean
	 
	 // -------------------------------------------------------------------------------------
	 // Constructors
	 // -------------------------------------------------------------------------------------
	 export const objectMatches =
									 (regex: RegExp): EmailFilter =>
											supportRequest =>
												 regex.test(supportRequest.object)
	 
	 export const bodyMatches =
									 (regex: RegExp): EmailFilter =>
											supportRequest =>
												 regex.test(supportRequest.body)
	 
	 export const isTier =
									 (tier: "discovery" | "silver" | "gold"): EmailFilter =>
											supportRequest => {
												 // This is an interesting method, this should probably be asynchronous since you need to have up-to-date information
												 // on the client tier (maybe he just updated because none answered his requests), but doing the request every time
												 // for every email would probably prove wasteful
												 return supportRequest.from.toLowerCase().startsWith(tier + "-")
											}
	 
	 export const age =
									 (params: { kind: ">" | "<" | ">=" | "<="; hours: number }): EmailFilter =>
											request => {
												 // hard-coding the date to not clutter the tests/example with irrelevant code
												 const now = new Date(2024, 11, 25, 23, 15, 0).getTime() // December 25th, 2024, 11:15pm
												 const difference = now - request.requestedAt.getTime()
												 const hoursInMs = params.hours * 60 * 60 * 1000
												 
												 switch (params.kind) {
												 case ">":
														return difference > hoursInMs
												 case "<":
														return difference < hoursInMs
												 case ">=":
														return difference >= hoursInMs
												 case "<=":
														return difference <= hoursInMs
												 }
											}
	 
	 // -------------------------------------------------------------------------------------
	 // Operators
	 // -------------------------------------------------------------------------------------
	 export const and =
									 (fb: EmailFilter) =>
											(fa: EmailFilter): EmailFilter =>
												 supportRequest => {
														return fa(supportRequest) && fb(supportRequest)
												 }
	 
	 export const or =
									 (fb: EmailFilter) =>
											(fa: EmailFilter): EmailFilter =>
												 supportRequest => {
														return fa(supportRequest) || fb(supportRequest)
												 }
	 
	 export const not =
									 (fa: EmailFilter): EmailFilter =>
											supportRequest => {
												 return !fa(supportRequest)
											}
	 
	 // -------------------------------------------------------------------------------------
	 // Samples
	 // -------------------------------------------------------------------------------------
	 export const SAMPLE_DISCOVERY_CLIENT_ID = "discovery-client-id"
	 export const SAMPLE_SILVER_CLIENT_ID = "silver-client-id"
	 export const SAMPLE_GOLD_CLIENT_ID = "gold-client-id"
	 export const SAMPLE_CLIENT_ID = "client_id"
}
