const bcrypt = require('bcrypt');

/**
 * @function verifyPassword
 * @description Verifica se una password in chiaro corrisponde a una password crittografata.
 *
 * @param {string} password - La password in chiaro inserita dall'utente.
 * @param {string} hashedPassword - La password crittografata salvata nel database.
 *
 * @returns {Promise<boolean>} - Restituisce una `Promise` che risolve a `true` se la password corrisponde, altrimenti `false`.
 *
 * @example
 * const password = 'mypassword';
 * const hashedPassword = '$2b$10$abcdefghijklmnopqrstuv';
 * const isValid = await verifyPassword(password, hashedPassword);
 * console.log(isValid); // Restituisce true o false
 */
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
};