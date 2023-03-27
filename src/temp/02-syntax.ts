/**
 *
 * just like any codebase, while a well-designed dsl can save you a lot of time, a badly designed one can cost you a lot of time and energy
 * in this section, you'll learn about the different pieces that make up a dsl and how to evaluate them
 *
 * give the pieces of a dsl, the exercise is to find the missing constructor/combinator
 *
 * filesystem us good to demonstrate orthogonality
 *
 *
 *
 * you'll always have 3 section
 * - constructors (what is it) -> What are the core things in your domain and what should the allow/enforce (env var can be optional or have a default value)
 * - combinators (what is it) takes 2 DSLS and returns a new DSL
 * - primitives (what is it)
 * - ...and model, but turns out that one is not that important
 *
 * Constructors and operators must be balanced correctly to ensure power and expressiveness (orthogonality). You should probably have more combinators than constructors
 *
 *
 *
 * the issue is the field of possiblities, you can encode a domain in many ways. What should guide you is what do you want to allow and what do you want to... not allow.
 * If a fflag must have an end date the nit should be part of the constructor, not a combinator
 *
 * The 0 (succeed/fail). How does it help express things ? What can't you express without it/what can you express with it ?	(config.succeeed / fail) (i use it a lot in tests to express things easier. For config, might want to add a todo C.fail("todo"))
 *
 *
 * Exercise: given this brief, model a constructor for a daily schedule
 * Exercise: modeling a FF dsl where an FF must have start & end date vs on where it might have either one or both
 */
/**
 *
 * a dsl is a solution to a probelm. To solve more complex issues, you want to be able to compose those simple solutions into more complex ones.
 * That's what operators do
 * type DSL<A> = {_A: A}
 *
 * Constructors     (solution (to a problem))
 * - Either: identifying the left member or a right (give the constructors they should create, how does that influence the model, do you need the model)
 * - Config
 * - Gen: Generating a dynamic/static value what is the most basic set of solutions
 * -
 * Unary operators  (transformation (into a new solution))
 * Binary operators (combination (into a new solution))
 * Model
 */
