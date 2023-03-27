/**
 * Exercise 09:
 *
 * The usefulness of a DSL is very much limited by the combined (pun intended)
 * power of its constructors and operators.
 *
 * That said, more power isn't always the best path, every choice has consequences.
 *
 * For example, without the `chain` operator our DSL would be quite useless.
 * However, what would happen if we added it to CLI DSL where
 * we have to parse the DSL to auto generate the help ?
 *
 *
 * if you need to be able to introspect the DSL before executing it,
 * then it would make it impossible (ex: auto generating the help for a CLI).
 *
 * At the moment
 * - `chain` to
 *
 *
 * MANY PATHs impl wil force you to ask some questions
 *
 *
 */
// orthogonal zip, map, orElse vs chainLeft
// different paths, same result (readfile might return an error if file not found, it might also return an option)
// in our example having no such file is more intuitive than having to deal with an option -> try implementing with an option (what operation do you return on file not found then ??)

// errors start to arrive with the model
// optional is of no interest if we have errors & map -> readFileOption
// binary operators
// unary operatprs (optional file)
// adding errors
// type safety, there are strings everywhere and renamefiled will be awkward, our job is not to extract file names
// Dream it up/the magic wand if something makes things complecating, dream something better (path: renameFile) path.fromString()
// note we haven't implemented anything up to this point because this wasn't necessary (still need one unguided exercise to see the magic wand/api first thinking)
// the power of you dsl depends on your basic operations & combinators. Yuo might have noticed we are starting to re-implement effect ts here
