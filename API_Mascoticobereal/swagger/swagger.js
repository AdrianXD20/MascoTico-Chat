const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",

        info: {
            title: "MASCOTICO API",
            version: "1.0.0",
            description: "API para el sistema MASCOTICO"
        },

        servers: [
            {
                url: "https://mascotico-chat.onrender.com"
            },
            {
                url: "http://localhost:3000"
            }
        ],

        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        },

        security: [
            {
                bearerAuth: []
            }
        ]
    },

    apis: [
        "./routes/*.js"
    ]
};

module.exports = swaggerJsdoc(options);