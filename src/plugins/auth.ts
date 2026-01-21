import * as argon2 from "argon2";
import { randomBytes } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import * as jose from "jose";
import sql from "../db/db.js";

process.loadEnvFile();

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

console.log(JWT_SECRET);

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
	console.log(argon2.hash(password));
	return await argon2.hash(password);
};

export const verifyPassword = async (
	hash: string,
	plain: string,
): Promise<boolean> => {
	try {
		console.log(argon2.verify(hash, plain));
		return await argon2.verify(hash, plain);
	} catch (_err) {
		return false;
	}
};

export const createAccessToken = async (
	payload: UserPayload,
): Promise<string> => {
	return await new jose.SignJWT({ ...payload })
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime("15m")
		.sign(JWT_SECRET);
};

export const createRefreshToken = async (userId: string): Promise<string> => {
	const token = randomBytes(32).toString("hex");
	const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days

	await sql`
    INSERT INTO refresh_tokens (user_id, token, expires_at)
    VALUES (${userId}, ${token}, ${expiresAt})
  `;

	return token;
};

export const verifyAccessToken = async (
	token: string,
): Promise<UserPayload | null> => {
	try {
		const { payload } = await jose.jwtVerify(token, JWT_SECRET);
		return payload as unknown as UserPayload;
	} catch (_err) {
		return null;
	}
};

export const verifyRefreshToken = async (
	token: string,
): Promise<string | null> => {
	const [data] = await sql`
    SELECT user_id 
    FROM refresh_tokens 
    WHERE token = ${token} 
    AND expires_at > NOW()
  `;

	if (!data) return null;
	return data.user_id;
};

export const revokeRefreshToken = async (token: string): Promise<void> => {
	await sql`DELETE FROM refresh_tokens WHERE token = ${token}`;
};

export const authenticate = async (
	request: FastifyRequest,
	reply: FastifyReply,
) => {
	const authHeader = request.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return reply
			.status(401)
			.send({ message: "Unauthorized: No token provided" });
	}

	const token = authHeader.split(" ")[1];
	const user = await verifyAccessToken(token);

	if (!user) {
		return reply.status(401).send({ message: "Unauthorized: Invalid token" });
	}

	request.user = user;
};

export const requireRole = (allowedRoles: string[]) => {
	return async (request: FastifyRequest, reply: FastifyReply) => {
		if (!request.user) {
			return reply.status(401).send({ message: "Authentication required" });
		}

		if (!allowedRoles.includes(request.user.role)) {
			return reply
				.status(403)
				.send({ message: "Forbidden: Insufficient role" });
		}
	};
};
