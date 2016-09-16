/**
 * Created by nico on 16/8/11.
 */
var log = function () {
    console.log(arguments);
};
var chatItemTemplate = function (chat) {
    var name = chat.name;
    var content = chat.content;
    var time = chat.created_time;
    var avatar = "https://avatars0.githubusercontent.com/u/7235381?v=3&amp;s=30";
    var t = `
        <div class="chat-item">
            <div class="chat-item__details">
                <img src="${avatar}" class="user-avatar">
                <span class="user-name">${name}</span>
                <a href="#">
                    <time data-time="${time}"></time>
                </a>
            </div>
            <div class="chat-item__content">
               ${content}
            </div>            
        </div>
        `;
    return t;
};

var insertChatItem = function (chat) {
    var chats = $('#id-div-chats');
    var t = chatItemTemplate(chat);
    chats.append(t);
};

var chatResponse = function (r) {
    var chat = JSON.parse(r);
    insertChatItem(chat);
};

var subscribe = function (channel) {
    var url = "/" + channel + '/subscribe';
    var sse = new EventSource(url);
    sse.onmessage = function (e) {
        log(e, e.data);
        chatResponse(e.data);
    };
};

var sendMessage = function (channel) {
    var name = $('#id-input-name').val();
    var content = $('#id-input-content').val();
    var message = {
        name: name,
        content: content
    };

    var request = {
        url: '/' + channel + '/add',
        type: 'post',
        contentType: 'application/json',
        data: JSON.stringify(message),
        success: function (r) {
            log('success', r);
        },
        error: function (err) {
            log('error', err);
        }
    };
    $.ajax(request);
};

// 加载 最后一页的 聊天信息 20条
var loadLastChatList = function (channel) {
    var request = {
        url: '/' + channel + '/list',
        type: 'GET',
        dataType: 'json',
        success: function (chats) {
            log('load messages success', chats, typeof (chat));
            $(chats).each(function (i, chat) {
                chat = JSON.parse(chat);
                insertChatItem(chat)
            })
        },
        error: function (err) {
            log('load messages error', err);
        }
    };
    $.ajax(request);
};


var bindActions = function (channel) {
    $('#id-button-send').on('click', function () {
        // $('#id-input-content').val();
        sendMessage(channel);
    });
};

var activeChannel = function (channel) {
    $('.pure-menu-item a').each(function (i, element) {
        console.log(i, element, $(this).data('channel'));
        if ($(this).data('channel') === channel) {
            $(this).addClass('active');
            return false;
        }
    })
};

// long time ago
var longTimeAgo = function () {
    var timeAgo = function (time, ago) {
        return Math.round(time) + ago;
    };

    $('time').each(function (i, e) {
        var past = parseInt(e.dataset.time);
        var now = Math.round(new Date().getTime() / 1000);
        var seconds = now - past;
        var ago = seconds / 60;
        // log('time ago', e, past, now, ago);
        var oneHour = 60;
        var oneDay = oneHour * 24;
        // var oneWeek = oneDay * 7;
        var oneMonth = oneDay * 30;
        var oneYear = oneMonth * 12;
        var s = '';
        if (seconds < 60) {
            s = timeAgo(seconds, ' 秒前')
        } else if (ago < oneHour) {
            s = timeAgo(ago, ' 分钟前');
        } else if (ago < oneDay) {
            s = timeAgo(ago / oneHour, ' 小时前');
        } else if (ago < oneMonth) {
            s = timeAgo(ago / oneDay, ' 天前');
        } else if (ago < oneYear) {
            s = timeAgo(ago / oneMonth, ' 月前');
        }
        $(e).text(s);
    });
};

var __main = function () {
    var channel = $('#currentChannel').data('name');
    console.log(channel, arguments);
    activeChannel(channel);
    loadLastChatList(channel);
    subscribe(channel);
    bindActions(channel);
    setInterval(function () {
        longTimeAgo();
    }, 1000);
};

$(document).ready(function () {
    __main();
});