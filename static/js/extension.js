mdui.setColorScheme('#3fb0ff')
const $ = mdui.$
let TAB = []

$.extend({
    info: (info) => {
        mdui.snackbar({
            message: info,
            closeOnOutsideClick: true
        })
    },
    bytes_resize: (size) => {
        if (!size) return '';
        let num = 1024.00 //byte
        if (size < num)
            return size + ' B'
        if (size < Math.pow(num, 2))
            return (size / num).toFixed(2) + ' KB' //kb
        if (size < Math.pow(num, 3))
            return (size / Math.pow(num, 2)).toFixed(2) + ' MB' //M
        if (size < Math.pow(num, 4))
            return (size / Math.pow(num, 3)).toFixed(2) + ' G' //G
        return (size / Math.pow(num, 4)).toFixed(2) + ' T' //T
    },
    join_path: (base, relative) => {
        // 移除基础目录末尾的斜杠
        base = base.replace(/\/$/, '')
        // 解析相对路径中的连续 ../
        let parts = relative.split('/')
        let stack = base.split('/')

        for (let i = 0; i < parts.length; i++) {
            if (parts[i] == '.') {
                // 跳过 ./ 目录
            } else if (parts[i] == '..') {
                if (stack.length > 1 || stack[0] != '') {
                    stack.pop()
                }
            } else {
                stack.push(parts[i])
            }
        }
        if (stack.length == 0 || stack[0] == '') {
            if (base[0] == '.') stack[0] = './'
            else stack[0] = '/'
        }
        let path = stack.join('/')
        if (path == '.') path = './'
        return path
    },
    download_file: (url, fileName) => {
        $.ajax({
            url: url,
            method: 'GET',
            xhrFields: {
                responseType: 'blob'
            },
            success: function (data) {
                let blob = data
                let a = document.createElement('a')
                a.href = URL.createObjectURL(blob)
                a.download = fileName
                a.click()
            }
        })
    },
    safecode: (length = 4) => {
        let ascii_letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
        let digits = "0123456789"
        let res = ""
        for (let i = 0; i < length; i++) {
            let choice = ascii_letters + digits
            res += choice.charAt(Math.floor(Math.random() * choice.length))
        }
        return res
    },
    sesdata: (data) => {
        if (typeof data === 'object' && data !== null) { // 设置数据并且返回key值
            let key = $.safecode()
            sessionStorage.setItem(key, JSON.stringify(data))
            return key
        } else if (typeof data === 'string') { // 用key值读取数据并且删除sessionStorage
            var data_str = sessionStorage.getItem(data)
            // 如果没有这个key，返回{}
            if (data_str === null) return {}
            sessionStorage.removeItem(data)
            try {
                // 尝试解析数据
                var data = JSON.parse(data_str)
                return data;
            } catch (e) { return {} }
        } else {
            return {}
        }
    },
    diff_page: (url, data = {}, open_new = true) => {
        if (url) {
            let key = $.sesdata(data)
            if (open_new) {
                window.open(url + '?code=' + key, '_blank')
            } else {
                window.location.href = url + '?code=' + key
            }
        } else {
            let url_params = new URLSearchParams(window.location.search)
            let code = url_params.get('code')
            let data = $.sesdata(code)
            return data
        }
    },
    load_script: (url, callback) => {
        $.info(url)
        var script = document.createElement('script')
        script.src = url
        script.onload = callback
        document.head.appendChild(script)
    },
    html_escape: (str) => {
        var escape_chars = {
            '<': '<',
            '>': '>',
            '&': '&',
            '"': '"',
            "'": "'",
        };
        return str.replace(/[<>&"']/g, function (m) {
            return escape_chars[m]
        })
    },
    change_font: (element_id, font) => {
        var element = document.getElementById(element_id)
        if (element) {
            element.style.fontFamily = font
        }
    },
    title: (title, type = 'all') => {
        if (type === 'all' || type === 'win') {
            document.title = title;
        }
        if (type === 'all' || type === 'bar') {
            $('#title').html(title);
        }
    },
    load_video: (id, type, api) => {
        $.load_script(
            '/static/flv.js/flv.min.js', (id, type, api) => {
                if (flvjs.isSupported()) {
                    var videoElement = document.getElementById(id);
                    var flvPlayer = flvjs.createPlayer({
                        type: type,
                        url: api
                    });
                    flvPlayer.attachMediaElement(videoElement);
                    flvPlayer.load();
                    flvPlayer.play();
                }
            }
        )
    },
    extract_integer_part: (fileSize) => {
        let regex = /^(\d+)/;
        let match = regex.exec(fileSize.replace(/\s/g, ''));
        if (match) {
            return parseInt(match[0]);
        }
        return null;
    },
    extract_unit: (fileSize) => {
        let regex = /([A-Za-z]+)/;
        let match = regex.exec(fileSize);
        if (match) {
            return match[0];
        }
        return null;
    },
    file_extension: (filename) => {
        let extension = filename.split('.').pop();
        return '.' + extension.toLowerCase();
    },
    colorify: (data) => {
        for (let name in data) {
            $(`mdui-icon[name="${name}"]`).css('color', data[name]);
        }
    },
    // 以下是特有函数
    extract_doi: (string) => {
        let pattern = /\b(10\.\d{4,}(?:\.\d+)*\/\S+(?:(?!["&'<>])\S))\b/;
        let match = string.match(pattern);
        if (match) {
            let doi = match[1];
            return doi;
        } else {
            return '';
        }
    },
    local_set: (key, val) => {
        localStorage.setItem(key, JSON.stringify(val));
    },
    local_get: (key) => {
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : null;
    },
    local_del: (key) => {
        localStorage.removeItem(key);
    },
    local_has: (key) => {
        return localStorage.getItem(key) !== null;
    },
    local_def: (key, val) => {
        if (localStorage.getItem(key)) {
            return JSON.parse(localStorage.getItem(key));
        } else {
            localStorage.setItem(key, JSON.stringify(val));
            return val;
        }
    },
    is_doi: (string) => {
        let extractedDoi = $.extract_doi(string);
        return extractedDoi === string;
    },
    file_proxy: (url) => {
        if ($.local_get('proxy') == true) {
            url = '/api_view/file/' + url
        }
        return url
    },
    active_account_icon: (select, active = false) => {
        $(select).find('mdui-circular-progress').hide()
        if (active) {
            $(select).find('mdui-avatar').show()
        } else {
            $(select).find('mdui-icon').show()
        }
    },
    account_uuid: () => {
        let uuid = ''
        $.ajax({
            method: 'GET',
            async: false,
            url: '/api_data/uuid',
            success: function (response) {
                uuid = response
            }
        });
        return uuid
    },
    account_name: () => {
        let name = ''
        $.ajax({
            method: 'GET',
            async: false,
            url: '/api_data/name',
            success: function (response) {
                name = response
            }
        });
        return name
    },
    account_complete: () => {
        let info = ''
        $.ajax({
            method: 'GET',
            async: false,
            url: '/api_data/complete',
            success: function (response) {
                info = response
            }
        });
        return info
    },
    pros_start: () => {
        let safecode = $.safecode()
        $('#pros').attr('code', safecode)
        $('#pros').show()
        return safecode
    },
    pros_end: (safecode) => {
        if (!safecode) return
        let nowcode = $('#pros').attr('code')
        if (nowcode != safecode) return
        $('#pros').hide()
        $('#pros').removeAttr('code')
    },
    pros_add: () => {
        let now = $('#pros').attr('num')
        if (now == undefined) {
            now = 1
        } else {
            now = parseInt(now) + 1
        }
        $('#pros').show()
        $('#pros').attr('num', now)
    },
    pros_ext: () => {
        let now = $('#pros').attr('num')
        if (now == undefined) now = 0
        now = parseInt(now)
        now -= 1
        if (now <= 0) {
            $('#pros').hide()
            $('#pros').attr('num', 0)
        } else {
            $('#pros').attr('num', now)
        }
    },
    translate: (text, func, fan) => {
        $.ajax({
            method: 'POST',
            url: '/api_view/translate',
            data: { 'text': text },
            success: function (response) {
                func(response)
            },
            complete: function (xhr, textStatus) {
                if (fan) fan()
            }
        });
    },
    init_tab: (list) => {
        if (list){
            $(list).each((index, value) => {
                $(value).hide()
            })
            TAB = list
        } else {
            $.init_tab(TAB)
        }
    },
    to_tab: (target) => {
        $.init_tab()
        $(target).show()
    }

});