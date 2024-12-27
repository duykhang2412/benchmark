import { logger } from "@packages/common";
import { UserEntity } from "../entities/user.entity";
import { UserCollection } from "../models/user.model";

export async function createUser(
    userId: string,
    userName: string,
): Promise<UserEntity | Error> {
    try {
        const now = new Date().toISOString();
        const entity: UserEntity = {
            userId,
            userName,
            createdTime: now,
            updatedTime: now,
        };

        await UserCollection.insertOne(entity);
        return entity;
    } catch (error) {
        logger.error(error);
        return error as Error;
    }
}

export async function updateUser(
    userId: string,
    userName: string,
): Promise<UserEntity | Error> {
    try {

        const updateRequest = {
            userId,
            userName,
        };

        const updateResult = await UserCollection.updateOne(
            { userId },
            { $set: updateRequest },
        );

        if (updateResult.matchedCount === 0) {
            logger.warn(".update", { userId, userName });
        }

        return getUser(userId);
    } catch (error) {
        logger.error(error);
        return error as Error;
    }
}

export async function getUser(
    userId: string,
): Promise<UserEntity | Error> {
    try {
        const result = await UserCollection.findOne({ userId });

        if (result === null) {
            logger.warn(".getUser", { userId });

            return new Error("User not found");
        }
        return result;
    } catch (error) {
        logger.error(error);

        return error as Error;
    }
}