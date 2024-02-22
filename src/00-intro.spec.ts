import { pipe } from "@effect-ts/core/Function"
import { Config, FS, CSRequestFilterDSL } from "./support/00-intro"

/*
 * INTRODUCTION:
 *
 * A Domain Specific Language (DSL) is a way to solve a complex domain problem by combining simple solutions together.
 * Basically it means that, by combining a few tiny pieces together, you can accomplish very big things.
 *
 * The domain might be a technical domain like building a pipeline, handling asynchronous data, validation, ...
 * or a more business oriented domain like a rule engine for insurance eligibility, AB testing/user segmentation,
 * email triaging rules, ...
 *
 * A DSL is composed of three parts:
 * - The model:    The data structure supporting the DSL
 * - Constructors: A set of fundamental solutions to the problem domain solved by the DSL
 * - Operators:    A set of operations that allow the transformation or combination of simple
 * 								 solutions to solve more complex problems
 *
 * Sounds complicated but, a DSL is actually nothing that special… And you've been using many every day!
 * For example, one of the most powerful DSLs you've been using all your life is maths.
 *
 * The underlying model is `number`
 *
 * You can construct simple solutions:
 * `const one = 1`
 *
 * You can combine these simple solutions together to solve more complex problems:
 * `const complex = 1 * 2 / 3 + 4
 *
 * A good sign you're dealing with a DSL is recursivity, everytime you operate on a member of the DSL, you get back a new member of the DSL
 * ```
 * const someNumber: number = 1
 * const transformedNumber: number = 3 / 2 + 1
 * ```
 *
 * Okay, enough theory for now, let's get our hands on a few DSL to get a feel for what it looks like, what it can do and, maybe,
 * start recognizing a few patterns before creating our owns.
 */

/**
 * Example 1: Inbox overload!
 *
 * We are the leading service in package shipping but our reputation has started to take a dive the past few months.
 *
 * Our customer service team is buried under an avalanche of emails.
 * Urgent shipping requests get lost in the mix, response times lag, and everyone feels overwhelmed.
 *
 * We need a way to streamline their workflow and bring back order to our customer service.
 *
 * Thankfully, the dev team has crafted a custom DSL to facilitate the creation of triaging rules for
 * the thousands of support requests we receive every day.
 *
 * Until the UI is ready, as the head of the CS team, use this DSL to implement the urgent classifications the team has asked for.
 *
 * @meta: This DSL is incomplete, technically we only have the matching/tagging DSL here (does a request match an inbox),
 * 				but we have no notion of what inbox/team the request should be sent to/which inbox to prioritize to
 * 				when two filters are matching a request.
 */

describe(`Inbox overload`, () => {
	/**
	 * Exercise 01:
	 *
	 * Use the DSL to build a filter targeting all package issues.
	 *
	 * A package issue request is a request containing "damaged" or "lost" in the subject or body.
	 *
	 * @meta: Introducing the concept of this OR that
	 */
	describe(`Package issue filter`, () => {
		// Destructure the DSL methods you want to use here or directly access them via `EmailTaggingDSL.*`
		const { objectMatches, bodyMatches, or } = CSRequestFilterDSL

		const matchLostOrDamagedWord = /lost|damaged/i
		const isPackageIssueRequest: CSRequestFilterDSL.EmailFilter = pipe(
			objectMatches(matchLostOrDamagedWord),
			or(bodyMatches(matchLostOrDamagedWord)),
		)

		test(`Subject containing "lost" is a match`, () => {
			expect(
				isPackageIssueRequest(
					new CSRequestFilterDSL.SupportRequest({
						object: "Blah lost blah",
						body: "body",
						from: CSRequestFilterDSL.SAMPLE_CLIENT_ID,
						requestedAt: new Date(),
					}),
				),
			).toBe(true)
		})

		test(`Body containing "lost" is a match`, () => {
			expect(
				isPackageIssueRequest(
					new CSRequestFilterDSL.SupportRequest({
						object: "object",
						body: "Blah lost blah",
						from: CSRequestFilterDSL.SAMPLE_CLIENT_ID,
						requestedAt: new Date(),
					}),
				),
			).toBe(true)
		})

		test(`Subject containing "damaged" is a match`, () => {
			expect(
				isPackageIssueRequest(
					new CSRequestFilterDSL.SupportRequest({
						object: "Blah damaged blah",
						body: "body",
						from: CSRequestFilterDSL.SAMPLE_CLIENT_ID,
						requestedAt: new Date(),
					}),
				),
			).toBe(true)
		})

		test(`Body containing "damaged" is a match`, () => {
			expect(
				isPackageIssueRequest(
					new CSRequestFilterDSL.SupportRequest({
						object: "object",
						body: "Blah damaged blah",
						from: CSRequestFilterDSL.SAMPLE_CLIENT_ID,
						requestedAt: new Date(),
					}),
				),
			).toBe(true)
		})

		test(`Neither object nor body containing "lost" or "damaged" is not a match`, () => {
			expect(
				isPackageIssueRequest(
					new CSRequestFilterDSL.SupportRequest({
						object: "object",
						body: "body",
						from: CSRequestFilterDSL.SAMPLE_CLIENT_ID,
						requestedAt: new Date(),
					}),
				),
			).toBe(false)
		})
	})

	/**
	 * Exercise 02:
	 *
	 * Target all requests under SLA.
	 *
	 * A request is under SLA for any paying client (we have a free "discovery" tier).
	 *
	 * We have two paying tiers at the moment silver and gold, but we are in the process of adding a new platinum tier,
	 * so you should probably define a paying client as someone who just isn't under the free tier.
	 *
	 * @meta: Introducing the concept of NOT this
	 */
	describe(`Under SLA filter`, () => {
		// Destructure the DSL methods you want to use here or directly access them via `EmailTaggingDSL.*`
		const { not, isTier } = CSRequestFilterDSL

		const isUnderSLAFilter: CSRequestFilterDSL.EmailFilter = pipe(
			isTier("discovery"),
			not,
		)

		test(`Non paying clients are not a match`, () => {
			expect(
				isUnderSLAFilter(
					new CSRequestFilterDSL.SupportRequest({
						object: "object",
						body: "body",
						from: CSRequestFilterDSL.SAMPLE_DISCOVERY_CLIENT_ID,
						requestedAt: new Date(),
					}),
				),
			).toBe(false)
		})

		test(`Silver tier clients are a match`, () => {
			expect(
				isUnderSLAFilter(
					new CSRequestFilterDSL.SupportRequest({
						object: "object",
						body: "body",
						from: CSRequestFilterDSL.SAMPLE_SILVER_CLIENT_ID,
						requestedAt: new Date(),
					}),
				),
			).toBe(true)
		})

		test(`gold tier clients are a match`, () => {
			expect(
				isUnderSLAFilter(
					new CSRequestFilterDSL.SupportRequest({
						object: "object",
						body: "body",
						from: CSRequestFilterDSL.SAMPLE_GOLD_CLIENT_ID,
						requestedAt: new Date(),
					}),
				),
			).toBe(true)
		})
	})

	/**
	 * Exercise 03:
	 *
	 * Target all urgent requests
	 *
	 * An urgent request is any gold client request that hasn't been treated after 75% of the allowed SLA response time (15 hours) has already passed.
	 *
	 * @meta: Introducing the concept of this AND that
	 *
	 * @meta: should the knowledge of "75% of the allowed SLA response time" be coded in the DSL and exposed as a primitive
	 * 				or a rule to be defined manually by the CS or the sales team?
	 * 			  You could argue both, having this knowledge in the code ensures consistency
	 */
	describe(`Urgent requests`, () => {
		// Destructure the DSL methods you want to use here or directly access them via `EmailTaggingDSL.*`
		const { and, isTier, age } = CSRequestFilterDSL

		const isUnderSLAFilter: CSRequestFilterDSL.EmailFilter = pipe(
			isTier("gold"),
			and(age({ kind: ">=", hours: 15 })),
		)

		test(`Request from gold client less than 15 hours old is not a match`, () => {
			expect(
				isUnderSLAFilter(
					new CSRequestFilterDSL.SupportRequest({
						object: "object",
						body: "body",
						from: CSRequestFilterDSL.SAMPLE_GOLD_CLIENT_ID,
						requestedAt: new Date(2024, 11, 25, 8, 16, 0),
					}),
				),
			).toBe(false)
		})

		test(`Request from gold client 15 hours old is a match`, () => {
			expect(
				isUnderSLAFilter(
					new CSRequestFilterDSL.SupportRequest({
						object: "object",
						body: "body",
						from: CSRequestFilterDSL.SAMPLE_GOLD_CLIENT_ID,
						requestedAt: new Date(2024, 11, 25, 8, 15, 0),
					}),
				),
			).toBe(true)
		})

		test(`Request from gold client more than 15 hours old is not a match`, () => {
			expect(
				isUnderSLAFilter(
					new CSRequestFilterDSL.SupportRequest({
						object: "object",
						body: "body",
						from: CSRequestFilterDSL.SAMPLE_GOLD_CLIENT_ID,
						requestedAt: new Date(2024, 11, 25, 8, 14, 0),
					}),
				),
			).toBe(true)
		})
	})

	/**
	 * Exercise 04:
	 *
	 * Sales requests
	 *
	 * A sale request is a request containing the word "payment" made by a paying client
	 * or a request containing the word "upgrade" made by a discovery tier client that is not spam.
	 *
	 * A request is considered spam when it is made by a discovery tier client and contains the word NFT (we've been getting a lot of those lately)
	 *
	 * @meta: Introducing complex composition (a AND b) OR (c AND d but not e)
	 */
	describe(`Sales requests`, () => {
		// Destructure the DSL methods you want to use here or directly access them via `EmailTaggingDSL.*`
		const { not, and, or, isTier, bodyMatches, objectMatches } =
			CSRequestFilterDSL

		const isPayingClient = not(isTier("discovery"))

		const containsPayment = pipe(
			bodyMatches(/payment/i),
			or(objectMatches(/payment/i)),
		)

		const containsUpgrade = pipe(
			bodyMatches(/upgrade/i),
			or(objectMatches(/upgrade/i)),
		)

		const isNotSpam = pipe(
			bodyMatches(/nft/i), //
			or(objectMatches(/nft/i)),
			not,
		)

		const isSalesRequest: CSRequestFilterDSL.EmailFilter = pipe(
			containsPayment,
			and(isPayingClient),
			or(pipe(containsUpgrade, and(isTier("discovery")), and(isNotSpam))),
		)

		test(`Request object containing "payment" from a silver client is a match`, () => {
			expect(
				isSalesRequest(
					new CSRequestFilterDSL.SupportRequest({
						object: "payment",
						body: "body",
						requestedAt: new Date(),
						from: CSRequestFilterDSL.SAMPLE_SILVER_CLIENT_ID,
					}),
				),
			).toBe(true)
		})

		test(`Request body containing "payment" from a silver client is a match`, () => {
			expect(
				isSalesRequest(
					new CSRequestFilterDSL.SupportRequest({
						object: "object",
						body: "payment",
						requestedAt: new Date(),
						from: CSRequestFilterDSL.SAMPLE_SILVER_CLIENT_ID,
					}),
				),
			).toBe(true)
		})

		test(`Request object containing "payment" from a gold client is a match`, () => {
			expect(
				isSalesRequest(
					new CSRequestFilterDSL.SupportRequest({
						object: "payment",
						body: "body",
						requestedAt: new Date(),
						from: CSRequestFilterDSL.SAMPLE_GOLD_CLIENT_ID,
					}),
				),
			).toBe(true)
		})

		test(`Request body containing "payment" from a gold client is a match`, () => {
			expect(
				isSalesRequest(
					new CSRequestFilterDSL.SupportRequest({
						object: "object",
						body: "payment",
						requestedAt: new Date(),
						from: CSRequestFilterDSL.SAMPLE_GOLD_CLIENT_ID,
					}),
				),
			).toBe(true)
		})

		test(`Request containing "payment" from a discovery client is not a match`, () => {
			expect(
				isSalesRequest(
					new CSRequestFilterDSL.SupportRequest({
						object: "payment",
						body: "payment",
						requestedAt: new Date(),
						from: CSRequestFilterDSL.SAMPLE_DISCOVERY_CLIENT_ID,
					}),
				),
			).toBe(false)
		})

		test(`Request object containing "upgrade" from a discovery client is a match`, () => {
			expect(
				isSalesRequest(
					new CSRequestFilterDSL.SupportRequest({
						object: "upgrade",
						body: "body",
						requestedAt: new Date(),
						from: CSRequestFilterDSL.SAMPLE_DISCOVERY_CLIENT_ID,
					}),
				),
			).toBe(true)
		})

		test(`Request body containing "upgrade" from a discovery client is a match`, () => {
			expect(
				isSalesRequest(
					new CSRequestFilterDSL.SupportRequest({
						object: "object",
						body: "upgrade",
						requestedAt: new Date(),
						from: CSRequestFilterDSL.SAMPLE_DISCOVERY_CLIENT_ID,
					}),
				),
			).toBe(true)
		})

		test(`Request object containing "upgrade" from a discovery client containing spam is not a match`, () => {
			expect(
				isSalesRequest(
					new CSRequestFilterDSL.SupportRequest({
						object: "upgrade your NFT game",
						body: "body",
						requestedAt: new Date(),
						from: CSRequestFilterDSL.SAMPLE_DISCOVERY_CLIENT_ID,
					}),
				),
			).toBe(false)
		})

		test(`Request body containing "upgrade" from a discovery client containing spam is not a match`, () => {
			expect(
				isSalesRequest(
					new CSRequestFilterDSL.SupportRequest({
						object: "object",
						body: "upgrade your NFT game",
						requestedAt: new Date(),
						from: CSRequestFilterDSL.SAMPLE_DISCOVERY_CLIENT_ID,
					}),
				),
			).toBe(false)
		})
	})
})

/*
 * Example 2: Title
 *
 * dev kind example (config)
 * and/or/not/default/...
 *
 * Example 3
 *
 * pipeline
 * and/or/not/default/...
 *
 */

/**
 * 01 - FILESYSTEM EXERCISE:
 *
 * You have been given a basic set of operations to deal with the filesystem.
 * Using only those basic operations, build the missing (more complex) ones.
 *
 * @note: Access the basic operations using `FS.*`
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
 *
 * @note: Access the basic operations using `Config.*`
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

// namespace APIExample {
// 	/**
// 	 * Exercise 01:
// 	 *
// 	 * Define a guard authorizing a user to access a feature if he has either of these permissions:
// 	 * - users:read
// 	 * - users:all
// 	 */
// 	const canReadUserGuard = pipe(
// 		GUARD.authorization("users:read"),
// 		GUARD.orElse(GUARD.authorization("users:all")),
// 	)
//
// 	/**
// 	 * Exercise 02:
// 	 *
// 	 * Define a guard allowing only clients with access to the white-label option.
// 	 *
// 	 * To have access to the white-label option, a client must have a membership level of gold or platinum.
// 	 */
// 	const canAccessWhiteLabelGuard = pipe(
// 		GUARD.membership("gold"),
// 		GUARD.orElse(GUARD.membership("platinum")),
// 	)
//
// 	/**
// 	 * Exercise 03:
// 	 *
// 	 * Define a guard requiring the caller to have:
// 	 * - The users:read authorization or the users:read authorization
// 	 * - Have access to the white-label endpoints
// 	 */
// 	const canReadUsersAndIsWhiteLabel = pipe(
// 		canReadUserGuard,
// 		GUARD.and(canAccessWhiteLabelGuard),
// 	)
//
// 	/**
// 	 * Exercise 04:
// 	 *
// 	 * What is the difference between those two guards?
// 	 * @private
// 	 */
// 	const guardA = pipe(
// 		GUARD.isInternalClient,
// 		GUARD.orElse(canReadUserGuard),
// 		GUARD.and(canAccessWhiteLabelGuard),
// 	)
//
// 	const guardB = pipe(
// 		GUARD.isInternalClient,
// 		GUARD.orElse(
// 			pipe(
// 				canReadUserGuard, //
// 				GUARD.and(canAccessWhiteLabelGuard),
// 			),
// 		),
// 	)
//
// 	/**
// 	 * Exercise 05:
// 	 *
// 	 * Define a /users endpoint that can list all the users.
// 	 *
// 	 * A user must have either the `users:read` or the `users:all` authorization
// 	 */
// 	const listUsers = pipe(API.endpoint("/users"), API.guard(canReadUserGuard))
// }
//
// /*
//  * @note: This whole series will only talk about *embedded* DSLs, AKA DSL implemented within a host language, as opposed to
//  * an *external* DSL that would have its own interpreter.
//  */
