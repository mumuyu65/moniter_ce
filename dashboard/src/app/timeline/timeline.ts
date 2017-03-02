/**
 * @author yuyangyang@oneoaas.com
 */
import { Component,OnInit } from '@angular/core';

import { Http} from '@angular/http';

import { CookieService } from 'angular2-cookie/core';

@Component({
  selector: 'timeline',
  templateUrl: './timeline.html',
  styleUrls:['./timeline.css']
})

export class TimelineComponent implements OnInit {
  //这里操作时间线的数据
  constructor(
      public http: Http,
      private cookieService: CookieService,
  ) {}

  colors = [];
  powers = [];

  getColors(){
    this.http.get('/api/getSeverityColors').subscribe(res=> {
      if(res.json().code == 200){
        let statusColors = res.json().content;
        window.localStorage.setItem("initColor",statusColors[0]);
        let level='';
        let templateObj=[];
        for (let key in statusColors) {
          this.colors.push("#" + statusColors[key]);
          switch(key){
            case '5' : level=">=灾难";break;
            case '4' : level=">=严重";break;
            case '3' : level=">=一般";break;
            case '2' : level=">=警告";break;
            case '1' : level=">=信息";break;
            case '0' : level=">=提示";break;
          }
          let contentObj={id:parseInt(key),value:level,color:"#"+statusColors[key]};
          templateObj.push(contentObj);
        }
        this.powers=templateObj;
      }
      else{
        return ;
      }

    });
  }
  //---------------------------------实时故障详情展示-----------------------------
  dataTimes = [{id: 0.5, value: '30秒', flag: false}, {id: 1, value: '1分钟', flag: true}, {
    id: 2,
    value: '2分钟',
    flag: false
  }, {id: 5, value: '5分钟', flag: false}];

  items = [];

  cancelInterval(): void {
    if (this.intervalId != null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  };   // 定时刷新

  intervalId = null;
  timelineError=false;
  timeline() {
    this.http.get('/api/getLastProblems', {
      search: 'limit=' + this.DataNum +
      '&priority=' + this.trafficLevel.id
    }).subscribe(res=> {
      if (res.json().code == 200) {
        this.items = [];
        let contentObject = res.json().content;
        if(contentObject.length==0){
          this.timelineError=true;
        }
        else{
          this.timelineError=false;
          for (let key in  contentObject) {
            contentObject[key].color = this.colors[contentObject[key].priority];
            this.items.push(contentObject[key]);
          }
          this.updateTimeLine = this.Format();
        }
      } else {
        return;
      }
    })
  }

  getTimeLine(data) {
    this.setCookie('dataRefresh', data);
    for (let key in this.dataTimes) {
      if (data.id == this.dataTimes[key].id) {
        this.dataTimes[key].flag = true;
      }
      else {
        this.dataTimes[key].flag = false;
      }
    }
    let time_distance = data.id * 1000 * 60;
    this.cancelInterval();
    this.intervalId = window.setTimeout(() => {
      this.getTimeLine(data);
      this.timeline();
    }, time_distance);
  }

  setStyles(color) {
    let styles = {
      'border': '2px solid ' + color,
    };
    return styles;
  }   //圆点样式设置

  setColor(color) {
    let styles = {
      // CSS property names
      'color': color,
    };
    return styles;
  }    //字体颜色设置

  //---------------------------------模拟下拉框样式设置-----------------------------
  trafficLevel = {id: 0, value: '>=提示', color:''};
  setTip(color) {
    let styles = {
      "background-color": color
    };
    return styles;
  }

  setTipStyle(color) {
    let styles = {
      "display": "inline-block",
      "width": '5px',
      "height": '5px',
      "border-radius": '50%',
      "background-color": color,
      "margin-bottom": " 2px"
    };
    return styles;
  }

  //-----------------------------------选择故障级别-------------------------------
  selected(item) {
    this.setCookie('trafficLevel', item);
    this.updateTimeLine = this.Format();
    this.trafficLevel = item;
    this.timeline();
  }

  //----------------------------------格式化数据显示样式---------------------------
  Format() {
    let date = new Date();
    let M = date.getMonth() + 1,
        d = date.getDate(),
        h = date.getHours(),
        m = date.getMinutes() >= 10 ? date.getMinutes() : '0' + date.getMinutes(),
        s = date.getSeconds() >= 10 ? date.getSeconds() : '0' + date.getSeconds(),
        y = date.getFullYear();
    return h + ":" + m + ":" + s;
  }

  //----------------------------------故障显示数量---------------------------------
  updateTimeLine = '';
  DataNum = '';
  DataNums = [{id: 10, value: '10'},{id: 20, value: '20'},{id: 30, value: '30'},{id: 50, value: '50'},{id: 100, value: '100'}];
  getDataNum(Num) {
    this.setCookie('timelineNum', Num);
    this.updateTimeLine = this.Format();
    this.DataNum = Num;
    this.timeline();
  }

  //----------------------------------初始化-------------------------------------
  ngOnInit() {
    this.getColors();
    this.updateTimeLine = this.Format();
    this.timeline();
    this.init();
  }

  init() {
    //记录查询数据条数
    let num = this.getCookie('timelineNum');
    let level = this.getCookie('trafficLevel');
    let dataRefresh = this.getCookie('dataRefresh');

    if (num == undefined) {
      this.DataNum = this.DataNums[3].value;
    }
    else {
      this.DataNum = this.getCookie('timelineNum');
    }

    if (level == undefined) {
      let item=window.localStorage.getItem('initColor');
      this.trafficLevel.color='#'+item;
    }
    else{
      this.trafficLevel.color='';
      let str1 = JSON.parse(level);
      this.trafficLevel = str1;
    }

    if (dataRefresh == undefined) {
      let timer = this.dataTimes[1];
      this.getTimeLine(timer);
    }
    else {
      let str2 = JSON.parse(dataRefresh);
      this.getTimeLine(str2);
    }
  }

  //----------------------------cookie设置---------------------------------------
  optionsExpire = {
    expires: new Date(new Date().setTime(new Date().getTime() + 10 * 24 * 3600 * 1000 + 8 * 3600 * 1000 ))
  };

  setCookie(name, item) {
    this.cookieService.putObject(name, item, this.optionsExpire);
  }

  getCookie(name) {
    return this.cookieService.get(name);
  }
}