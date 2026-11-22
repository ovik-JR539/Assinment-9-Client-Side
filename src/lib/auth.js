
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { nextCookies } from "better-auth/next-js";

// MongoDB connection
const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db(process.env.DB_NAME);

// Better Auth configuration
export const auth = betterAuth({
    database: mongodbAdapter(db, {
        client,
    }),

    baseURL: process.env.BETTER_AUTH_URL,

    secret: process.env.BETTER_AUTH_SECRET,

    // Email and password authentication
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 6,
        maxPasswordLength: 128,
    },

    // Google and GitHub authentication
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },

        github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
        },
    },

    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "customer",
                input: true,
            },

            phone: {
                type: "string",
                required: false,
                input: true,
            },

            area: {
                type: "string",
                required: false,
                input: true,
            },

            bio: {
                type: "string",
                required: false,
                input: false,
            },
        },
    },

    // Never allow public registration as admin
    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    const safeRole =
                        user.role === "technician"
                            ? "technician"
                            : "customer";

                    return {
                        data: {
                            ...user,
                            role: safeRole,
                        },
                    };
                },
            },
        },
    },

    trustedOrigins: [
        "http://localhost:3000",
    ],

    plugins: [
        nextCookies(),
    ],
});
