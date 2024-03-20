import { Tagged } from "@effect-ts/core/Case"
import * as E from "@effect-ts/core/Either"
import { pipe, constant } from "@effect-ts/core/Function"
import * as Rec from "@effect-ts/core/Collections/Immutable/Dictionary"
import { Branded } from "@effect-ts/core/Branded"
import { matchTag } from "@effect-ts/core/Utils"

export namespace Config {
	// -------------------------------------------------------------------------------------
	// Model
	// -------------------------------------------------------------------------------------
	export namespace FailureKind {
		export class Missing extends Tagged("Missing")<{ variableName: string }> {}
		export class Invalid extends Tagged("Invalid")<{
			variableName: string
			error: string
		}> {}
		export type FailureKind = Missing | Invalid
	}
	export namespace Result {
		export class Success<A> extends Tagged("Success")<{ a: A }> {}
		export class Failure<A> extends Tagged("Failure")<{ error: A }> {}
		export type Result<E, A> = Failure<E> | Success<A>
	}

	export interface Config<A> {
		(env: Record<string, string>): E.Either<FailureKind.FailureKind, A>
	}

	// -------------------------------------------------------------------------------------
	// Constructors
	// -------------------------------------------------------------------------------------
	export const string =
		(variableName: string): Config<string> =>
		env =>
			pipe(
				env[variableName],
				E.fromNullable(constant(new FailureKind.Missing({ variableName }))),
			)

	export const number =
		(variableName: string): Config<number> =>
		env => {
			const value = env[variableName]
			if (!value) {
				return E.left(new FailureKind.Missing({ variableName }))
			}
			const parsedValue = parseInt(value)
			if (isNaN(parsedValue))
				return E.left(
					new FailureKind.Invalid({
						error: "Must be a number",
						variableName,
					}),
				)

			return E.right(parsedValue)
		}

	export type URL = Branded<string, "URL">

	export const url =
		(variableName: string): Config<URL> =>
		env => {
			const value = env[variableName]
			if (!value) {
				return E.left(new FailureKind.Missing({ variableName }))
			}

			if (!value.startsWith("http"))
				return E.left(
					new FailureKind.Invalid({
						error: "Must be a url",
						variableName,
					}),
				)

			return E.right(value as URL)
		}

	export const boolean =
		(variableName: string): Config<boolean> =>
		env => {
			const value = env[variableName]
			if (!value) {
				return E.left(new FailureKind.Missing({ variableName }))
			}

			if (value === "true") return E.right(true)

			if (value === "false") return E.right(false)

			return E.left(
				new FailureKind.Invalid({
					error: "Must be a boolean",
					variableName,
				}),
			)
		}

	export const literal =
		<A extends readonly [string, ...string[]]>(...allowedValues: A) =>
		(variableName: string): Config<A[number]> =>
		env => {
			const value = env[variableName]
			if (!value) {
				return E.left(new FailureKind.Missing({ variableName }))
			}

			if (!allowedValues.includes(value))
				return E.left(
					new FailureKind.Invalid({
						error: `Must be one of ${allowedValues
							.map(a => `"${a}"`)
							.join(" | ")}`,
						variableName,
					}),
				)

			return E.right(value as A[number])
		}

	export const always =
		<A>(a: A): Config<A> =>
		_ =>
			E.right(a)

	// -------------------------------------------------------------------------------------
	// Combinators
	// -------------------------------------------------------------------------------------
	export const optional =
		<A>(schema: Config<A>): Config<A | undefined> =>
		env => {
			const result = schema(env)

			if (E.isLeft(result) && result.left._tag === "Missing") {
				return E.right(undefined)
			}

			return result
		}

	export const defaultTo =
		<A>(defaultValue: A) =>
		(schema: Config<A>): Config<A> =>
		env => {
			const result = schema(env)

			// Had we used a more expressive type than `undefined` (ex: Option) to say "not present",
			// we could have piggybacked on the `optional` combinator to implement this.
			// Unfortunately, with `undefined`, we have no way to know if WE chose to return this
			// because the value was missing or simpy because THE USER declared it as an acceptable value type
			if (E.isLeft(result) && result.left._tag === "Missing") {
				return E.right(defaultValue)
			}

			return result
		}

	export const struct =
		<A extends Record<string, Config<any>>>(
			schema: A,
		): Config<{ [K in keyof A]: A[K] extends Config<infer B> ? B : never }> =>
		env =>
			// Basic fail-fast implementation using an applicative
			pipe(
				schema,
				Rec.map(fa => fa(env)),
				E.struct,
			) as E.Either<FailureKind.FailureKind, Record<keyof A, any>>

	export const orElse =
		<B>(fb: Config<B>) =>
		<A>(fa: Config<A>): Config<A | B> =>
		env =>
			pipe(
				fa(env),
				E.alt(() => fb(env)),
			)

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

export namespace Pipeline {
	class Stage extends Tagged("Stage")<{
		name: string
		fa: Pipeline
	}> {}

	class Command extends Tagged("Command")<{
		command: string
	}> {}

	class Script extends Tagged("Script")<{
		run: () => Promise<void>
	}> {}

	class And extends Tagged("And")<{
		fas: Pipeline[]
	}> {}

	class Then extends Tagged("Then")<{
		fas: Pipeline[]
	}> {}

	class Recover extends Tagged("Recover")<{
		fa: Pipeline
		recover: Pipeline
	}> {}

	export type Pipeline = Stage | Command | Script | And | Then | Recover

	// -------------------------------------------------------------------------------------
	// Constructors
	// -------------------------------------------------------------------------------------
	export const stage = (name: string, pipeline: Pipeline): Pipeline =>
		new Stage({ name, fa: pipeline })

	export const cmd = (command: string): Pipeline => new Command({ command })

	export const script = (run: () => Promise<void>): Pipeline =>
		new Script({ run })

	// -------------------------------------------------------------------------------------
	// Combinators
	// -------------------------------------------------------------------------------------
	export const then =
		(fb: Pipeline) =>
		(fa: Pipeline): Pipeline => {
			return new Then({
				fas: [
					fa._tag === "Then" ? fa.fas : fa,
					fb._tag === "Then" ? fb.fas : fb,
				].flat(),
			})
		}

	export const and =
		(fb: Pipeline) =>
		(fa: Pipeline): Pipeline =>
			new And({
				fas: [
					fa._tag === "And" ? fa.fas : fa,
					fb._tag === "And" ? fb.fas : fb,
				].flat(),
			})

	export const recover =
		(recover: Pipeline) =>
		(from: Pipeline): Pipeline =>
			new Recover({ fa: from, recover })

	// -------------------------------------------------------------------------------------
	// Interpreters
	// -------------------------------------------------------------------------------------

	type Tree2<A> = A | Tree2<A>[]

	const toTree2 = (fa: Pipeline.Pipeline): Tree2<string> =>
		pipe(
			fa,
			matchTag({
				Script: _ => "Custom script",
				Command: _ => _.command,
				Stage: _ => [_.name, toTree2(_.fa)],
				Recover: _ => "undefined as never",
				And: _ => _.fas.map(toTree2),
				Then: _ => _.fas.map(toTree2),
			}),
		)

	class AndDescription extends Tagged("AndDescription")<{
		fas: PipelineDescription[]
	}> {}
	class ThenDescription extends Tagged("ThenDescription")<{
		fas: PipelineDescription[]
	}> {}
	class TaggedDescription extends Tagged("TaggedDescription")<{
		name: string
		fa: PipelineDescription
	}> {}
	class ActionDescription extends Tagged("ActionDescription")<{
		name: string
	}> {}

	type PipelineDescription =
		| AndDescription
		| ThenDescription
		| TaggedDescription
		| ActionDescription

	function stringifyTree<T>(
		tn: T,
		nameFn: (t: T) => string | undefined,
		childrenFn: (t: T) => T[] | null,
	): string {
		function prefixChild(strs: string[], last: boolean): string[] {
			return strs.map((s, i) => {
				const prefix = i === 0 ? (last ? "└─" : "├─") : last ? "  " : "│ "
				return prefix + s
			})
		}
		function nodeToStrings(tn: T): string[] {
			const origChildren = childrenFn(tn) || []
			const children = [...origChildren] // copy the array
			const name = nameFn(tn)
			if (children.length === 0) {
				return name ? ["─ " + name] : []
			}
			return [
				...(name ? ["┬ " + name] : []),
				...children
					.map((c, i) => {
						const strs = nodeToStrings(c)
						return prefixChild(strs, i === children.length - 1)
					})
					.flat(),
			]
		}

		return nodeToStrings(tn).join("\n")
	}

	export const describe = (fa: Pipeline): string => {
		const loop = (fa: Pipeline): PipelineDescription =>
			pipe(
				fa,
				matchTag({
					Script: _ => new ActionDescription({ name: "Custom script" }),
					Command: _ => new ActionDescription({ name: _.command }),
					Stage: _ => new TaggedDescription({ name: _.name, fa: loop(_.fa) }),
					Recover: _ =>
						new ThenDescription({
							fas: [
								loop(_.fa),
								new TaggedDescription({
									name: "!!Recover!!",
									fa: loop(_.recover),
								}),
							],
						}),
					And: _ => new AndDescription({ fas: _.fas.map(loop) }),
					Then: _ => new ThenDescription({ fas: _.fas.map(loop) }),
				}),
			)

		return stringifyTree(
			loop(fa),
			matchTag({
				ActionDescription: _ => _.name,
				TaggedDescription: _ => _.name,
				AndDescription: _ => "(Parallel)",
				ThenDescription: _ => "(Sequential)",
			}),
			matchTag({
				ActionDescription: _ => [],
				TaggedDescription: _ => [_.fa],
				ThenDescription: _ => _.fas,
				AndDescription: _ => _.fas,
			}),
		)
	}

	export const run = (pipeline: Pipeline): Promise<void> =>
		pipe(
			pipeline,
			matchTag({
				Stage: _ => run(_.fa),
				Script: _ => _.run(),
				Recover: _ => run(_.fa).catch(() => run(_.recover)),
				Command: _ => Promise.resolve(),
				And: _ => Promise.all(_.fas.map(run)).then(() => undefined),
				// Yes it's not running sequentially
				Then: _ => Promise.all(_.fas.map(run)).then(() => undefined),
			}),
		)
}
