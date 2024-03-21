/*
 * INTRODUCTION:
 *
 * A Domain Specific Language (DSL) is a way to solve a complex domain problem by combining simple solutions together.
 * Basically it means that, by combining a few tiny pieces together, you can accomplish very big things.
 *
 * A DSL is composed of three parts:
 * - The model:    The data structure supporting the DSL
 * - Constructors: A set of fundamental solutions to the problem domain solved by the DSL
 * - Operators:    A set of operations that allow the transformation or combination of simple
 * 								 solutions to solve more complex problems
 *
 * Sounds complicated but, a DSL is actually nothing that special… And you're using many every day!
 * For example, one of the most powerful DSLs you've been using all your life is number.
 *
 * You can construct simple solutions:
 * `const number = 1`
 *
 * You can operate on these solutions to solve more complex problems:
 * `const complex = 1 * 2 / 3 + 4
 *
 * Let's create a tiny `Decision` DSL to get a feel for what a DSL is made of.
 *
 * @note: This whole series will only talk about *embedded* DSLs, AKA DSL implemented within a host language, as opposed to
 * an *external* DSL that would have its own interpreter.
 */

/**
 * Exercise 01:
 *
 * Let's start with the model, the model is how you encode things under the hood.
 *
 * Here, we need a representation that allows us to express the binary nature of a decision, it is either `yes` or `no`, otherwise it's not a decision.
 *
 * @worksheet: Create an encoding for our `Decision` DSL
 */
namespace Exercise01 {
	type Decision = never
}

// @solution-start
namespace Exercise01Solution {
	class Yes {
		readonly _tag = "yes"
	}

	class No {
		readonly _tag = "No"
	}

	type Decision = Yes | No
}
// @solution-end

/**
 * Exercise 02:
 *
 * Next, we need a way to create members of the DSL, those are called constructors.
 *
 * A constructor might take a value of some kind and returns a member of the DSL (here, a `Decision`):
 *
 * @worksheet: Create constructor for a `Yes` and a constructor for a `No` (depending on which encoding you chose, you might already have that)
 *
 * @worksheet: Let's be honest, a Decision looks a lot like a boolean, let's create a constructor allowing to create a `Decision` from a boolean
 *
 * @worksheet: Talking about boolean, how many constructors can you think of for a boolean?
 *
 * @solution: No matter how you choose to encode it, at the end of the day, a boolean expresses a binary state of either `Yes` or, `No`,
 * 						so we need a way to construct each one. Javascript has native keywords for this:
 * 	  				-	`true`
 *    				-	`false`
 * 					  We probably also need some interop with other data types like number and strings. Again, javascript has native keywords for this:
 * 					  - `===`, `===`, `!==`, `!=` (From equality)
 * 					  - `>` `<` v>=` `<=` `===` (From order)
 * 					  Technically we could derive equality from order but, we are getting a bit too abstract.
 * 					  We could also have a `fromValue` thing, taking a `String`, an `Array`, ... and returning a boolean depending on established rules.
 */
namespace Exercise02 {
	// Paste your previous code here

	// TODO
	const fromBoolean = undefined as never
}

// @solution-start
namespace Exercise02Solution {
	class Yes {
		readonly _tag = "yes"
	}

	class No {
		readonly _tag = "No"
	}

	type Decision = Yes | No

	const fromBoolean = (bool: boolean): Decision => (bool ? new Yes() : new No())
}
// @solution-end

/**
 * Exercise 03:
 *
 * By themselves, constructors won't do much for you, true power will come from the operators.
 *
 * An operator takes one or more members of the DSL and returns a new member of the DSL.
 * In our case, each operator might take one or more `Decision`s and return a new `Decision`.
 *
 * @worksheet: What are the operators for combining `Decision`s?
 *
 * @solution: - And
 * 						- Or/Either
 * 					  - Not
 * 					  - XOR
 *
 * @worksheet: Create the operators
 */
namespace Exercise03 {
	// Paste your previous code here
}

// @solution-start
namespace Exercise03Solution {
	class Yes {
		readonly _tag = "yes"
	}

	class No {
		readonly _tag = "No"
	}

	type Decision = Yes | No

	const fromBoolean = (bool: boolean): Decision => (bool ? new Yes() : new No())

	const and = (a: Decision, b: Decision): Decision =>
		a._tag === "yes" && b._tag === "yes" ? new Yes() : new No()

	const or = (a: Decision, b: Decision): Decision =>
		a._tag === "yes" || b._tag === "yes" ? new Yes() : new No()

	const xor = (a: Decision, b: Decision): Decision =>
		a._tag !== b._tag ? new Yes() : new No()

	const not = (decision: Decision): Decision =>
		decision._tag === "yes" ? new No() : new Yes()
}
// @solution-end

/**
 * Exercise 03:
 *
 * Can this package be shipped ? Take a decision
 *
 * @worksheet: Use the `Boolean`DSL:
 * 						 Packages can only be shipped to
 * 						 - User located in France, Spain, or the UK
 * 						 - User must have a verified account
 * 						 - User must be at least 17
 * 						 - User must not be blacklisted
 *
 * @worksheet: Can you describe what is happening under the hood in this example?
 *
 * @solution: We used simple solutions (operators and constructors) to solve a complex logic
 * 						- We take existing booleans or create them from other data types
 * 						- In one line we are able to combine them in complex ways (And, Or, Not) to return a new `Boolean`
 */
namespace Exercise04 {
	interface User {
		country: "FR" | "CA" | "SP" | "PL" | "UK"
		age: number
		verified: boolean
		blacklisted: boolean
	}

	declare const user: User

	// TODO
	const canShipToUser: boolean = undefined as never
}

// @solution-start
namespace Exercise04Solution {
	interface User {
		country: "FR" | "CA" | "SP" | "PL" | "UK"
		age: number
		verified: boolean
		blacklisted: boolean
	}
	declare const user: User

	const canShipToUser: boolean =
		!user.blacklisted &&
		user.verified &&
		user.age > 17 &&
		["FR", "UK", "SP"].includes(user.country)
}
// @solution-end


/**
 * Exercise 05:
 *
 * Let's expand our horizon a little bit:
 *
 * @worksheet: Can you name other DSL you've been using every day your whole career?
 *
 * @solution: `Number`, `Array`, `Promise`, `Regex`...
 *
 * @worksheet: What problem is each one solving?
 *
 * @solution:	- Array: operating on a collection of values
 * 						- Number: doing math
 * 					  - Promise: using and acting on asynchronous data
 */

/**
 * Exercise 06:
 *
 * While each DSL will have operators specific to its own domain (Ex: divide/subtract for Number would not be applicable to boolean),
 * you will often see a few come back in almost every DSL (although their name might be disguised to fit the domain language).
 *
 * @worksheet: Remember the `And` operator for `Boolean`? What are the rules for this operator ?
 *
 * @solution: - Combining the same value returns the same value (`true` And `true` gives `true`)
 * 						- `false` is stronger than `true` (`false` And `true` gives `false`)
 *
 * @worksheet: Can you think of at least one other DSL that has the `And` operator but with different rules? (might use a different name too)
 *
 * @solution: `Number` has `add`, `Array` has `concat`, `Promise` has `all`, ...
 *
 * @worksheet: Can you think of an operator for `Promise` that would fit the `Or` operator?
 *
 * @solution: `race` has the same idea of A | B, one or the other.
 */

//
// js
// webpack
// gulp
// jest
// d3js
//

/**
 * Exercise 02:
 *
 * Next, we need a way to create members of the DSL, those are called constructors.
 *
 * A constructor might take a value of some kind and returns a member of the DSL (here, a `Decision`):
 *
 * @worksheet: Think of at least 5 ways to construct a `boolean`
 *
 * @solution: No matter how you choose to encode it, at the end of the day, the boolean DSL expresses a binary state of either `Yes` or, `No`,
 * 						so we need a way to construct each one. Javascript has native keywords for this:
 * 	  				-	`true`
 *    				-	`false`
 * 					  We probably also need some interop with other data types like number and strings. Again, javascript has native keywords for this:
 * 					  - `===`, `===`, `!==`, `!=` (From equality)
 * 					  - `>` `<` v>=` `<=` `===` (From order)
 * 					  Technically we could derive equality from order but, we are getting a bit too abstract.
 * 					  We could also have a `fromValue` thing, taking a `String`, an `Array`, ... and returning a boolean depending on established rules.
 */

/**
 * Exercise 02:
 *
 * By themselves, constructors won't do much for you, true power will come from the operators.
 *
 * An operator takes one or more members of the DSL and returns a new member of the DSL.
 * In our case, each operator might take one or more `Boolean`s and return a new `Boolean`.
 *
 * @worksheet: What are the operators for working with `Boolean`s?
 *
 * @solution: - `&&` (And)
 * 						- `||` (Or/Either)
 * 					  - `!`  (Not)
 * 					  - `^`  (XOR)
 */

/**
 * Exercise 03:
 *
 * @worksheet: Use the `Boolean`DSL:
 * 						 Packages can only be shipped to
 * 						 - User located in France, Spain, or the UK
 * 						 - User must have a verified account
 * 						 - User must be at least 17
 * 						 - User must not be blacklisted
 *
 * @worksheet: Can you describe what is happening under the hood in this example?
 *
 * @solution: We used simple solutions (operators and constructors) to solve a complex logic
 * 						- We take existing booleans or create them from other data types
 * 						- In one line we are able to combine them in complex ways (And, Or, Not) to return a new `Boolean`
 */
namespace Exercise03 {
	interface User {
		country: "FR" | "CA" | "SP" | "PL" | "UK"
		age: number
		verified: boolean
		blacklisted: boolean
	}

	declare const user: User

	// TODO
	const canShipToUser: boolean = undefined as never
}

// @solution-start
namespace Exercise03Solution {
	interface User {
		country: "FR" | "CA" | "SP" | "PL" | "UK"
		age: number
		verified: boolean
		blacklisted: boolean
	}
	declare const user: User

	const canShipToUser: boolean =
		!user.blacklisted &&
		user.verified &&
		user.age > 17 &&
		["FR", "UK", "SP"].includes(user.country)
}
// @solution-end

/**
 * Exercise 04:
 *
 * The model is how you encode things under the hood, javascript has it's own way of doing this, but we could create our own.
 *
 * @worksheet: Create an encoding for your `Boolean` DSL
 */
namespace Exercise04 {
	type CustomBoolean = never
}

// @solution-start
namespace Exercise04Solution {
	class Yes {
		readonly _tag = "yes"
	}

	class No {
		readonly _tag = "No"
	}

	type CustomBoolean = Yes | No
}
// @solution-end

/**
 * Exercise 05:
 *
 * Let's expand our horizon a little bit:
 *
 * @worksheet: Can you name other DSL you've been using every day your whole career?
 *
 * @solution: `Number`, `Array`, `Promise`, `Regex`...
 *
 * @worksheet: What problem is each one solving?
 *
 * @solution:	- Array: operating on a collection of values
 * 						- Number: doing math
 * 					  - Promise: using and acting on asynchronous data
 */

/**
 * Exercise 06:
 *
 * While each DSL will have operators specific to its own domain (Ex: divide/subtract for Number would not be applicable to boolean),
 * you will often see a few come back in almost every DSL (although their name might be disguised to fit the domain language).
 *
 * @worksheet: Remember the `And` operator for `Boolean`? What are the rules for this operator ?
 *
 * @solution: - Combining the same value returns the same value (`true` And `true` gives `true`)
 * 						- `false` is stronger than `true` (`false` And `true` gives `false`)
 *
 * @worksheet: Can you think of at least one other DSL that has the `And` operator but with different rules? (might use a different name too)
 *
 * @solution: `Number` has `add`, `Array` has `concat`, `Promise` has `all`, ...
 *
 * @worksheet: Can you think of an operator for `Promise` that would fit the `Or` operator?
 *
 * @solution: `race` has the same idea of A | B, one or the other.
 */

//
// js
// webpack
// gulp
// jest
// d3js
//
