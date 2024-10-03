const bcrypt = require('bcrypt');

// Funzione per verificare la password
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
};
