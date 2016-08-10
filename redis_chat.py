# coding: utf-8
from redis_channel import stream, redis_client, Chat_Channel_List
import flask
from flask import request
import time
import json

app = flask.Flask(__name__)
app.secret_key = 'key'


def current_time():
    return int(time.time())


@app.route('/')
def index_view():
    return flask.render_template('index.html')


@app.route('/channel-list/')
def channel_list():
    return json.dumps({'channels': Chat_Channel_List})


@app.route('/<string:channel>/chat/add', methods=['POST'])
def chat_add(channel='public'):
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
    # 用 redis 发布消息
    if channel in Chat_Channel_List:
        redis_client.publish(channel, message)
    else:
        # auto add a new channel or warn user ?
        pass
    return 'OK'


@app.route('/subscribe/<string:channel>')
def subscribe(channel='public'):
    return flask.Response(stream(channel), mimetype="text/event-stream")


if __name__ == '__main__':
    config = dict(
        debug=True,
    )
    app.run(**config)
