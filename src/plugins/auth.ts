import * as argon2 from "argon2";
import type { FastifyReply, FastifyRequest } from "fastify";
import * as jose from "jose";

const JWT_SECRET = new TextEncoder().encode(
	process.env.JWT_SECRET || "super-secret-dev-key-do-not-use-in-prod",
);

export interface UserPayload {
	id: string;
	username: string;
	role: string;
}

declare module "fastify" {
	interface FastifyRequest {
		user: UserPayload;
	}
}

export const hashPassword = async (password: string): Promise<string> => {
	return await argon2.hash(password);
};

export const verifyPassword = async (
	hash: string,
	plain: string,
): Promise<boolean> => {
	try {
		return await argon2.verify(hash, plain);
	} catch (err) {
		return false;
	}
};

export const createSessionToken = async (
	payload: UserPayload,
): Promise<string> => {
	return await new jose.SignJWT({ ...payload })
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime("7d")
		.sign(JWT_SECRET);
};

export const verifySessionToken = async (
	token: string,
): Promise<UserPayload | null> => {
	try {
		const { payload } = await jose.jwtVerify(token, JWT_SECRET);
		return payload as unknown as UserPayload;
	} catch (err) {
		return null;
	}
};

export const authenticate = async (
	request: FastifyRequest,
	reply: FastifyReply,
) => {
	const token = request.cookies.token;

	if (!token) {
		return reply
			.status(401)
			.send({ message: "Unauthorized: No token provided" });
	}

	const user = await verifySessionToken(token);

	if (!user) {
		return reply.status(401).send({ message: "Unauthorized: Invalid token" });
	}

	request.user = user;
};
