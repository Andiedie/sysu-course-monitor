# About
sysu-course-monitor

take your favorite course automatically

http://uems.sysu.edu.cn/elect/

# Prerequisite
[node.js](https://nodejs.org/en/) v8.0.0 or greater

# How to use
## install
```bash
git clone https://github.com/Andiedie/sysu-course-monitor.git
cd sysu-course-monitor
npm i
```
## config
input your information in file `/config/index.js`

require:
- NetID
- password
- interval

optional:
- appid
- appsecret
- template_id
for more infomation about wechat-inform, see [this](https://github.com/Andiedie/wechat-inform)

## setting
input your favorite courses in file `/config/settings.json`

for example
```js
...
  "公选": {
    // true if you want it works
    "enable": false,
    /*
     * name of your current selected course
     * whenever there is a selectalbe course in * targets
     * this replace course will be drop
     */
    "replace": "",
    /*
     * Here are your favorite courses
     * you should input their name, time and teacher
     * these information should be exectly the same as them in http://uems.sysu.edu.cn/elect/
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
for more infomation about wechat-inform, see [this](https://github.com/Andiedie/wechat-inform)

There should be `status` and `message` field in your template.

example
```
status: {{status.DATA}}

{{message.DATA}}
```

## License
MIT
