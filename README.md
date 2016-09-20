
Co Redis Chat 
多频道的即时聊天室

1 



# Python 3.5
>python -V  # check python verion == 3.5
pyenv versions 
pyenv activate 3.5.2
pyenv virtualenv 3.5.2 env352
pyenv activate env352
python -V

# 使用 gunicorn 启动
gunicorn --worker-class=gevent -t 9999 redis_chat_app:app
# 开启 debug 输出
gunicorn --log-level debug --worker-class=gevent -t 999 redis_chat_app:app
# 把 gunicorn 输出写入到 gunicorn.log 文件中
gunicorn --log-level debug --access-logfile gunicorn.log --worker-class=gevent -t 999 redis_chat_app:app

___

预览图
 ![image](https://github.com/dodoru/co-redis-chat/blob/master/img/001.png)
