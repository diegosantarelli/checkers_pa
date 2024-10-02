module.exports = {
    development: {
        username: process.env.POSTGRES_USER || "default_user", // da eliminare il default
        password: process.env.POSTGRES_PASSWORD || "default_password", // da eliminare il default
        database: process.env.POSTGRES_DB || "default_database", // da eliminare il default
        host: process.env.POSTGRES_HOST || "localhost", // da eliminare il default
        port: process.env.POSTGRES_PORT || 5432, // da eliminare il default
        dialect: "postgres"
    },
};
