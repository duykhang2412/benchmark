import { Hono } from "hono";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { UserEntity } from "../store/entities";
import { serve } from '@hono/node-server'
import { GRPC_PORT, HTTP_PORT } from '../constraint';
import { cwd } from "process";
import { UserInterface, validateUserDto } from "../dto";

const PROTO_PATH = [
    require.resolve(`${cwd()}/proto/user.proto`),
];
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const userProto = grpc.loadPackageDefinition(packageDefinition).user as any;

const grpcClient = new userProto.UserServiceInternal(
    `0.0.0.0:${GRPC_PORT}`,
    grpc.credentials.createInsecure()
);

const app = new Hono();
app.get("/", async (c) => { return c.json({ message: "User Service" }); })
app.get("/user/:userId", async (c) => {
    try {
        const userId = c.req.param('userId')
        const user = await new Promise<UserEntity>((resolve, reject) => {
            grpcClient.GetUser({ userId }, (err: any, res: any) => {
                if (err) return reject(err);
                return resolve(res);
            });
        });
        if (user.userId === '') {
            return c.json({ message: "User not found" }, 404);
        }
        return c.json(user, 200);
    } catch (err) {
        console.error("Error to get User:", err);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});
app.post("/user", async (c) => {
    try {
        const body = await c.req.json();
        const isValid = validateUserDto(body);
        if (!isValid.success) {
            return c.json({ message: 'Invalid data', errors: isValid.errors }, 400);
        }
        const userinfo: UserInterface = body;
        if (!userinfo.userId || !userinfo.userName) {
            return c.json({ message: "Invalid user data: userId and userName are required" }, 400);
        }
        const existingUser = await new Promise<any>((resolve, reject) => {
            grpcClient.GetUser({ data: { userId: userinfo.userId, userName: userinfo.userName } }, (err: any, res: any) => {
                if (err) return reject(err);
                return resolve(res);
            });
        });

        if (existingUser && existingUser.ok && (existingUser.data.userId === userinfo.userId || existingUser.data.userName === userinfo.userName)) {
            return c.json({ message: "User ID or User Name already exists" }, 400);
        }
        const result = await new Promise<any>((resolve, reject) => {
            grpcClient.CreateUser(
                { data: { userId: userinfo.userId, userName: userinfo.userName } },
                (err: any, res: any) => {
                    if (err) return reject(err);
                    return resolve(res);
                }
            );
        });
        if (result.ok == false) {
            return c.json({ message: "Create Failed", error: result.error }, 400);
        }

        return c.json(result.data, 201);
    } catch (err) {
        console.error("Create Error:", err);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

app.put("/user", async (c) => {
    try {
        const body = await c.req.json();
        const isValid = validateUserDto(body);
        if (!isValid.success) {
            return c.json({ message: 'Invalid data', errors: isValid.errors }, 400);
        }
        const updateinfo: UserInterface = body;
        const result = await new Promise<any>((resolve, reject) => {
            grpcClient.Update(
                { data: { userId: updateinfo.userId, userName: updateinfo.userName } },
                (err: any, res: any) => {
                    if (err) return reject(err);
                    return resolve(res);
                }
            );
        });

        if (result.ok == false) {
            return c.json({ message: "Update Failed" }, 400)
        }
        return c.json(updateinfo, 200);
    } catch (err) {
        console.error("Update Error:", err);
        return c.json({ error: "Internal Server Error" }, 500);
    }
})

console.log(`Server is running on http://localhost:${HTTP_PORT}`)
serve({
    fetch: app.fetch,
    port: HTTP_PORT
})
