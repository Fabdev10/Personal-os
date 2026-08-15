"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const argon2_1 = __importDefault(require("argon2"));
const prisma = new client_1.PrismaClient();
async function main() {
    const hashed = await argon2_1.default.hash('password123');
    const user = await prisma.user.upsert({
        where: { email: 'you@example.com' },
        update: {},
        create: {
            email: 'you@example.com',
            username: 'you',
            password: hashed
        }
    });
    console.log('Seeded user', user.email);
}
main().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(() => prisma.$disconnect());
