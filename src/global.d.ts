// src/globals.d.ts
declare module '*.js' {
    const content: any; // Qualsiasi modulo JavaScript può essere importato come tipo 'any'
    export default content; // Esporta il contenuto
}