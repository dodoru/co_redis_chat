# coding: utf-8
from src.redis_channel import stream, redis_client, Chat_Channels, exist_channel

from flask import Flask
from flask import request
from flask import render_template
from flask import redirect, url_for, Response, abort
import time
import json

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


@app.route('/<channel>/add', methods=['POST'])
def channel_add(channel):
    if not exist_channel(channel):
        abort(404)
    else:
        msg = request.get_json()
        name = msg.get('name', '<匿名>')
        content = msg.get('content', '')
        r = {
            'name': name,
            'content': content,
            'created_time': current_time()
        }
        message = json.dumps(r, ensure_ascii=False)
        print('debug\nmessge: {}\nchannel: {}'.format(message, channel))
        redis_client.publish(channel, message)
        # 用 redis 发布消息
        return 'OK', 200


@app.route('/<channel>/subscribe', methods=['GET', 'POST'])
def channel_subscribe(channel):
    if not exist_channel(channel):
        abort(404)
    else:
        return Response(stream(channel), mimetype="text/event-stream")
