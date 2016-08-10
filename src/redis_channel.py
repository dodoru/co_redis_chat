# -*- coding:utf-8 -*-

__author__ = 'nico'

import redis

# 连接上本机的 redis 服务器
# 所以要先打开 redis 服务器
redis_client = redis.Redis(host='localhost', port=6379, db=0)
print('redis', redis_client)

# 发布聊天广播的 redis 频道
# Chat_Channel_List = ['chat', 'basic', 'web', 'svip', 'book']
Chat_Channels = {
    'chat': '大工会',
    'basic': '基础班',
    'web': '掏粪班',
    'book': '斧与包',
    'svip': '塞亚人',
}


def exist_channel(channel):
    if channel in Chat_Channels.keys():
        return True
    else:
        tips = 'Warn[2001]: {} is not exist'.format(channel)
        print(tips)
        return False


def stream(channel):
    if exist_channel(channel):
        '''
        监听 redis 广播并 sse 到客户端
        '''
        print('in stream, channel ', channel)
        # 对每一个用户 创建一个[发布订阅]对象
        pubsub = redis_client.pubsub()
        # 订阅广播频道
        print('subscribe channel')
        pubsub.subscribe(channel)
        # 监听订阅的广播
        print('listen...')
        for message in pubsub.listen():
            print(message)
            if message['type'] == 'message':
                data = message['data'].decode('utf-8')
                # 用 sse 返回给前端
                yield 'data: {}\n\n'.format(data)
