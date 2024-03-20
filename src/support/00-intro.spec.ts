import { Config } from "./00-intro"
import * as E from "@effect-ts/core/Either"
import { pipe } from "@effect-ts/core/Function"

describe(`config`, () => {
	describe(`string`, () => {
		test(`valid string passes`, () => {
			const readConfiguration = Config.string("VAR_NAME")
			expect(
				readConfiguration({
					VAR_NAME: "var_value",
				}),
			).toStrictEqual(E.right("var_value"))
		})
		test(`no such var fails`, () => {
			const readConfiguration = Config.string("VAR_NAME")
			expect(readConfiguration({})).toStrictEqual(
				E.left(new Config.FailureKind.Missing({ variableName: "VAR_NAME" })),
			)
		})
	})

	describe(`number`, () => {
		test(`no such var fails`, () => {
			const readConfiguration = Config.number("VAR_NAME")
			expect(readConfiguration({})).toStrictEqual(
				E.left(new Config.FailureKind.Missing({ variableName: "VAR_NAME" })),
			)
		})
		test(`Invalid number fails`, () => {
			const readConfiguration = Config.number("VAR_NAME")
			expect(
				readConfiguration({
					VAR_NAME: "not_a_number",
				}),
			).toStrictEqual(
				E.left(
					new Config.FailureKind.Invalid({
						error: "Must be a number",
						variableName: "VAR_NAME",
					}),
				),
			)
		})
		test(`valid number passes`, () => {
			const readConfiguration = Config.number("VAR_NAME")
			expect(
				readConfiguration({
					VAR_NAME: "1234",
				}),
			).toStrictEqual(E.right(1234))
		})
	})

	describe(`boolean`, () => {
		test(`no such var fails`, () => {
			const readConfiguration = Config.boolean("VAR_NAME")
			expect(readConfiguration({})).toStrictEqual(
				E.left(new Config.FailureKind.Missing({ variableName: "VAR_NAME" })),
			)
		})
		test(`Invalid boolean fails`, () => {
			const readConfiguration = Config.boolean("VAR_NAME")
			expect(
				readConfiguration({
					VAR_NAME: "not_a_boolean",
				}),
			).toStrictEqual(
				E.left(
					new Config.FailureKind.Invalid({
						error: "Must be a boolean",
						variableName: "VAR_NAME",
					}),
				),
			)
		})
		test(`valid boolean passes`, () => {
			const readConfiguration = Config.boolean("VAR_NAME")
			expect(
				readConfiguration({
					VAR_NAME: "true",
				}),
			).toStrictEqual(E.right(true))
			expect(
				readConfiguration({
					VAR_NAME: "false",
				}),
			).toStrictEqual(E.right(false))
		})
	})

	describe(`literal`, () => {
		test(`no such var fails`, () => {
			const readConfiguration = Config.literal("A")("VAR_NAME")
			expect(readConfiguration({})).toStrictEqual(
				E.left(new Config.FailureKind.Missing({ variableName: "VAR_NAME" })),
			)
		})

		test(`Invalid literal fails`, () => {
			const readConfiguration = Config.literal("A", "B")("VAR_NAME")
			expect(
				readConfiguration({
					VAR_NAME: "C",
				}),
			).toStrictEqual(
				E.left(
					new Config.FailureKind.Invalid({
						error: `Must be one of "A" | "B"`,
						variableName: "VAR_NAME",
					}),
				),
			)
		})

		test(`valid literal passes`, () => {
			const readConfiguration = Config.literal("A", "B")("VAR_NAME")
			expect(
				readConfiguration({
					VAR_NAME: "A",
				}),
			).toStrictEqual(E.right("A"))
			expect(
				readConfiguration({
					VAR_NAME: "B",
				}),
			).toStrictEqual(E.right("B"))
		})
	})

	describe(`optional`, () => {
		test(`Missing var passes`, () => {
			const readConfiguration = Config.optional(Config.number("VAR_NAME"))
			expect(readConfiguration({})).toStrictEqual(E.right(undefined))
		})

		test(`Invalid value fails`, () => {
			const readConfiguration = Config.optional(Config.number("VAR_NAME"))
			expect(
				readConfiguration({
					VAR_NAME: "not_a_number",
				}),
			).toStrictEqual(
				E.left(
					new Config.FailureKind.Invalid({
						error: "Must be a number",
						variableName: "VAR_NAME",
					}),
				),
			)
		})

		test(`valid value passes`, () => {
			const readConfiguration = Config.optional(Config.number("VAR_NAME"))
			expect(
				readConfiguration({
					VAR_NAME: "1234",
				}),
			).toStrictEqual(E.right(1234))
		})
	})

	describe(`struct`, () => {
		test(`Config missing`, () => {
			const { struct, number, string } = Config

			const readConfiguration = struct({
				port: number("PORT"),
				version: string("APPLICATION_VERSION"),
			})

			expect(
				readConfiguration({
					PORT: "1234",
				}),
			).toStrictEqual(
				E.left(
					new Config.FailureKind.Missing({
						variableName: "APPLICATION_VERSION",
					}),
				),
			)
		})

		test(`All config here`, () => {
			const { struct, number, string } = Config

			const readConfiguration = struct({
				port: number("PORT"),
				version: string("APPLICATION_VERSION"),
			})

			expect(
				readConfiguration({
					PORT: "1234",
					APPLICATION_VERSION: "IG.4.3.12",
				}),
			).toStrictEqual(
				E.right({
					port: 1234,
					version: "IG.4.3.12",
				}),
			)
		})
	})

	describe(`orElse`, () => {
		test(`A passing`, () => {
			const readConfig = pipe(
				Config.literal("A")("VAR_NAME"),
				Config.orElse(Config.literal("B")("VAR_NAME")),
			)

			expect(readConfig({ VAR_NAME: "A" })).toEqual(E.right("A"))
		})

		test(`B passing`, () => {
			const readConfig = pipe(
				Config.literal("A")("VAR_NAME"),
				Config.orElse(Config.literal("B")("VAR_NAME")),
			)

			expect(readConfig({ VAR_NAME: "B" })).toEqual(E.right("B"))
		})

		test(`None passing`, () => {
			const readConfig = pipe(
				Config.literal("A")("VAR_NAME"),
				Config.orElse(Config.literal("B")("VAR_NAME")),
			)

			expect(readConfig({ VAR_NAME: "C" })).toEqual(
				E.left(expect.any(Config.FailureKind.Invalid)),
			)
		})
	})
})
