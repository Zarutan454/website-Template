import redis.asyncio as aioredis
import asyncio
from typing import List, Dict

REDIS_URL = 'redis://127.0.0.1:6379/0'

async def get_online_status(user_ids: List[str]) -> Dict[str, bool]:
    redis = await aioredis.from_url(REDIS_URL)
    pipe = redis.pipeline()
    for user_id in user_ids:
        pipe.exists(f'presence:user:{user_id}')
    results = await pipe.execute()
    await redis.close()
    return {user_id: bool(result) for user_id, result in zip(user_ids, results)} 