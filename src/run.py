# -*- coding:utf-8 -*-

__author__ = 'nico'

import os
from src.redis_chat_app import app

APP = 'redis_chat_app:app'


def install_gunicorn():
    command = 'sudo pip install gunicorn'
    os.system(command=command)


def gunicorn_app(app=APP,
                 host='localhost',
                 port='8000',
                 timeout=60,
                 workers=1,
                 debug=True,
                 tolog=False,
                 logfile='gunicorn.log'):
    extend = ''
    if debug:
        extend += ' --log-level debug'
    if tolog:
        extend += ' --access-logfile {logfile}'.format(logfile=logfile)

    command = 'gunicorn -b {host}:{port} -t {timeout} -w {workers} --worker-class=gevent {extend} {app}' \
        .format(app=app, host=host, port=port, timeout=timeout, workers=workers, extend=extend)
    print(command)
    os.system(command)


def guniconf_app(app=APP, config='src/gunicorn.conf'):
    command = 'gunicorn --config {config} {app}'.format(config=config, app=app)
    print(command)
    os.system(command)


def flask_app():
    app.run(debug=True)


if __name__ == '__main__':
    gunicorn_app(tolog=True)
    # flask_app()
    # guniconf_app()

'''
# 使用 gunicorn 启动
gunicorn --worker-class=gevent -t 9999 redischat:app
# 开启 debug 输出
gunicorn --log-level debug --worker-class=gevent -t 999 redis_chat81:app
# 把 gunicorn 输出写入到 gunicorn.log 文件中
gunicorn --log-level debug --access-logfile gunicorn.log --worker-class=gevent -t 999 redis_chat81:app
'''
