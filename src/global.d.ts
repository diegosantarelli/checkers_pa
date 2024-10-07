/**
 * Dichiarazione di tipo per i moduli JavaScript importati.
 * Permette di importare moduli `.js` con un tipo `any`, rendendoli compatibili con TypeScript.
 *
 * @module "*.js"
 * @typedef {any} content - Rappresenta il contenuto di un modulo JavaScript.
 */
declare module '*.js' {
    const content: any;
    export default content;
}