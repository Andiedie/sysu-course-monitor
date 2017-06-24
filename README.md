# About
sysu-course-monitor

Take your favorite course automatically.

http://uems.sysu.edu.cn/elect/

# Prerequisite
- [node.js](https://nodejs.org/en/) v8.0.0 or greater

# How to use
## install
```bash
git clone https://github.com/Andiedie/sysu-course-monitor.git
cd sysu-course-monitor
npm i --production
```
## config
Input your information in file `/config/index.js`.

Require:
- NetID
- password
- interval

Optional:
- appid
- appsecret
- template_id

for more infomation, see [this](#wechat-inform).

## setting
Input your favorite courses in file `/config/settings.json`.

Example
```js
...
  "公选": {
    // true if you want it to work
    "enable": false,
    /*
     * name of your current selected course
     * whenever there is a selectalbe course in targets
     * this replace course will be drop
     */
    "replace": "",
    /*
     * Here are the courses you want
     * their name, time and teacher is needed
     * the information should be exectly the same as it in http://uems.sysu.edu.cn/elect/
     */
    "targets": [{
      "name": "",
      "time": "",
      "teacher": ""
    }]
  }
...
```

## run
```bash
npm start
```

## wechat-inform
If you want to receive a **wechat message** after obtaining your chosen course successfully, these fields in `/config/index.js` are require

```js
// should be true if you want it to work
exports.wechatInform = true;

// App ID of test account
exports.appid = secret.appid;

// App Secret of test account
exports.appsecret = secret.appsecret;

// Template ID of message
exports.template_id = secret.template_id;
```

You can get your own `appid`, `appsecret` and `template_id` in [wechat test account](http://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login)

### Template
There should be `status` and `message` field in your template.

Example
```
status: {{status.DATA}}

{{message.DATA}}
```

More infomation about [wechat-inform](https://github.com/Andiedie/wechat-inform).

## License
MIT
