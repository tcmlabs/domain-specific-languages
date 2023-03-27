import { pipe } from "@effect-ts/core/Function"
import { Config, FS, Cron } from "./support/00-intro"

/*
 * INTRODUCTION
 *
 * A DSL is a way to solve a complex domain problem by combining simple solutions together.
 *
 * Basically it means that, by combining a few tiny pieces together, you can accomplish very big things.
 *
 * This section is not about theory, the following exercises are meant to give you a feel for
 * what a DSL looks like, what it can do and, maybe, start recognizing a few patterns between all those.
 *
 *
 * 01 - FILESYSTEM EXERCISE:
 *
 * You have been given a basic set of operations to deal with the filesystem.
 * Using only those basic operations, build the missing (more complex) ones.
 */
namespace FilesystemExample {
	/**
	 * EXERCISE 01
	 *
	 * Create a `duplicate` function that:
	 * - Takes the path of a file
	 * - Copies it at the same exact location
	 * - Appends "_copy" to the file name
	 */
	const duplicate = (_path: FS.Path) => pipe(FS.TODO)

	/**
	 * EXERCISE 02
	 *
	 * Create a `move` function that:
	 * - Takes the path of a file
	 * - Copies it at a desired location
	 * - Removes the original file
	 */
	const move = (path: FS.Path, newPath: FS.Path) =>
		pipe(
			FS.readFile(path),
			FS.chain(content => FS.writeFile(newPath, content)),
			FS.chain(() => FS.deleteFile(path)),
		)

	/**
	 * EXERCISE 03
	 *
	 * Create a `rename` function that:
	 * - Takes the path of a file
	 * - Renames it
	 */
	const rename = (_path: FS.Path, _newName: string) => pipe(FS.TODO)
}

/**
 * 02 - CONFIGURATION EXERCISE
 *
 * Our app configuration is becoming increasingly hard to maintain and keeping track
 * of what exists is becoming a bit of a nightmare.
 *
 * To solve this, we've been given a DSL designed to help validate and load the configuration in a typesafe way.
 * Use it to fulfill the following use cases:
 */
namespace ConfigExample {
	/**
	 * EXERCISE 01
	 *
	 * Declare a configuration object (`struct`) retrieving the following values from the environment:
	 * - *PORT*: `number`
	 * - *DATABASE_PORT*: `number`
	 * - *DATABASE_HOST*: `string`
	 *
	 */
	const basicConfiguration = Config.TODO

	/**
	 * EXERCISE 02
	 *
	 * To make configuration usage easier, scope all the database configuration
	 * under a `database` field.
	 *
	 */
	const nestedConfiguration = Config.TODO

	/**
	 * EXERCISE 03
	 *
	 * Add an `optional` *REGION* config that can only be
	 * one of the following values: `["eu", "us"]`
	 *
	 * */
	const withOptionalValue = Config.TODO

	/**
	 * EXERCISE 04
	 *
	 * When running tests, we want our application to be able to use an in-memory database.
	 * Modify the database configuration to either accept a PG connection or an SQLite connection.
	 *
	 * Postgres:
	 * - *DATABASE_HOST*: `string`
	 * - *DATABASE_PORT*: `string`
	 * SQLite:
	 * - *SQLITE_FILE_PATH*: `string`
	 *
	 * Add `_tag: "POSTGRES"|"SQLITE"` to make dealing with the union type easier. (hint: use `map` or `always`)
	 */
	const postgresOrSQLiteConfiguration = Config.TODO
}
