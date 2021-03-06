# coding: utf-8

import logging
import time
import json

from flask import (
    Flask,
    request,
    render_template,
    redirect,
    url_for,
    abort,
    Response,
)
from src.redis_channel import stream, redis_client, Chat_Channels, exist_channel

app = Flask(__name__)
app.secret_key = 'key'


def current_time():
    return int(time.time())


@app.context_processor
def args_for_base():
    args = {'chat_channels': Chat_Channels}
    return args


@app.route('/ping')
def ping():
    return 'pong'


@app.route('/')
def index():
    # return render_template('base.html')
    return redirect(url_for('channel', channel='chat'))
    # return 'pong'


@app.route('/<channel>', methods=['GET'])
def channel(channel):
    if not exist_channel(channel):
        abort(404)
    else:
        data = dict(
            channel_name=channel,
            channel_title=Chat_Channels.get(channel),
        )
        return render_template('channel.html', **data)


@app.route('/<channel>/list', methods=['GET'])
def channel_list(channel):
    if not exist_channel(channel):
        abort(404)
    else:
        args = request.args
        # end = int(args.get('end', -1))  # -1 get all
        count = int(args.get('count', 5))
        start = int(args.get('start', 0))
        end = start + count
        messages = redis_client.lrange(channel, start=start, end=end)  # 按时间倒序
        number = len(messages)
        if number < count:
            next_cursor = -1
        else:
            next_cursor = end
        if args.get('html') is None:
            data = {
                'messages': messages,
                'start': start,
                'end': end,
                'next_cursor': next_cursor,
                'loaded': bool(next_cursor),
            }
            data = json.dumps(data, indent=0, separators=(',', ': '))
            return data, 200
        else:
            data = dict(
                channel_name=channel,
                channel_title=Chat_Channels.get(channel),
                chats=[json.loads(x) for x in messages]
            )
            return render_template('chats.html', **data)


@app.route('/<channel>/clear', methods=['GET'])
def channel_clear(channel):
    if not exist_channel(channel):
        abort(404)
    else:
        redis_client.delete(channel)
        message = '[clear {}]'.format(channel)
        logging.info(message)
        return redirect(url_for('channel', channel=channel))


@app.route('/<channel>/add', methods=['POST'])
def channel_add(channel):
    if not exist_channel(channel):
        abort(404)
    else:
        msg = request.get_json()
        name = msg.get('name', '<匿名>').encode('utf-8')
        content = msg.get('content', '').encode('utf-8')
        r = {
            'name': name,
            'content': content,
            'created_time': current_time()
        }
        message = json.dumps(r)
        print('debug\nmessge: {}\nchannel: {}'.format(message, channel))
        redis_client.publish(channel, message)
        redis_client.lpush(channel, message)
        # 用 redis 发布消息
        return 'OK', 200


@app.route('/<channel>/subscribe', methods=['GET', 'POST'])
def channel_subscribe(channel):
    if not exist_channel(channel):
        abort(404)
    else:
        return Response(stream(channel), mimetype="text/event-stream")
