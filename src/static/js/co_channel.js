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
    var avatar = "https://cdn.v2ex.co/gravatar/" + name + "?s=73&d=retro";
    var t = `
        <div class="chat-item">
            <div class="user">
                <div class="user-avatar"><img src="${avatar}" class="user-avatar"></div>
                <div class="user-info">
                    <div class="user-name">${name}</div>
                    <div class="pass-time" href="#">
                        <time data-time="${time}"></time>
                    </div>
                </div>
            </div>
            <div class="user_content">
               ${content}
            </div>            
        </div>
        `;
    return t;
};

var appendChatItem = function (chat) {
    var chats = $('#id-div-chats');
    var t = chatItemTemplate(chat);
    chats.append(t);
};

var prependChatItem = function (chat) {
    var chats = $('#id-div-chats');
    var t = chatItemTemplate(chat);
    chats.prepend(t);
};

var chatResponse = function (r) {
    var chat = JSON.parse(r);
    appendChatItem(chat);
    incLoadCursor(); // fixme
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
var updateLoadCursor = function (cursor) {
    var sel = $('#loadPageBtn');
    sel.data('cursor_start', cursor);
    sel.attr('data-cursor_start', cursor);
    loadPageCursor(cursor);
};

var loadPageCursor = function (cursor) {
    if (cursor == -1 || cursor == null || cursor == undefined) {
        disableLoadBtn();
        return false;
    } else {
        return true;
    }
};

function disableLoadBtn() {
    var sel = $('#loadPageBtn');
    sel.addClass('disabled');
    sel.attr('disabled', 'disabled');
    sel.attr('data-loaded', 'true');
    sel.text('已全部加载');
}

var incLoadCursor = function () {
    var cursor = $('#loadPageBtn').data('cursor_start');
    if (loadPageCursor(cursor)) {
        cursor = cursor - 1;
        updateLoadCursor(cursor);
    }
};
// 加载 最后一页的 聊天信息 20条
var loadChatPage = function (channel) {
    var cursor = $('#loadPageBtn').data('cursor_start');
    var flag = loadPageCursor(cursor);
    console.log('cursor_start', cursor);
    if (flag) {
        var request = {
            url: '/' + channel + '/list?start=' + cursor,
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                log('load messages success', data);
                var chats = data.messages;
                var next_cursor = data.next_cursor;
                var loaded = data.loaded;
                console.log(chats, data, next_cursor);
                updateLoadCursor(next_cursor);
                if (loaded == false) {
                    disableLoadBtn();
                }
                $(chats).each(function (i, chat) {
                    chat = JSON.parse(chat);
                    prependChatItem(chat)
                })
            },
            error: function (err) {
                log('load messages error', err);
            }
        };
        $.ajax(request);
    }
};

var bindLoadPage = function (channel) {
    $('#loadPageBtn').on('click', function () {
        loadChatPage(channel)
    });
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
    loadChatPage(channel);
    subscribe(channel);
    bindActions(channel);
    bindLoadPage(channel);
    setInterval(function () {
        longTimeAgo();
    }, 1000);
};

$(document).ready(function () {
    __main();
});