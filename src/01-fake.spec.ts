import { Fake } from "./solution/01-Fake"
import seedRandom from "seed-random"

const TODO: any = undefined
type TODO = any

// todo: intro file, what does a dsl look like ?

/**
 * INTRODUCTION
 *
 * A DSL is a way to solve a complex domain problem by combining simple solutions together.
 *
 * It is composed of three parts:
 * - The model:    The data structure supporting the DSL
 * - Constructors: A set of fundamental solutions to the problem domain solved by the DSL
 * - Operators:    A set of operations that allow the transformation or combination of simple
 * 								 solutions to solve more complex problems
 *
 * For example, one of the most powerful DSLs you've been using all your life is number.
 *
 * You can construct simple solutions:
 * `const number = 1`
 *
 * You can operate on these solutions to solve more complex problems:
 * `const complex = 1 * 2 / 3 + 4
 *
 * Note that one of the most recognizable feature of a DSL is it's recursivity,
 * whether you construct/add/subtract/[...] a number, you always get a number back.
 *
 * @worksheet: Can you think of at least 3 other DSLs you've been using all your programming life ?
 *
 * USE CASE
 *
 * Our data team needs to generate random giant sets of data for the new demonstration application
 * that will be presented to all new prospective clients.
 *
 * Your mission if you accept it will be to create a DSL that will allow them to generate this
 * monstrous mock data as fast as possible.
 *
 * Obviously, since this will be client facing,
 * lorem ipsum will not cut it, the generated data needs to be controlled and look realistic.
 */

/**
 * Exercise 01:
 *
 * To get things started we'll need a *model* for our DSL.
 *
 * The model is simply the underlying implementation supporting our DSL,
 * basically, a `type` in typescript.
 *
 * It should be able to support all the use cases of the DSL and provide as much type-safety
 * as possible for the user (no pressure).
 *
 * @worksheet: What would be a useful model for generating a random value
 * 						 Let's keep things simple, consider we will only ever have to generate random numbers.
 */
namespace Exercise01 {
	type Fake = TODO
}

/**
 * Exercise 02:
 *
 * The model is very much fluid, it might change at any point during the design,
 * that's perfectly fine.

 * We started with a simple use case: generating a random number and came up with a model for that.
 * Now, we would like to be able to generate a random value of any type.
 *
 * @worksheet: Generalize the model to support the generation of any type of value (number/boolean/date/...)
 */
namespace Exercise02 {
	type Fake = TODO
}

/**
 * Exercise 03:
 *
 * A DSL is a way to solve a complex domain problem by combining simple solutions together.
 *
 * Those fundamental simple solutions are called *constructors*, they (might) take some input
 * and return a solution to the problem.
 *
 * At the very least we should provide a way to:
 * - Generate an integer inside a given range
 * - Generate an integer (from 0 to 99999)
 * - Generate a boolean
 * - Generate a string (from 0 to 10 characters)
 * - Generate the same given value everytime
 *
 * @worksheet: Implement a constructor for each one of those use cases.
 *  					 (there is a `getRandomIntInclusive` in this file)
 *  					 (`String.fromCharCode` can give you a random character)
 */
test(`constructors`, () => {
	// Paste you previous solution here

	const intWithinRange = TODO

	const int = TODO

	const boolean = TODO

	const string = TODO

	const always = TODO

	expect(intWithinRange(0, 5)()).toEqual(expect.any(Number))

	expect(int()).toEqual(expect.any(Number))

	expect(boolean()).toEqual(expect.any(Boolean))

	expect(string()).toEqual(expect.any(String))

	expect(always("Batman")()).toEqual("Batman")
})

/**
 * Exercise 04:
 *
 * At the moment, each of our constructors has its own specific implementation but,
 * isn't generating a random `boolean` just a special case of generating a random `int`?
 *
 * If we had a way of transforming the generated value, we could get rid of those special cases.
 *
 * This is called a *unary operator*, it takes a _single_ solution and _transforms_ it into a new solution.
 * In our case, going from a solution to generate a random int to a solution to generate a boolean.
 *
 * @worksheet: Write a test first to help drive the implementation
 *
 * @worksheet: Implement a new unary operator `map` that takes a Fake<A>, a function to transform it and
 * 						 returns the result of this transformation
 *
 * @prompt: How would `map` work on a type like `Either` that has a secondary `E` track?
 *
 * @prompt: What does it mean in terms of operators?
 *
 * ---------------------------------------------------------------------------------------
 * 🧠️ `map` encompasses the idea of transforming, you will find it in pretty much every functional DSLs and many more places.
 * ---------------------------------------------------------------------------------------
 */
test(`map`, () => {
	// Paste you previous solution here

	const map = TODO
})

// @todo: worksheet use this new operator to implement something useful in user land

/**
 * Exercise 05:
 *
 * Another useful feature for our domain would be the ability to generate a nullable value.
 *
 * @worksheet: Create a new `nullable` unary operator that takes a `Fake<A>` and,
 * 						 either generate an `A` or undefined.
 *
 * @prompt: How could you write a test for this ?
 */
test(`nullable`, () => {
	// Paste you previous solution here

	const nullable = TODO
})

// @todo: worksheet use this new operator to implement something useful in user land

/**
 * Exercise 06:
 *
 * The previous exercise contained a keyword that's going to come back in a lot of DSL: *either*.
 *
 * It might be called `alt`, `orElse`, `or`, `either`, ... whatever it's name,
 * it always encompasses the same thing: given 2 solutions (DSLs),
 * you'll get the result of either one or the other.
 *
 * This is called a *binary operator* or *combinator*. An operator that
 * takes two solutions and combines them into a more powerful one.
 *
 * In our case, we will randomly choose which of the two given `Fake` to use.
 *
 * @worksheet: Implement a new binary operator `orElse` that:
 * 						 - Takes a solution A
 * 						 - Takes a solution B
 * 						 - Returns the result either solution randomly
 *
 * @prompt: How would `orElse` work on a type like `Option` that has a secondary `None` track?
 */
test(`orElse`, () => {
	// Paste you previous solution here

	const orElse = TODO
})

// @todo: worksheet use this new operator to implement something useful in user land

/**
 * Exercise 07:
 *
 * Have you noticed this new feature request while implementing `orElse`?
 *
 * We need to generate a _thing_ depending on the result of another generated _thing_.
 * This would be very useful for us and give the user the ability to generate inter-dependant `Fake`s.
 *
 * @worksheet: Write a test first to help drive the implementation
 *
 * @worksheet: Implement a new binary operator `chain` that:
 * 						 - Takes a solution A,
 * 						 - Takes a function that returns a solution B depending on A's result
 * 						 - Returns the result of the solution B
 *
 * @prompt: How would `chain` work on a type like `Option` that has a secondary `None` track?
 * ---------------------------------------------------------------------------------------
 * 🧠️ `chain` is the idea of executing two dependant computations sequentially.
 * 		It is a very common operator in functional DSLs that you might also find under the name `flatMap`.
 * ---------------------------------------------------------------------------------------
 */
test(`chain`, () => {
	// Paste you previous solution here

	const chain = TODO
})

// @todo: worksheet use this new operator to implement something useful in user land

/**
 * Exercise 08:
 *
 * At the moment we are only able to generate a single `Fake` at a time, if we want a random boolean AND a random int well,
 * we have to execute one, and then, execute the other.
 *
 * This speaks to a lack of compositional power, when using a DSL, having to go outside of it (executing a solution)
 * to do something with another solution is a warning that something is missing.
 *
 * This seems like a fairly basic feature we should support.
 *
 * @worksheet: Write a test first to help drive the implementation
 *
 * @worksheet: Implement a new binary operator `zip` that:
 * 						 - Takes a solution A
 * 						 - Takes a solution B
 * 						 - Returns the result of both solutions
 *
 * @prompt: How would `zip` work on a type like `Either` that has a secondary `E` track?
 * ---------------------------------------------------------------------------------------
 * 🧠️ `zip` or `ap` (although their shape is slightly different) is an operator you will
 * often see in a functional DSL, it is the idea of running two computations independently of each other.
 * Those two computations might run in parallel, but they don't have to.
 * ---------------------------------------------------------------------------------------
 */
test(`zip`, () => {
	// Paste you previous solution here

	const zip = TODO
})

// @todo: worksheet use this new operator to implement something useful in user land

/**
 * Exercise 09:
 *
 * @worksheet: Write a test first to help drive the implementation
 *
 * @worksheet: Implement a new `sequence` combinator that:
 * 						 - Takes any number of solutions
 * 						 - Returns the result of all solutions
 *
 * ---------------------------------------------------------------------------------------
 * 🧠️ `sequence` is about as common as `zip` and encompasses the same idea.
 * 		In fact, it's usually derived from it.
 * ---------------------------------------------------------------------------------------
 */
describe(`sequence`, () => {
	// Paste you previous solution here

	const sequence = TODO

	test(`0 Fake given`, () => {})

	test(`1 Fake given`, () => {})

	test(`Many Fake given`, () => {})
})

// @todo: worksheet use this new operator to implement something useful in user land

/**
 * Exercise 10:
 *
 * Okay, we already have quite a lot of power but, how about generating an object ? Now that would be exciting!
 *
 * @worksheet: Write a test first to help drive the implementation
 *
 * @worksheet: Implement a new `struct` operator that:
 * 						 - Takes an object where each value is a Fake
 * 						 - Returns the given object with all values generated
 *
 * @prompt: After implementing all these operators, can you see why it's necessary for `Fake` to be lazy/a DSL to be recursive?
 * 					Hint: how would you write the struct operator if it wasn't
 *
 * ---------------------------------------------------------------------------------------
 * 🧠️ `struct` is pretty much a variant of `sequence`, the input simply takes an object instead of a list.
 * 	 	While `sequence` is a common name, many DSLs have their own name for the `struct` operator.
 *
 *
 * 	🧠️ Depending on your implementation of sequence and struct you probably had to unsafely cast something at one point.
 *
 * 		 That's okay, the goal of library code is to support those cases where the type system might be lacking
 * 		 so that the user can enjoy full type safety all the way.
 *
 * 		 In fact sometimes, with complex models, full type-safety just isn't worth it.
 * ---------------------------------------------------------------------------------------
 */
describe(`struct`, () => {
	// Paste you previous solution here

	const struct = TODO

	test(`0 Fake given`, () => {})

	test(`1 Fake given`, () => {})

	test(`Many Fake given`, () => {})
})

/**
 * Exercise 11:
 *
 * Last thing is missing is the ability to generate an array.
 *
 * @worksheet: Implement a new `arrayN` operator that:
 * 						 - Takes a Fake
 * 						 - Takes the number of items to generate
 * 						 - Returns an array containing the desired number of generated values
 *
 * @worksheet: Implement a new `array` operator that:
 * 						 - Takes a Fake
 * 						 - Returns an array containing a random number of generated values
 *
 * @prompt: Can you see the difference between `array` and `sequence` or `struct`? Both return an array after all.
 */
describe(`array`, () => {
	// Paste you previous solution here

	const arrayN = TODO

	const array = TODO

	describe(`arrayN`, () => {
		test(`Generate 0 elements`, () => {})

		test(`Generate 1 element`, () => {})

		test(`Generate many elements`, () => {})
	})

	test(`array`, () => {})
})

// @todo: worksheet use this new operator to implement something useful in user land

/**
 * Exercise 12:
 *
 * Time to have some fun and check that we're in a good place in terms of capability.
 *
 * @worksheet: We can generate n array containing a random number of items.
 * 						 In the same vein, implement a new operator that can generate a random object.
 * 						 That is the key name and value type should be random.
 *
 * @worksheet: For something a little more useful and realistic, generate a fake api response
 * 						 for the `GetRepositoryEndpoint` type
 *
 * @worksheet: (optional): Implement a username generator
 *
 * @worksheet: (optional): Implement an email generator
 *
 * @prompt: Did anything surprise you during this exercise?
 */
test(`Victory lap`, () => {
	// Paste you previous solution here

	type Contributor = {
		id: number
		login: string
		email: string
	}
	type Team = {
		id: string
		name: string
	}

	type GetRepositoryEndpoint = {
		id: number
		name: string
		description: string | undefined
		private: boolean
		topics: string[]
		status: "active" | "archived"
		owner: Contributor | Team
		contributors: Contributor[]
	}

	const object = TODO

	const fakeGetRepositoryResponse = TODO

	const username: Fake<string> = TODO

	const email: Fake<string> = TODO
})

/**
 * Exercise 13:
 *
 * We have a new feature request, for tests and some client facing work, in some cases our users want the ability to keep the generated
 * data the same every time a generator is triggered.
 *
 * It probably shouldn't be the default behavior, but that should definitely be possible. And it's actually quite easy to do!
 *
 * However, that means rethinking the model, and this will impact all the code we've written up to this point.
 * Even worse, this would break user-land code.
 *
 * You might have just started sweating, after all we were just about done, and now we have to trash everything.
 *
 * Well, maybe we don't, it's time to evaluate our DSL and do some refactor.
 *
 * In programming, *Orthogonality* is the idea that: _The more orthogonal the design, the fewer exceptions_.
 *
 * Basically for us, it means that every time we have a constructor or an operator that has to know the underlying model of our DSL to function,
 * then it's an exception and a point of friction when we want to change the model.
 *
 * Up to this point for us that would be everytime we execute a fake so:
 * - map
 * - chain
 * - orElse
 * - zip
 * - every constructor
 *
 * @worksheet: Refactor all the aforementioned constructors & operators that can be to end up with the fewest exceptions possible.
 * 						 To get you started, isn't generating a random `boolean` a variation on generation an `int` ?
 *
 * @prompt: After this refactor, how many true (as opposed to derived) constructors do you have?
 *
 * @prompt: After this refactor, how many true operators do you have?
 */
test(`Refactor`, () => {
	// Paste you previous solution here
})

/**
 * Exercise 14:
 *
 * @worksheet: Refactor `Fake` to take a `SeedRandom` as input, this seed will be in charge of generating the random numbers supporting all of our DSL.
 * 						 A `Random` interface and a `SeedRandom` class at the bottom of this file.
 *
 * @worksheet: Add tests for the operators and constructors that were not previously testable
 *
 * @prompt: How many operators/constructors did you have to touch?
 *
 * @prompt: Any thoughts on this refactoring?
 *
 * ---------------------------------------------------------------------------------------
 * 🧠️ As earlier with type safety, sometimes you might want to sacrifice orthogonality.
 *
 *    If an operator takes 5 `chain` operations to work, it might be worth to give it a special
 *    implementation to improve performance.
 *
 *    In this DSL however that wouldn't make much of a difference.
 * ---------------------------------------------------------------------------------------
 */
test(`Seeded random`, () => {
	// Paste you previous solution here
})

/**
 * Exercise 15:
 *
 * We've changed the model, but we've broken user-land code.
 *
 * @worksheet: Hide `Fake`'s implementation behind an opaque type
 *
 * @worksheet: Create a run function that:
 * 						 - Takes a `Fake`
 * 						 - Takes an optional `number` seed
 * 						 - Returns the generated value
 *
 * @prompt: What is the value of doing this refactor?
 *
 * ---------------------------------------------------------------------------------------
 * 🧠️ This `run` function is called an *interpreter*. It takes a program/DSL and... interprets it.
 *
 * 		You might have different interpreters for you DSL, for example, a `CLI` DSL could have a `runCommand` and
 * 		a `generateHelp` interpreter.
 *
 * 		Note that with an *executable* DSL like ours the only interpreter we can have is `run` since it's only a function,
 * 		not an introspectable data structure.
 * ---------------------------------------------------------------------------------------
 */
test(`run`, () => {
	// Paste you previous solution here
	type Fake<A> = {
		readonly FAKE: unique symbol
		__: (seed: SeedRandom) => A
	}

	const run = TODO
})

/*
 * END
 *
 * In this section we have seen that a DSL is made of
 * - A model
 * - Constructors
 * - Operators
 *
 * We have covered the 4 main operators (and more) that you will need in pretty much any DSL you'll write
 * - map
 * - zip
 * - chain
 * - orElse
 *
 * At the end of the day, the usefulness of a DSL is very much limited by the combined power of its constructors and operators.
 *
 * For example, without the `chain` operator our DSL would be quite useless.
 * It also wouldn't be much better if it had a `chain` operator but no `int` generator.
 *
 * We've stopped here, but you can have some fun and re-implement every constructor in the whole faker library,
 * you already have all the operators needed.
 *
 * @prompt: Questions?
 * @prompt:
 */

// -------------------------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------------------------
// from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomIntInclusive(min: number, max: number) {
	const _min = Math.ceil(min)
	const _max = Math.floor(max)
	return Math.floor(Math.random() * (_max - _min + 1) + _min)
}

export interface Random {
	next(): number
}

export class SeedRandom implements Random {
	seed: () => number

	constructor(_seed: number) {
		this.seed = seedRandom(_seed.toString())
	}

	next(): number {
		return this.seed()
	}
}
