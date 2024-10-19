/**
 * Permette a TypeScript di importare file .js senza fare controlli sui tipi, e tratta il contenuto
 * di quei file come any (quindi può essere qualsiasi cosa). Viene utilizzato in contesti dove si vuole integrare file JavaScript
 * all'interno di un progetto TypeScript senza problemi di tipizzazione.
 *
 * @module "*.js"
 * @typedef {any} content - Rappresenta il contenuto di un modulo JavaScript.
 */
declare module '*.js' {
    const content: any;
    export default content;
}