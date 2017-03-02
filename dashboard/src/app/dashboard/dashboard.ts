/**
 * Created by root on 17-2-14.
 */
import { Component,OnInit} from '@angular/core';

import { Http } from '@angular/http';

import {CookieService} from 'angular2-cookie/core';

declare var $: any;

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.html',
  styleUrls:['./dashboard.css']
})

export class DashboardComponent implements OnInit{
    constructor(public http:Http,private cookieService:CookieService) {}
    //--------------------------api接口----------------------------------
    api_config={
        Qps:'/api/getQps',
        ProblemCount:'/api/getProblemCount',
        SeverityColors:'/api/getSeverityColors',
        ProblemPriorityCount:'/api/getProblemPriorityCount',
        ProblemTrendsCount:'/api/getProblemTrendsCount',
        Version:'/api/getVersion',
    };

    //--------------------------定时器----------------------------------
    cancelInterval(name): void {
        if (name != null) {
            clearInterval(name);
        }
    };

    //--------------------------数据格式----------------------------------
    Format(){
        let date=new Date();
        let M=date.getMonth()+1,
            d=date.getDate(),
            h=date.getHours(),
            m=date.getMinutes()>=10?date.getMinutes():'0'+date.getMinutes(),
            s=date.getSeconds()>=10?date.getSeconds():'0'+date.getSeconds(),
            y=date.getFullYear();
        return h+":"+m+":"+s;
    }

    //--------------------------颜色设置----------------------------------
    colors=[];
    getColors(){
        this.http.get(this.api_config.SeverityColors).subscribe(res=>{
            let statusColors=res.json().content;
            for(let key = statusColors.length-1; key >=0; key--){
                this.colors.push("#"+statusColors[key]);
            }
        });
    }

    //-----------------------------------版本更新提示------------------------------------
    intervalId_5=null;
    tips={};
    Tips(){
        this.http.get(this.api_config.Version,{}).subscribe(res=>{
            if(res.json().code == 200){
                this.tips=res.json().content;
            }
            else{
                return ;
            }

        });
    }
    getTips(){
        this.cancelInterval(this.intervalId_5);
        this.intervalId_5= window.setInterval(() => {
            this.Tips();
        }, 3600000);
    }

    //-----------------------------------实时故障每秒写入数量------------------------------------
    Qps='';
    updateQps='';
    intervalId_1=null;
    qpsTimes=[{id:0.5,value:'30秒',flag:false},{ id:1,value:'1分钟',flag:true},{ id:2,value:'2分钟',flag:false},{id:5,value:'5分钟',flag:false}];
    qps(){
        this.http.get('/api/getQps',{}).subscribe(res=>{
            if(res.json().code == 200){
                if(res.json().content == ''){
                    this.Qps='0';
                }
                else{
                    this.Qps=res.json().content;
                }
            }
            else{
               return ;
            }

        });
        this.updateQps=this.Format();
    }
    getQps(timer){
        let time_distance=timer.id*1000*60;
        this.cancelInterval(this.intervalId_1);
        this.intervalId_1=window.setTimeout(()=>{
            this.getQps(timer);
            this.qps();
        }, time_distance);
        this.setCookie('timeQPS',timer);
        for(let k in this.qpsTimes){
            if(this.qpsTimes[k].id==timer.id){
                this.qpsTimes[k].flag=true;
            }
            else{
                this.qpsTimes[k].flag=false;
            }
        }
    }

    //-----------------------------------实时故障数量/实时故障设备---------------------------------
    chartDataLevel=[];
    updateProblemNum="";
    problemNum='';
    deviceNum='';
    intervalId_2=null;
    problemCountTimes=[{id:0.5,value:'30秒',flag:false},{ id:1,value:'1分钟',flag:true},{ id:2,value:'2分钟',flag:false},{id:5,value:'5分钟',flag:false}];
    ProblemCount(){
        this.http.get(this.api_config.ProblemCount,{}).subscribe(res=>{
            if(res.json().code == 200){
                if(res.json().content==''){
                    this.problemNum='0';
                    this.deviceNum='0';
                }
                else{
                    this.problemNum=res.json().content.problemCount;
                    this.deviceNum=res.json().content.deviceCount;
                }
                this.updateProblemNum=this.Format();
            }
            else{
                return ;
            }
        });

    }
    getProblemCount(timer){
        this.setCookie('timeProblemCount',timer);
        for(let k in this.problemCountTimes){
            if(this.problemCountTimes[k].id==timer.id){
                this.problemCountTimes[k].flag=true;
            }
            else{
                this.problemCountTimes[k].flag=false;
            }
        }
        let time_distance=timer.id*1000*60;
        this.cancelInterval(this.intervalId_2);
        this.intervalId_2 =window.setInterval(()=>{
            this.ProblemCount();
        },time_distance)
    }
    //-----------------------------------实时故障级别分布图---------------------------------------
    pieData=[];
    pieDataSum=0;
    templateObj=[];
    updateChartData='';
    intervalId_3=null;
    public chartData={};
    ProblemPriorityError=false;
    ProblemPriorityCounts=[{id:0.5,value:'30秒',flag:false},{ id:1,value:'1分钟',flag:true},{ id:2,value:'2分钟',flag:false},{id:5,value:'5分钟',flag:false}];
    ProblemPriorityCount(){
        this.http.get(this.api_config.ProblemPriorityCount,{}).subscribe(res=>{
            if(res.json().code == 200){
                this.updateChartData=this.Format();
                if(res.json().content.length==0){
                    this.ProblemPriorityError=true;
                }
                else{
                    this.ProblemPriorityError=false;
                    this.templateObj=[];
                    this.pieData=[];
                    this.pieDataSum=0;
                    this.chartDataLevel=[];
                    let contentObject=res.json().content;
                    for (let key in contentObject){
                        let level='';
                        switch(key){
                            case '5' : level="灾难";break;
                            case '4' : level="严重";break;
                            case '3' : level="一般";break;
                            case '2' : level="警告";break;
                            case '1' : level="信息";break;
                            case '0' : level="提示";break;
                        }
                        this.templateObj.push({value:contentObject[key],name:level});
                        this.pieDataSum +=parseInt(contentObject[key]);
                    }
                    let len=this.templateObj.length;
                    for(let key = len-1; key>=0; key--){
                        this.pieData.push(this.templateObj[key]);
                        let data_val=parseInt(this.templateObj[key].value)/this.pieDataSum*100;
                        this.chartDataLevel.push({value:data_val.toFixed(2)+'%',name:this.templateObj[key].name,color:this.colors[len-key-1]});
                    }
                    this.chartData= {
                        color:this.colors,
                        tooltip : {
                            trigger: 'item',
                            formatter: "{a} <br/>{b} : {c} ({d}%)"
                        },
                        toolbox: {
                            itemSize:10,
                            iconStyle:{
                                itemSize:10,
                            }
                        },
                        legend: {
                            show:false,
                            orient: 'vertical',
                            x: 'left',
                            bottom:'80',
                            data:['灾难','严重','一般','警告','信息','提示']
                        },
                        calculable : true,
                        series: [
                            {
                                name:'实时故障级别分布',
                                type:'pie',
                                radius: ['40%', '55%'],
                                avoidLabelOverlap: false,
                                label: {
                                    normal: {
                                        show: false,
                                        position: 'center',
                                        color: 'red',
                                    },
                                    emphasis: {
                                        show: true,
                                        textStyle: {
                                            fontSize: '20',
                                            fontWeight: 'bold',
                                        }
                                    }
                                },
                                labelLine: {
                                    normal: {
                                        show: false,
                                        color: 'red',
                                    }
                                },
                                data:this.pieData
                            }
                        ]
                    };
                }

            }
            else{
                return ;
            }
        });
    }
    getProblemPriorityCount(timer){
        this.setCookie('timeProblemPriority',timer);
        for(var k in this.ProblemPriorityCounts){
            if(this.ProblemPriorityCounts[k].id==timer.id){
                this.ProblemPriorityCounts[k].flag=true;
            }
            else{
                this.ProblemPriorityCounts[k].flag=false;
            }
        }
        let time_distance=timer.id*1000*60;
        this.cancelInterval(this.intervalId_3);
        this.intervalId_3 =window.setInterval(()=>{
            this.ProblemPriorityCount();
        },time_distance)
    }
    ChartDataColor(color){
        let styles={
            'background-color':color
        };
        return styles;
    }
    //-----------------------------------实时历史趋势图------------------------------------------
    lineData_x=[];
    lineData_y=[];
    updateLineData='';
    intervalId_4=null;
    public LineData={};
    ProblemTrendsError=false;
    ProblemTrendsCounts=[{ id:5,value:'5分钟',flag:true},{ id:10,value:'10分钟',flag:false},{id:15,value:'15分钟',flag:false}];
    ProblemTrendsCount(){
        this.updateLineData=this.Format();
        this.lineData_x=[];
        this.lineData_y=[];
        this.http.get(this.api_config.ProblemTrendsCount,{search:'days='+this.trafficLevel.id.toString()}).subscribe(res=>{
            if(res.json().code==200){
                let contentArray=res.json().content;
                if(contentArray.length==0){
                    this.ProblemTrendsError=true;
                }
                else{
                    this.ProblemTrendsError=false;
                    for (let key in contentArray){
                        this.lineData_x.push(contentArray[key].time);
                        this.lineData_y.push(contentArray[key].cnt);
                    }
                    this.LineData={
                        title: {
                            text: '',
                        },
                        tooltip : {
                            trigger: 'axis'
                        },
                        legend: {
                            data:[],
                            show:false
                        },
                        toolbox: {
                            show : true,
                        },
                        calculable : true,
                        xAxis : [
                            {
                                type : 'category',
                                boundaryGap : false,
                                data :this.lineData_x
                            }
                        ],
                        yAxis : [
                            {
                                type : 'value'
                            }
                        ],
                        series : [
                            {
                                name:'故障个数',
                                type:'line',
                                smooth:true,
                                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                                data:this.lineData_y
                            }
                        ],
                        color:['#49B0FE'],
                    };
                }
            }
            else{
                return ;
            }

        })
    }
    getProblemTrendsCount(timer){
        this.setCookie('timeProblemTrends',timer);
        for(var k in this.ProblemTrendsCounts){
            if(this.ProblemTrendsCounts[k].id==timer.id){
                this.ProblemTrendsCounts[k].flag=true;
            }
            else{
                this.ProblemTrendsCounts[k].flag=false;
            }
        }
        let time_distance=timer.id*1000*60;
        this.getColors();
        this.cancelInterval(this.intervalId_4);
        this.intervalId_4 =window.setInterval(()=>{
           this.ProblemTrendsCount();
        },time_distance)
    }
    powers=[{
        id:1,value:'一天内'
    },{
        id:2,value:'两天内'
    },{
        id:7,value:'一周内'
    },{
        id:14,value:'两周内'
    },{
        id:30,value:'一月内'
    },{
        id:60,value:'两月内'
    },{
        id:180,value:'六月内'
    },{
        id:365,value:'一年内'
    }]
    trafficLevel={id:0,value:''};

    selected(date){
        this.setCookie('DateTime',date);
        this.trafficLevel=date;
        this.ProblemTrendsCount();
        this.updateLineData=this.Format();
    }

    //-----------------------------------cookie------------------------------------------
    optionsExpire={
        expires:new Date(new Date().setTime(new Date().getTime()+10*24*3600*1000+8*3600*1000))
    };
    setCookie(name,item){
        this.cookieService.putObject(name,item,this.optionsExpire);
    }
    getCookie(name){
        return this.cookieService.get(name);
    }

    //-------------------------------------初始化------------------------------------------
    ngOnInit(){
        this.username=window.localStorage;
        //初始化
        this.getColors();

        this.init();
    }
    init(){
        this.Tips();   //version update
        //qps cookie and time distance
        this.updateQps=this.Format();
        this.qps();

        this.updateProblemNum=this.Format();
        this.ProblemCount();

        this.updateChartData=this.Format();
        this.ProblemPriorityCount();

        this.updateLineData=this.Format();
        this.ProblemTrendsCount();

        let qpsTime=this.getCookie("timeQPS");
        if(qpsTime==undefined){
            let qpsTimer=this.qpsTimes[1];
            this.getQps(qpsTimer);
        }
        else{
            let str_qps=JSON.parse(qpsTime);
            this.getQps(str_qps);
        }

        //problemCount cookie and time distance
        let problemCountTime=this.getCookie("timeProblemCount");
        if(problemCountTime==undefined){
            this.getProblemCount(this.problemCountTimes[1]);
        }
        else{
            let str_2=JSON.parse(problemCountTime);
            this.getProblemCount(str_2);
        }

        //ProblemPriority cookie and time distance
        let ProblemPriorityTime=this.getCookie('timeProblemPriority');
        if(ProblemPriorityTime==undefined){
            this.getProblemPriorityCount(this.ProblemPriorityCounts[1]);
        }
        else{
            let str_3=JSON.parse(ProblemPriorityTime);
            this.getProblemPriorityCount(str_3);
        }

        //ProblemTrends cookie and time distance
        let ProblemTrendsTime=this.getCookie('timeProblemTrends');
        if(ProblemTrendsTime==undefined){
            this.getProblemTrendsCount(this.ProblemTrendsCounts[0]);
        }
        else{
            let str_4=JSON.parse(ProblemTrendsTime);
            this.getProblemTrendsCount(str_4);
        }

        let timeDate=this.getCookie('DateTime');
        if(timeDate==undefined){
            this.trafficLevel=this.powers[0];
            this.selected(this.trafficLevel);
        }
        else{
            let str_5=JSON.parse(timeDate);
            this.trafficLevel=str_5;
            this.selected(str_5);
        }
    }
    username={};
}
