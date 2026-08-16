import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.js";
import { signToken } from "../utils/jwt.js";
import type { SigninInput, SignupInput } from "../schemas/auth.schema.js";

const SALT_ROUNDS = 10;

export async function signup(input: SignupInput) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ username: input.username }, { email: input.email }] },
    select: { id: true },
  });

  if (existing) {
    throw AppError.conflict("Username or email is already registered");
  }

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      username: input.username,
      email: input.email,
      password: hashedPassword,
    },
    select: { id: true, username: true, email: true, createdAt: true },
  });

  return user;
}

export async function signin(input: SigninInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  // Same error for "no such user" and "wrong password" — never reveal
  // which one it was, so attackers can't enumerate registered emails.
  if (!user) {
    throw AppError.unauthorized("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password);
  if (!isPasswordValid) {
    throw AppError.unauthorized("Invalid email or password");
  }

  const token = signToken({ userId: user.id });

  return {
    token,
    user: { id: user.id, username: user.username, email: user.email },
  };
}
