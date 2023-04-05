// Model
import { pipe } from "@effect-ts/core/Function"
import * as Arr from "@effect-ts/core/Collections/Immutable/Array"
import * as Dict from "@effect-ts/core/Collections/Immutable/Dictionary"
import seedRandom from "seed-random"

// Model
interface Random {
	next(): number
}

class SeedRandom implements Random {
	seed: () => number

	constructor(_seed: number) {
		this.seed = seedRandom(_seed.toString())
	}

	next(): number {
		return this.seed()
	}
}

export type Fake<out A> = {
	readonly FAKE: unique symbol
	__: (random: Random) => A
}

const fake = <A>(f: (random: Random) => A): Fake<A> => ({ __: f } as Fake<A>)

// -------------------------------------------------------------------------------------
// Operators
// -------------------------------------------------------------------------------------
export const nullable = <A>(fa: Fake<A>): Fake<A | undefined> =>
	pipe(
		boolean,
		chain(bool => (bool ? fa : always(undefined))),
	)

export const chain =
	<A, B>(ffb: (a: A) => Fake<B>) =>
	(fa: Fake<A>): Fake<B> =>
		fake(seed => {
			const a = fa.__(seed)
			return ffb(a).__(seed)
		})

export const map =
	<A, B>(f: (a: A) => B) =>
	(fa: Fake<A>): Fake<B> =>
		pipe(
			fa,
			chain(a => always(f(a))),
		)

export const zip =
	<B>(fb: Fake<B>) =>
	<A>(fa: Fake<A>): Fake<readonly [A, B]> =>
		pipe(
			fa,
			chain(a =>
				pipe(
					fb,
					map(b => [a, b]),
				),
			),
		)

export const orElse =
	<B>(fb: Fake<B>) =>
	<A>(fa: Fake<A>): Fake<A | B> =>
		pipe(
			boolean,
			chain(bool => (bool ? (fa as Fake<A | B>) : fb)),
		)

export const sequence = <A extends Fake<any>[]>(
	...fas: A
): Fake<{
	[K in keyof A]: A[K] extends Fake<infer B> ? B : never
}> =>
	pipe(
		fas,
		Arr.reduce(always([] as any[]), (acc, curr) =>
			pipe(
				acc,
				zip(curr),
				map(([a, b]) => [...a, b]),
			),
		),
		map(a => a as Record<keyof A, any>),
	)

export const struct = <A extends Record<string, Fake<any>>>(
	as: A,
): Fake<{
	[K in keyof A]: A[K] extends Fake<infer B> ? B : never
}> => {
	const fakes = pipe(
		as,
		Dict.mapWithIndex((key: keyof A, fake) =>
			pipe(
				fake,
				map(value => ({ value, key })),
			),
		),
		Dict.values,
	)

	return pipe(
		sequence(...fakes),
		map(
			Arr.reduce(Dict.empty as Record<keyof A, any>, (acc, curr) => ({
				...acc,
				[curr.key]: curr.value,
			})),
		),
	)
}

export const arrayN = <A>(fa: Fake<A>, count: number): Fake<Arr.Array<A>> =>
	!count ? always(Arr.empty<A>()) : sequence(...Arr.makeBy_(count, () => fa))

export const array = <A>(fa: Fake<A>): Fake<Arr.Array<A>> =>
	pipe(
		intWithinRange(0, 5),
		chain(count => arrayN(fa, count)),
	)

// -------------------------------------------------------------------------------------
// Constructors
// -------------------------------------------------------------------------------------
export const intWithinRange = (min: number, max: number): Fake<number> =>
	fake(seed => {
		const _min = Math.ceil(min)
		const _max = Math.floor(max)
		return Math.floor(seed.next() * (_max - _min + 1) + _min)
	})

export const int: Fake<number> = intWithinRange(0, 99999)

export const always = <A>(a: A): Fake<A> => fake(() => a)

export const boolean: Fake<boolean> = pipe(
	intWithinRange(0, 1),
	map(n => !!n),
)

export const string: Fake<string> = pipe(
	intWithinRange(0, 10),
	chain(stringSize => {
		const genChars = Arr.makeBy_(stringSize, () =>
			pipe(
				intWithinRange(0, 1000),
				map(n => String.fromCharCode(n)),
			),
		)

		return pipe(
			sequence(...genChars),
			map(chars => chars.join("")),
		)
	}),
)

export const object: Fake<Record<string, unknown>> = pipe(
	intWithinRange(1, 5),
	map(numberOfKeys => Arr.makeBy_(numberOfKeys, () => string)),
	chain(keys => sequence(...keys)),
	chain(keyNames =>
		struct(
			pipe(
				keyNames,
				Arr.reduce({} as Record<string, Fake<any>>, (acc, keyName) => ({
					...acc,
					[keyName]: pipe(int, orElse(boolean), orElse(string)),
				})),
			),
		),
	),
)

// -------------------------------------------------------------------------------------
// Interpreters
// -------------------------------------------------------------------------------------
export const run = <A>(fake: Fake<A>, seed: number = Date.now()): A =>
	fake.__(new SeedRandom(seed))
