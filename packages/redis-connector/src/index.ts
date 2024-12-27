import Redis, { Cluster, ClusterNode, ClusterOptions } from "ioredis";
import { getOrThrow } from "@packages/common";
import { setupConfiguration } from "@packages/common";

type RedisConfig = {
    nodes: ClusterNode[];
    options?: ClusterOptions;
};

setupConfiguration();

export default function createRedisService(): Cluster {
    const redisConfig = getOrThrow<RedisConfig>('redis');
    const redis = new Redis.Cluster(redisConfig.nodes, redisConfig.options);

    return redis;
}
