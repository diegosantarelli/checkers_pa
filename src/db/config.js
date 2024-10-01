module.exports = {
    development: {
        username: process.env.POSTGRES_USER || "default_user",
        password: process.env.POSTGRES_PASSWORD || "default_password",
        database: process.env.POSTGRES_DB || "default_database",
        host: process.env.POSTGRES_HOST || "localhost",
        port: process.env.POSTGRES_PORT || 5432,
        dialect: "postgres"
    },
};
