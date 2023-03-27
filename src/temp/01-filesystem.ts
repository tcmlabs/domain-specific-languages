import { pipe } from "@effect-ts/core/Function"
import { Tagged } from "@effect-ts/core/Case"

/**
 * We've been tasked to design a DSL to deal with the filesystem.
 *
 * At the end of the day, with this DSL we should be able to:
 * - Create files
 * - Read files
 * - Update files
 * - Delete files
 * - Duplicate files
 * - Rename files
 * - Encode files
 * - ...
 *
 * This feels like a lot to handle. But is it really?
 */

/**
 * Exercise 01:
 *
 * A DSL is a way to solve a complex domain problem by combining simple solutions together.
 * What are the most simple and basic set of operations we should be able to perform with our filesystem DSL
 *
 * @worksheet: give the first one to kickstart
 */

/**
 * Exercise 02:
 *
 * Those fundamental operations are called _constructors_, they (might) take some input
 * and return a solution to the problem.
 *
 * Ex: const mathematics: number = 5
 *
 * Implement the 3 fundamentals operations defined in exercise 01 (Typings only!).
 *
 * @worksheet: give the first one to kickstart (magically invoke type Filesystem = "blah")
 */
namespace Exercise02 {
	type FileSystem = {}

	declare const readFile: (path: string) => FileSystem

	declare const writeFile: (path: string, content: string) => FileSystem

	declare const deleteFile: (path: string) => FileSystem
}

// (TYPE)SAFETY FIRST
/**
 * Exercise 03:
 *
 * You might have noticed that each of these 3 operations all return a `Filesystem` dsl
 * with no indication of what the end result of that operation will ever be.
 *
 * Ex: `readFile` will probably return a `string` or a `Buffer`
 *
 * Add a generic to `Filesystem` to represent the result of the DSL after it's execution
 */
namespace Exercise03 {
	type FileSystem<A> = { _A: A }

	declare const readFile: (path: string) => FileSystem<string>

	declare const writeFile: (path: string, content: string) => FileSystem<void>

	declare const deleteFile: (path: string) => FileSystem<void>
}

/**
 * Exercise 04:
 *
 * We all love it when a plan comes together, however (even more so when dealing with the filesystem)
 * it is very possible that an operation fails.
 *
 * We would very much like our users to be able to know why it failed so that they can take action.
 * For example, if a `readFile` fails because the file hasn't been found,
 * then look for it in another place.
 *
 * - Add another generic to `Filesystem` to represent the possible failure of each operation
 * - Come up with at least one possible failure per operation
 */
namespace Exercise04 {
	export class MissingWriteAccess extends Tagged("MissingWriteAccess")<{
		path: string
	}> {}
	export class MissingDeleteAccess extends Tagged("MissingDeleteAccess")<{
		path: string
	}> {}
	export class NoSuchFile extends Tagged("NoSuchFile")<{ path: string }> {}
	export class NoSuchFolder extends Tagged("NoSuchFolder")<{ path: string }> {}

	type FileSystem<E, A> = { _E: () => E; _A: () => A }

	declare const readFile: (path: string) => FileSystem<NoSuchFile, string>

	declare const writeFile: (
		path: string,
		content: string,
	) => FileSystem<MissingWriteAccess | NoSuchFolder, void>

	declare const deleteFile: (
		path: string,
	) => FileSystem<NoSuchFile | NoSuchFolder | MissingDeleteAccess, void>
}

// -------------------------------------------------------------------------------------
// Transform
// -------------------------------------------------------------------------------------
/**
 * We have a basic set of operations, however we might need to tweak them slightly.
 *
 * For example, right now we would be unable to update the content of a file
 * without creating a new `updateFile` constructor.
 *
 * Implement an operator that allows you to map the result value of an operation
 * and implement the `readJson` operation with it
 *
 * @worksheet: Why wouldn't creating a new `updateFile` constructor work ?
 * 						(would still be blocked if you had to read a file, transform it's content and write the result somewhere else)
 */
namespace Exercise05 {
	type JSON = string | number | boolean | JSON[]

	type FileSystem<E, A> = { _E: () => E; _A: () => A }

	declare const readFile: (path: string) => FileSystem<never, string>

	declare const myTransformator: <A>(
		something: any,
	) => <E1>(solution1: FileSystem<E1, A>) => FileSystem<any, any>

	declare const parseJSON: (rawJson: string) => JSON

	const readJson = (path: string): FileSystem<never, JSON> =>
		// @ts-expect-error
		pipe(readFile(path), myTransformator(parseJSON))
}

// -------------------------------------------------------------------------------------
// Combine
// -------------------------------------------------------------------------------------
/**
 * Exercise 06:
 *
 * Those fundamental operations are great, but they will not take us very far.
 * For example, as of now, we are unable to duplicate/move/update a file.
 *
 * We need a way to combine those basic solutions into more complex ones.
 *
 * Those are called _combinators_, operators that take two (or more) solutions and
 * combine them to solve a more complex problem.
 *
 *
 * ONE OF THE PROBLEM YOULL HAVE TO SOLVE IS DEPENDENT COMPUTATION
 * GO PLAN & EX RECAp FIRST
 *
 * Come op with a combinator that would represent the execution of two dependant operations
 * in sequence and try implementing the `moveFile` operation with it.
 *
 * @worksheet: Since the 2 ops are dependant, what does it imply for the behavior of chain ?
 */
namespace Exercise06 {
	type FileSystem<E, A> = { _E: () => E; _A: () => A }

	declare const readFile: (path: string) => FileSystem<never, string>

	declare const writeFile: (
		path: string,
		content: string,
	) => FileSystem<never, void>

	declare const deleteFile: (path: string) => FileSystem<never, void>

	declare const myCombinator: <A, E2>(
		something: any,
	) => <E1>(solution1: FileSystem<E1, A>) => FileSystem<any, any>

	const moveFile = (from: string, to: string) =>
		pipe(
			readFile(from),
			myCombinator(writeFile(to, null as any)),
			myCombinator(deleteFile(from)),
		)
}

/**
 * Exercise 07:
 *
 * A fairly common use case in the development world is to allow the configuration file of some tool
 * to be placed at a few different places
 *
 * Ex: jest's config might be placed in `jest.config.js` or `jest.config.json` or `package.json`
 *
 * Come op with a combinator that would allow you to run one operation
 * or a second one if the first failed.
 *
 * Try implementing the `readJestConfig` operation with it.
 *
 * @worksheet:
 */
namespace Exercise07 {
	type FileSystem<E, A> = { _E: () => E; _A: () => A }

	declare const readFile: (path: string) => FileSystem<never, string>

	declare const myCombinator: (
		something: any,
	) => <E1, A>(solution1: FileSystem<E1, A>) => FileSystem<any, any>

	const readJestConfig = pipe(
		readFile("jest.config.js"),
		myCombinator(readFile("jest.config.json")),
		myCombinator(readFile("package.json")),
	)
}

/**
 * Exercise 08:
 *
 * This DSL will be used to deal with some fairly large files.
 *
 * Provide a way to run two operations independently of one another
 * and implement the `readLargeDataset` operation with it.
 *
 * @worksheet: Note that this might be in parallel or not depending on your model
 * 						(would be for filesystem, wouldn't for predicate)
 * @worksheet: Note that the solution has the same exact shape as `readJestConfig` however the result is much different That's why a DSL is a language
 */
namespace Exercise08 {
	type FileSystem<E, A> = { _E: () => E; _A: () => A }

	declare const readFile: (path: string) => FileSystem<never, string>

	declare const myCombinator: (
		something: any,
	) => <E1, A>(solution1: FileSystem<E1, A>) => FileSystem<any, any>

	const readLargeDataset = pipe(
		readFile("myLargeDataset1.json"),
		myCombinator(readFile("myLargeDataset2.json")),
		myCombinator(readFile("myLargeDataset3.yml")),
	)
}

// -------------------------------------------------------------------------------------
// Primitives
// -------------------------------------------------------------------------------------
/**
 * Exercise 09:
 *
 * A DSL is specialized to a domain (here, filesystem), meaning we have the ability
 * to make our user's lives easier by giving them pre-made solutions to problem they will most
 * certainly have within this domain.
 *
 * I call those primitives, their job is not to construct a new fundamental solution or transform/combine one,
 * it is a pre-made combination of solutions.
 *
 * Come up with at least one pre-made solution that a user dealing with the filesystem will probably need at some point
 *
 * @worksheet: Ex: readYml, ymlToJson, listFiles
 */

// -------------------------------------------------------------------------------------
// Improving the DSL
// -------------------------------------------------------------------------------------
/**
 * Exercise 10:
 *
 * Taking a look at the types of our DSL below, what is the one thing that might be error-prone
 *
 *
 * How could this be solved
 *
 * @worksheet: Why was this hard to implement
 */
namespace Exercise10 {
	type FileSystem<E, A> = { _E: () => E; _A: () => A }

	declare const readFile: (path: string) => FileSystem<never, string>

	declare const writeFile: (
		path: string,
		content: string,
	) => FileSystem<never, void>

	declare const deleteFile: (path: string) => FileSystem<never, void>
}

/**
 * Exercise 11:
 *
 * With our new `Path` value object we've made things less error-prone for the user.
 * However, building a `Path` value by hand is not the best of experience.
 *
 * Find a way to solve this issue
 */
namespace Exercise11 {
	export class Path extends Tagged("Path")<{
		extension: string
		filename: string
		path: string[]
	}> {}

	type FileSystem<E, A> = { _E: () => E; _A: () => A }

	declare const readFile: (path: Path) => FileSystem<never, string>

	const stringPath = "/blah/indeed.ts"

	// @ts-expect-error
	const readThing = readFile(stringPath)
}

/**
 * Exercise 12:
 *
 * Implement a duplicate function that
 * - Takes a file
 * - Clones it
 * - Appends "_clone" to the new file name
 *
 * @worksheet: What was the value of the new `Path` value object in our case?
 * @worksheet: Is `Path` a DSL? If yes, why, if not, what would make it a DSL?
 */
namespace Exercise12 {
	type FileSystem<E, A> = { _E: () => E; _A: () => A }

	declare const readFile: (path: string) => FileSystem<never, string>

	declare const writeFile: (
		path: string,
		content: string,
	) => FileSystem<never, void>

	declare const deleteFile: (path: string) => FileSystem<never, void>

	declare const chain: <E2, A, B>(
		ffb: (a: A) => FileSystem<E2, B>,
	) => <E1>(fa: FileSystem<E1, A>) => FileSystem<E1 | E2, B>

	const duplicate = pipe(undefined)
}

/*
 * END
 *
 * The usefulness of a DSL is very much limited by the combined power of its constructors and operators.
 *
 * For example, without the `chain` operator our DSL would be quite useless.
 * It also wouldn't be much better with a `chain` combinator but without a `readFile` operation
 *
 * In this section we have seen that a DSL is made of
 * - Constructors
 * - Operators
 * - Primitives
 *
 * We have seen the 3 main operators that you will need in pretty much any DSL you'll write
 * - zip
 * - chain
 * - orElse
 *
 * @worksheet: What makes a good constructor in the context of a DSL (Ex: readFile vs readAndUpdateFile) ?
 * @worksheet: What are the 2 types of operators ?
 * @worksheet: Can you describe what each of the main operator we've seen does ?
 * @worksheet: Why isn't `map` included in this list ?
 * @worksheet: What would happen if we had a decoder/validation DSL without one of those operators
 * @worksheet: Can you think of an operator we haven't created here but could be useful?
 */



