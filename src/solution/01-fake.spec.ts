import * as Fake from "./01-Fake"

describe(`sequence`, () => {
	test.each([
		["No fake", Fake.sequence(), []],
		["Single fake", Fake.sequence(Fake.always("A")), ["A"]],
		[
			"Many fakes",
			Fake.sequence(
				Fake.always("A"),
				Fake.always("B"),
				Fake.always("C"),
				Fake.always("D"),
			),
			["A", "B", "C", "D"],
		],
	])("%s", (_, program, expected) => {
		expect(Fake.run(program as Fake.Fake<any[]>)).toEqual(expected)
	})
})

describe("Struct", () => {
	test.each([
		 ["No fake", Fake.struct({}), {}],
		["Single fake", Fake.struct({ a: Fake.always("A") }), { a: "A" }],
		[
			"Many fakes",
			Fake.struct({
				a: Fake.always("A"),
				b: Fake.always("B"),
				c: Fake.always("C"),
			}),
			{ a: "A", b: "B", c: "C" },
		],
	])("%s", (_, program, expected) => {
		expect(Fake.run(program)).toEqual(expected)
	})
})

describe(`arrayN`, () => {
	test.each([
		["0 items", Fake.arrayN(Fake.always("A"), 0), []],
		["1 item", Fake.arrayN(Fake.always("A"), 1), ["A"]],
		["Many items", Fake.arrayN(Fake.always("A"), 3), ["A", "A", "A"]],
	])("%s", (_, program, expected) => {
		expect(Fake.run(program as Fake.Fake<any>)).toEqual(expected)
	})
})

test(`Seed`, () => {
	const program = Fake.sequence(
		Fake.array(Fake.int),
		Fake.struct({
			number: Fake.int,
			boolean: Fake.boolean,
			string: Fake.string,
		}),
		Fake.int,
		Fake.boolean,
		Fake.string,
	)

	expect(Fake.run(program, 12)).toEqual([
		[39648],
		{
			boolean: true,
			number: 73853,
			string: "Ȋƥȡ̘Ƹč",
		},
		88201,
		true,
		"̅Ð\u0002ΑøÃ",
	])
})
