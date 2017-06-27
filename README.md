# Ⅰ. About
sysu-course-monitor

Take your favorite course.

http://uems.sysu.edu.cn/elect/

# Ⅱ. Feature
- You can have a list of targets
- Inform you the result in WeChat
- Automatically re-login when error occur
- Support replacing a course
- Re-select replace course when fail to select target

# Ⅲ. Prerequisite
- [node.js](https://nodejs.org/en/) v8.0.0 or greater

# Ⅳ. How to use
## 1. install
```bash
git clone https://github.com/Andiedie/sysu-course-monitor.git
cd sysu-course-monitor
npm i --production
```
## 2. config
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

## 3. setting
Input your favorite courses in file `/config/settings.json`.

Example
```js
...
  "公选": {
    // true if you want it to work
    "enable": false,
    /*
     * class id of your current selected course
     * whenever there is a selectalbe course in targets
     * this replace course will be drop
     */
    "replace": "",
    /*
     * Here are the courses you want
     * require class id
     * you can write comment to remind the course name
     */
    "targets": [{
      "id": "",
      "comment": ""
    }]
  }
...
```

### how to get class id
![](http://ocphk5wc7.bkt.clouddn.com//17-6-27/13741516.jpg)

## 4. run
```bash
npm start
```

## 5. wechat-inform
If you want to receive a **wechat message** after obtaining your chosen course successfully, these fields in `/config/index.js` are required

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

### 5.1 Template
There should be `status` and `message` field in your template.

Example
```
status: {{status.DATA}}

{{message.DATA}}
```

More infomation about [wechat-inform](https://github.com/Andiedie/wechat-inform).

## Ⅴ. License
MIT
