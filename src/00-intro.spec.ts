import { pipe } from "@effect-ts/core/Function"
import { Config, CSRequestFilterDSL, Pipeline } from "./support/00-intro"
import * as E from "@effect-ts/core/Either"
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
 *
 *
 * @note: This series assumes you understand currying, function composition and, how to use the `pipe` operator.
 *
 * @note: This whole series will only talk about *embedded* DSLs, AKA DSL implemented within a host language, as opposed to
 * an *external* DSL that would have its own interpreter.
 */

/**
 * Example 1: Inbox overload!
 *
 * We are the leading service in package shipping but our reputation has started to take a dive the past few months,
 * our customer service team is buried under an avalanche of emails, urgent shipping requests get lost in the mix,
 * response times lag, and everyone feels overwhelmed.
 *
 * We need a way to streamline their workflow and bring back order to our customer service.
 *
 * Thankfully, the dev team has crafted a custom DSL to facilitate the creation of triaging rules for
 * the thousands of support requests we receive every day.
 *
 * Until the UI is ready, as the head of the CS team, use this DSL to implement the urgent classifications the team has asked for.
 *
 * @meta: This is a more business oriented DSL, while the source is regular code, it is meant to be handled
 * 				by stakeholders through a UI.
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
	 * 			  You could argue both, having this knowledge in the code ensures consistency but not having it in the code allows
	 * 			  flexibility for the stakeholders.
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

/**
 * Example 2: Configuration Hell
 *
 * Our company has been booming! We've taken on many new clients, and our application has grown significantly
 * to support their diverse needs.
 *
 * However, this growth has come with a cost: application configuration.
 *
 * Booting the application now requires a massive amount of environment and client-specific configuration files.
 * This is becoming difficult to maintain, and keeping track of everything is a nightmare. We're constantly worried about
 * errors or missing configurations.
 *
 * To solve this, we've designed a small DSL to help validate and load the configuration in a typesafe way,
 * but we're not quite sure, yet it's going to work out.
 *
 * Can you prove it will be able to fulfill every use case we have in mind?
 *
 * @meta: This is a more development oriented DSL, it is meant to be handled via code and probably wouldn't make much sense for
 * 				a non-technical person.
 */
describe(`Configuration hell`, () => {
	/**
	 * Exercise 01:
	 *
	 * Okay, first, we should probably make sure that we can read any variable from the environment
	 * and enforce its type.
	 *
	 * @worksheet: Read the variable `APPLICATION_VERSION` as a string and the variable `APPLICATION_PORT` as a number
	 */
	describe(`Read from environment`, () => {
		// Destructure the DSL methods you want to use here or directly access them via `Configuration.*`
		const { string, number } = Config
		const readApplicationVersion = string("APPLICATION_VERSION")
		const readApplicationPort = number("APPLICATION_PORT")

		test(`Read as string`, () => {
			expect(readApplicationVersion({ APPLICATION_VERSION: "v1.1.2" })).toEqual(
				E.right("v1.1.2"),
			)
		})

		test(`Read as number`, () => {
			expect(readApplicationPort({ APPLICATION_PORT: "1234" })).toEqual(
				E.right(1234),
			)
		})

		test(`Trying to cast a non number to a number fails`, () => {
			expect(readApplicationPort({ APPLICATION_PORT: "not_a_number" })).toEqual(
				E.left(expect.any(Config.FailureKind.Invalid)),
			)
		})

		test(`Trying to read a missing variable fails`, () => {
			expect(readApplicationPort({})).toEqual(
				E.left(expect.any(Config.FailureKind.Missing)),
			)
		})
	})

	/**
	 * EXERCISE 02
	 *
	 * As said before, we have quite a lot of configuration, and we'd rather not have the app start if any configuration key is
	 * missing so, we should be able to read any number of keys from the environment and group them
	 * under a single typed configuration object that can be used across the application.
	 *
	 * @worksheet: Declare a configuration object (`struct`) with the following shape:
	 *  ```
	 *  {
	 *  	port: number,
	 *  	version: string
	 * 	}
	 * 	```
	 * ...retrieving the following values from the environment:
	 * - *APPLICATION_PORT*: `number`
	 * - *APPLICATION_VERSION*: `string`
	 */
	describe(`Configuration object`, () => {
		// Destructure the DSL methods you want to use here or directly access them via `Configuration.*`
		const { struct, number, string } = Config

		const readConfiguration = struct({
			port: number("APPLICATION_PORT"),
			version: string("APPLICATION_VERSION"),
		})

		test(`All required configuration available returns config object`, () => {
			expect(
				readConfiguration({
					APPLICATION_PORT: "1234",
					APPLICATION_VERSION: "IG.4.3.12",
				}),
			).toStrictEqual(
				E.right({
					port: 1234,
					version: "IG.4.3.12",
				}),
			)
		})

		test(`Any required configuration missing fails`, () => {
			expect(readConfiguration({})).toStrictEqual(
				E.left(expect.any(Config.FailureKind.Missing)),
			)
		})
	})

	/**
	 * EXERCISE 03
	 *
	 * As suggested by our environment variable names `APPLICATION_PORT` and `APPLICATION_VERSION`,
	 * we should probably be able to nest configuration.
	 *
	 * @worksheet: Scope all application configuration under an `application` sub-configuration.
	 *
	 * @prompt: Note how we were able to influence the resulting structure but the input hasn't changed
	 */
	describe(`Nested configuration`, () => {
		// Destructure the DSL methods you want to use here or directly access them via `Configuration.*`
		const { struct, number, string } = Config

		const readConfiguration = struct({
			application: struct({
				port: number("APPLICATION_PORT"),
				version: string("APPLICATION_VERSION"),
			}),
		})

		test(`All required sub-configuration elements available returns config object`, () => {
			expect(
				readConfiguration({
					APPLICATION_PORT: "1234",
					APPLICATION_VERSION: "v1.1.1",
				}),
			).toStrictEqual(
				E.right({
					application: {
						port: 1234,
						version: "v1.1.1",
					},
				}),
			)
		})

		test(`Any sub-configuration element missing fails`, () => {
			expect(readConfiguration({})).toStrictEqual(
				E.left(expect.any(Config.FailureKind.Missing)),
			)
		})

		test(`Any sub-configuration element invalid fails`, () => {
			expect(
				readConfiguration({
					APPLICATION_VERSION: "v1.1.1",
					APPLICATION_PORT: "not_a_number",
				}),
			).toStrictEqual(E.left(expect.any(Config.FailureKind.Invalid)))
		})
	})

	/**
	 * EXERCISE 04
	 *
	 * Some variables might not be required to make the application run.
	 *
	 * @worksheet: Read the`APPLICATION_PORT` variable from the environment.
	 * 						 It must either be present and of type number or, not be present at all.
	 */
	describe(`Optional values`, () => {
		// Destructure the DSL methods you want to use here or directly access them via `Configuration.*`
		const { number, optional } = Config

		const readConfiguration = optional(number("APPLICATION_PORT"))

		test(`APPLICATION_PORT env variable available return value`, () => {
			expect(
				readConfiguration({
					APPLICATION_PORT: "1234",
				}),
			).toStrictEqual(E.right(1234))
		})

		test(`APPLICATION_PORT env variable available succeeds with undefined`, () => {
			expect(readConfiguration({})).toStrictEqual(E.right(undefined))
		})

		test(`Invalid APPLICATION_PORT value fails`, () => {
			expect(
				readConfiguration({
					APPLICATION_PORT: "not_a_number",
				}),
			).toStrictEqual(E.left(expect.any(Config.FailureKind.Invalid)))
		})
	})

	/**
	 * EXERCISE 05
	 *
	 * You know what, maybe we can have the best of both world, we can accept a value not being present but still provide a default.
	 *
	 * @worksheet: Read the`APPLICATION_PORT` variable from the environment.
	 * 						 If it is present, it must succeed with the given value, otherwise it must default to 3000.
	 * 					   If the provided value is invalid, then it must fail.
	 */
	describe(`Default values`, () => {
		// Destructure the DSL methods you want to use here or directly access them via `Configuration.*`
		const { number, defaultTo } = Config

		const readConfiguration = pipe(number("APPLICATION_PORT"), defaultTo(3000))

		test(`APPLICATION_PORT env variable available return value`, () => {
			expect(
				readConfiguration({
					APPLICATION_PORT: "1234",
				}),
			).toStrictEqual(E.right(1234))
		})

		test(`APPLICATION_PORT env variable available succeeds with undefined`, () => {
			expect(readConfiguration({})).toStrictEqual(E.right(3000))
		})

		test(`Invalid APPLICATION_PORT value fails`, () => {
			expect(
				readConfiguration({
					APPLICATION_PORT: "not_a_number",
				}),
			).toStrictEqual(E.left(expect.any(Config.FailureKind.Invalid)))
		})
	})

	/**
	 * EXERCISE 06
	 *
	 * Time for a real-life use case.
	 *
	 * @worksheet: Declare a configuration object of the following shape:
	 * ```
	 * {
	 *    application: {
	 *       port: number, // Must default to 3000
	 *       version: string
	 *    },
	 *    database: // A connection string or else a config object
	 *    	| URL
	 *    	| {
	 *    			host: string,
	 *    			port: number
	 * 			  }
	 * }
	 * ```
	 *
	 * @prompt: Note how the configuration requirements became way more complex, but the effort to implement the schema was the same as before.
	 */
	describe(`Complex configuration`, () => {
		// Destructure the DSL methods you want to use here or directly access them via `Configuration.*`
		const { number, defaultTo, struct, string, url, orElse } = Config

		const readConfiguration = struct({
			application: struct({
				version: string("APPLICATION_VERSION"),
				port: pipe(number("APPLICATION_PORT"), defaultTo(3000)),
			}),
			database: pipe(
				url("DATABASE_CONNECTION_STRING"),
				orElse(
					struct({
						host: string("DATABASE_HOST"),
						port: number("DATABASE_PORT"),
					}),
				),
			),
		})

		test(`Port defaults to 3000`, () => {
			expect(
				pipe(
					readConfiguration({
						APPLICATION_VERSION: "version",
						DATABASE_CONNECTION_STRING: "http://connection.string",
					}),
					E.map(a => a.application.port),
				),
			).toStrictEqual(E.right(3000))
		})

		test(`Database accepts a connection string`, () => {
			expect(
				pipe(
					readConfiguration({
						APPLICATION_VERSION: "version",
						DATABASE_CONNECTION_STRING: "http://connection.string",
					}),
					E.map(a => a.database),
				),
			).toStrictEqual(E.right("http://connection.string"))
		})

		test(`Database accepts a configuration object`, () => {
			expect(
				pipe(
					readConfiguration({
						APPLICATION_VERSION: "version",
						DATABASE_PORT: "1234",
						DATABASE_HOST: "db.host",
					}),
					E.map(a => a.database),
				),
			).toStrictEqual(
				E.right({
					port: 1234,
					host: "db.host",
				}),
			)
		})

		test(`Invalid application configuration fails`, () => {
			expect(
				pipe(
					readConfiguration({
						APPLICATION_VERSION: "version",
						APPLICATION_PORT: "not_a_number",
						DATABASE_PORT: "1234",
						DATABASE_HOST: "db.host",
					}),
				),
			).toStrictEqual(
				E.left(
					new Config.FailureKind.Invalid({
						error: expect.any(String),
						variableName: "APPLICATION_PORT",
					}),
				),
			)
		})

		test(`Invalid database configuration fails`, () => {
			expect(
				pipe(
					readConfiguration({
						APPLICATION_VERSION: "version",
						APPLICATION_PORT: "1234",
						DATABASE_PORT: "not_a_number",
						DATABASE_HOST: "db.host",
					}),
				),
			).toStrictEqual(
				E.left(
					new Config.FailureKind.Invalid({
						error: expect.any(String),
						variableName: "DATABASE_PORT",
					}),
				),
			)
		})

		test(`Missing database configuration fails`, () => {
			expect(
				pipe(
					readConfiguration({
						APPLICATION_VERSION: "version",
						APPLICATION_PORT: "1234",
					}),
				),
			).toStrictEqual(
				E.left(
					new Config.FailureKind.Missing({
						variableName: "DATABASE_PORT",
					}),
				),
			)
		})

		test(`Missing application configuration fails`, () => {
			expect(
				pipe(
					readConfiguration({
						APPLICATION_PORT: "1234",
						DATABASE_PORT: "1234",
						DATABASE_HOST: "db.host",
					}),
				),
			).toStrictEqual(
				E.left(
					new Config.FailureKind.Missing({
						variableName: "APPLICATION_VERSION",
					}),
				),
			)
		})
	})
})

/**
 * Example 03:
 *
 * Our company's recent growth has been amazing!  New clients keep coming on board,
 * and we're constantly pushing out updates and features to keep them happy.
 *
 * However, our current deployment pipeline is becoming a bit of a roadblock, as we take on new clients and features,
 * the deployment scenarios get more complex, and the YAML struggles to keep up. Additionally, the YAML syntax has proven
 * difficult to understand and maintain, which slows everything down.
 *
 * This ultimately means it takes longer to get new features out the door.
 *
 * The team has designed a pipeline DSL that will allow us to ditch the cryptic YAML syntax for familiar TypeScript.
 * The DSL provides the tools we need to write clear and concise pipelines, even for complex deployments and,
 * since we already know TypeScript, writing, understanding, and maintaining deployment pipelines should become a breeze.
 *
 * Let's have a go at it to see if we can fulfill the use cases we have!
 */
describe(`Pipeline`, () => {
	/**
	 * Let's start with a basic pipeline, we'll improve on it later.
	 *
	 * Define a pipeline runs the following steps one after the other
	 * - Build: runs the `npm run build` command
	 * - Unit test: runs the `npm run test:unit` command
	 * - Integration test: runs the `npm run test:integration` command
	 * - Release: runs the custom `deployScript` function
	 */
	test(`Basic pipeline`, async () => {
		const deployScript = jest.fn().mockResolvedValue(undefined)

		// Destructure the DSL methods you want to use here or directly access them via `Configuration.*`
		const { stage, cmd, script, then, run, describe } = Pipeline

		const deployment = pipe(
			stage("Build", cmd("npm run build")),
			then(stage("Unit test", cmd("npm run test:unit"))),
			then(stage("Integration test", cmd("npm run test:integration"))),
			then(stage("Release", script(deployScript))),
		)

		expect(describe(deployment)).toBe(
			`
┬ (Sequential)
├─┬ Build
│ └── npm run build
├─┬ Unit test
│ └── npm run test:unit
├─┬ Integration test
│ └── npm run test:integration
└─┬ Release
  └── Custom script
			`.trim(),
		)

		await run(deployment)
		expect(deployScript).toHaveBeenCalled()
	})

	/**
	 * To make it easier to follow the state of each pipeline, we have a live view of every running pipeline on slack.
	 * Right now our presentation is a bit lacking, can you improve on it by nesting the two test stages under a test stage?
	 *
	 * @prompt: Note how with a single pipeline definition we are able to both visually describe what happens AND run everything? Keep that in mind for later.
	 */
	test(`Better feedback`, async () => {
		const deployScript = jest.fn().mockResolvedValue(undefined)

		// Destructure the DSL methods you want to use here or directly access them via `Configuration.*`
		const { stage, cmd, script, then, run, describe } = Pipeline

		const deployment = pipe(
			stage("Build", cmd("npm run build")),
			then(
				stage(
					"Test",
					pipe(
						stage("Unit test", cmd("npm run test:unit")),
						then(stage("Integration test", cmd("npm run test:integration"))),
					),
				),
			),
			then(stage("Release", script(deployScript))),
		)

		expect(describe(deployment)).toBe(
			`
┬ (Sequential)
├─┬ Build
│ └── npm run build
├─┬ Test
│ └─┬ (Sequential)
│   ├─┬ Unit test
│   │ └── npm run test:unit
│   └─┬ Integration test
│     └── npm run test:integration
└─┬ Release
  └── Custom script
			`.trim(),
		)

		await run(deployment)
		expect(deployScript).toHaveBeenCalled()
	})

	/**
	 * Everything was working nicely but, having to wait for the unit tests to run before starting the integration tests feels like a waste of time.
	 * Could you run both in parallel to save time and infrastructure cost?
	 */
	test(`Optimizing the pipeline`, async () => {
		const deployScript = jest.fn().mockResolvedValue(undefined)

		// Destructure the DSL methods you want to use here or directly access them via `Configuration.*`
		const { stage, cmd, script, then, and, run, describe } = Pipeline

		const deployment = pipe(
			stage("Build", cmd("npm run build")),
			then(
				stage(
					"Test",
					pipe(
						stage("Unit test", cmd("npm run test:unit")),
						and(stage("Integration test", cmd("npm run test:integration"))),
					),
				),
			),
			then(stage("Release", script(deployScript))),
		)

		expect(describe(deployment)).toBe(
			`
┬ (Sequential)
├─┬ Build
│ └── npm run build
├─┬ Test
│ └─┬ (Parallel)
│   ├─┬ Unit test
│   │ └── npm run test:unit
│   └─┬ Integration test
│     └── npm run test:integration
└─┬ Release
  └── Custom script
		`.trim(),
		)

		await run(deployment)
		expect(deployScript).toHaveBeenCalled()
	})

	/**
	 * Sooooo, turns out sometimes the deployment crashes. While there's definitely an issue to fix there, we do have to make that if this happens,
	 * we can put the application back to a healthy state.
	 *
	 * Can you make sure that when the release stage fails, we trigger the rollback script ?
	 *
	 * @prompt: What happens if the pipeline fails before the release stage ?
	 */
	test(`Error handling`, async () => {
		const deployScript = jest.fn().mockRejectedValue(undefined)
		const rollbackScript = jest.fn().mockResolvedValue(undefined)

		// Destructure the DSL methods you want to use here or directly access them via `Configuration.*`
		const { stage, cmd, script, then, and, recover, describe, run } = Pipeline

		const deployment = pipe(
			stage("Build", cmd("npm run build")),
			then(
				stage(
					"Test",
					pipe(
						stage("Unit test", cmd("npm run test:unit")),
						and(stage("Integration test", cmd("npm run test:integration"))),
					),
				),
			),
			then(
				pipe(
					stage("Release", script(deployScript)),
					recover(stage("Rollback", script(rollbackScript))),
				),
			),
		)

		expect(describe(deployment)).toBe(
			`
┬ (Sequential)
├─┬ Build
│ └── npm run build
├─┬ Test
│ └─┬ (Parallel)
│   ├─┬ Unit test
│   │ └── npm run test:unit
│   └─┬ Integration test
│     └── npm run test:integration
└─┬ (Sequential)
  ├─┬ Release
  │ └── Custom script
  └─┬ !!Recover!!
    └─┬ Rollback
      └── Custom script
			`.trim(),
		)

		await run(deployment)
		expect(deployScript).toHaveBeenCalled()
		expect(rollbackScript).toHaveBeenCalled()
	})
})


// @todo: remove test content
// @TODO: What pattern do you see? What do you think the drawbacks might be, see, the power us in tiny pieces that you combine together A AND B THEN C
