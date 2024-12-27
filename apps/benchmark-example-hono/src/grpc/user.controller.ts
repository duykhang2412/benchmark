import { createUser, getUser, updateUser } from "../store/repositories";
import { validateUserDto } from "../dto";

export const UserController = {

    GetUser: async (
        call: any,
        callback: any,
    ) => {
        const data = call.request;
        const validateResult = validateUserDto(data);

        if (!validateResult) {
            return;
        }
        const result = await getUser(
            data.userId as string)

        if (result instanceof Error) {
            callback(null, {
                ok: false,
                error: result,
            });
            return;
        }

        callback(null, {
            ok: true,
            data: result,
        });
    },
    CreateUser: async (call: any, callback: any) => {
        try {
            const createRequest = call.request;
            const userdata = createRequest?.data;

            if (!userdata || !userdata.userId || !userdata.userName) {
                console.error('Invalid userdata:', userdata);
                callback(null, {
                    ok: false,
                    error: { message: 'Invalid user data: userId and userName are required' },
                });
                return;
            }
            const result = await createUser(userdata.userId as string, userdata.userName as string);
            if (result instanceof Error) {
                callback(null, {
                    ok: false,
                    error: result,
                });
                return;
            }

            callback(null, {
                ok: true,
                data: result,
            });
        } catch (err) {
            console.error('Error in CreateUser:', err);
            callback(null, {
                ok: false,
                error: { message: 'Internal server error' },
            });
        }
    },
    Update: async (call: any, callback: any) => {
        try {
            const updateRequest = call.request;
            const userdata = updateRequest?.data;

            if (!userdata || !userdata.userId || !userdata.userName) {
                // console.error('Invalid userdata:', userdata);
                callback(null, {
                    ok: false,
                    error: { message: 'Invalid user data: userId and userName are required' },
                });
                return;
            }
            console.log('Valid userdata:', userdata);
            const result = await updateUser(userdata.userId as string, userdata.userName as string);
            console.log('Result:', result);

            if (result instanceof Error) {
                callback(null, {
                    ok: false,
                    error: result,
                });
                return;
            }

            callback(null, {
                ok: true,
                data: result,
            });
        } catch (err) {
            console.error('Error in CreateUser:', err);
            callback(null, {
                ok: false,
                error: { message: 'Internal server error' },
            });
        }
    },
};
