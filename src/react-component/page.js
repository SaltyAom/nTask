import React from "react"

import Dexie from "dexie"
import * as $ from "jquery"

export class Page extends React.Component {
    constructor(props){
        super(props);

        let dateClass = new Date(), 
            day = dateClass.getDay(),
            date = dateClass.getDate(),
            dayText = ["sun","mon","tue","wed","thu","fri","sat"],
            fullText = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
            todayText = dayText[day],
            fullDayText = fullText[day];

        this.state = {
            page: this.props.page,
            select: day,
            task: [],
            taskState: [],
            taskCount: 0,
            taskDone: 0,
            dayText: todayText,
            fullDayText: fullDayText,
            date: date,
            alertType: "",
            subject: ""
        }

        this.addTask = this.addTask.bind(this);
        this.deleteTask = this.deleteTask.bind(this);
        this.handleSelect = this.handleSelect.bind(this);

        $(window).scroll(() => {
            scrollEvent();
            $(window).unbind("scroll");
        }); 

        console.log("Constructor");
    }

    async componentWillMount(){
        let date = new Date(),
            data = [],
            classArr = [];

        const mist = new Dexie("mist");
        mist.version(3).stores({
            task: "++id, day, staticStart"
        })

        const pushData = mist.task.where("day").equals(this.state.select).sortBy("staticStart").then(arr => {
            data.push(arr);
            if(arr.length !== 0){
                arr.map(data => {             
                    var displayStartHour = 0, displayStartMin = 0;
                    if(date.getHours() <= 9) { displayStartHour = "0" + date.getHours(); } else { displayStartHour = date.getHours(); }
                    if(date.getMinutes() <= 9)  { displayStartMin = "0"  + date.getMinutes();  } else { displayStartMin  = date.getMinutes();  }

                    if(parseInt( String(displayStartHour) + String(displayStartMin) , 10 ) > parseInt(data.staticStart ,10) ) { 
                        var classState = "task-done" 
                    } else {
                        classState = "task-not-done"
                    }
                    classArr.push(classState);
                    return classArr;
                })
            }
        })

        this.setState({
            task: [],
            taskState: []
        })

        await pushData;

        this.setState({
            task: data[0],
            taskState: classArr
        })

        console.log("Will Mount");
    }

    componentDidMount(){
        $(`.day-tag[day="${this.state.select}"]`).addClass("active");

        $("#find-current-task").on("click",function(){
            if($(".task-not-done").length > 0){
                var currentElement = $(".task-not-done > .schedule-box > .schedule-header").first().offset().top - 150
            } else {
                currentElement = 0;
            }
            $("body,html").animate({
                scrollTop: currentElement
            }, 875);
        });

        $(`.day-tag[day="${this.state.select}"]`).click();
    
        console.log("Did Mount");
    }
    
    componentDidUpdate(){
        $(".day-tag.active").removeClass("active");
        $(`.day-tag[day="${this.state.select}"]`).addClass("active");
        $("#start-day-selector").val(this.state.select);

        let progressPercent = (this.state.taskDone / this.state.taskCount) * 100
        if(progressPercent === Infinity){ progressPercent = 100; }

        $("#landing-progression").css({"width":`${progressPercent}%`});

        let newSubject = ($(".task-done").last().children(".task-box").children(".schedule-header").html() !== "") ? $(".task-done").last().children(".task-box").children(".schedule-header").html() : "<span style='color:transparent !important'>a</span>";
        if(this.state.subject !== newSubject){
            this.setState({
                subject: newSubject
            })
        }
        console.log("Did Update");
    }

    componentWillReceiveProps(){
        window.scrollTo(0,0);
        if(this.props.page === "task"){
            const mist = new Dexie("mist");
            mist.version(3).stores({
                task: "++id, day, staticStart"
            })
            this.setState({
                task: []                
            })
            mist.task.where("day").equals(this.state.select).sortBy("staticStart").then(arrData => {
                arrData.map(data => {
                    this.setState(prevState => ({
                        task: [...prevState.task, data]
                    }))
                    return data;
                })
                return this.state.task;
            })       
        }        
        console.log("Will receive props");
    }

    handleReload(){
        window.location.reload();

        console.log("Reloead");
    }

    async addTask(e){
        e.preventDefault();

        let data = [],
            date = new Date(),
            classArr = [];

        $("#addData").addClass("clicked");
        let addDataTransaction = setInterval(() => {
            $("#addData").removeClass("clicked");
            clearInterval(addDataTransaction);
        }, 200);

        // Input
        let subject = $("#subject-input").val(),
            day = parseInt($("#start-day-selector").val(),10),
            startHour = parseInt($("#start-time-selector-hour").val(),10),
            startMin = parseInt($("#start-time-selector-minute").val(),10),
            endHour = parseInt($("#end-time-selector-hour").val(),10),
            endMin = parseInt($("#end-time-selector-minute").val(),10);

        if(startHour <= 9) { var displayStartHour = "0" + startHour; } else { displayStartHour = startHour; }
        if(startMin <= 9)  { var displayStartMin = "0"  + startMin;  } else { displayStartMin  = startMin;  }
        if(endHour <= 9)   { var displayEndHour = "0"   + endHour;   } else { displayEndHour   = endHour;   }
        if(endMin <= 9)    { var displayEndMin = "0"    + endMin;    } else { displayEndMin    = endMin;    }

        let displayTime = `${displayStartHour}:${displayStartMin} ~ ${displayEndHour}:${displayEndMin}`;

        let hourLeft = parseInt(endHour,10) - parseInt(startHour,10);
        if( (parseInt(endMin,10) - parseInt(startMin,10) ) < 0 ){
            hourLeft--;
            var minLeft = parseInt(endMin,10) + 60 - parseInt(startMin,10);
        } else { minLeft = parseInt(endMin,10) - parseInt(startMin,10); }
        if(hourLeft === 0){
            var timeDiff = `${minLeft} minute`;
        } else if(hourLeft === 1) {
            timeDiff = `${hourLeft} hour ${minLeft} minute`;
        } else {
            timeDiff = `${hourLeft} hours ${minLeft} minute`;
        }    

        let startTime = parseInt(String(displayStartHour) + String(displayStartMin),10),
            endTime = parseInt(String(displayEndHour) + String(displayEndMin),10);
            
        // Check validation
        if( ( subject.replace(/\s/g, '') ) === "" || (startTime > endTime)){
            this.setState({
                alertType: "fail"
            })
            return; 
        }
        
        const mist = new Dexie("mist");
        mist.version(3).stores({
            task: "++id, day, staticStart"
        })

        const putData = mist.task.put({
            day: day, 
            subject:subject, 
            time:{
                startHour:startHour,
                startMinute:startMin, 
                endHour:endHour, 
                endMinute:endMin
            }, 
            staticStart: startTime,
            displayTime: displayTime,
            timeDiff: timeDiff
        })

        await putData;

        mist.task.where("day").equals(this.state.select).count(count => {
            this.setState({
                taskCount: count,
            });
        })

        var taskDone = 0;
        const pushData = mist.task.where("day").equals(this.state.select).sortBy("staticStart").then(arr => {
            data.push(arr);
            if(arr.length !== 0){
                arr.map(data => {             
                    var displayStartHour = 0, displayStartMin = 0;
                    if(date.getHours() <= 9) { displayStartHour = "0" + date.getHours(); } else { displayStartHour = date.getHours(); }
                    if(date.getMinutes() <= 9)  { displayStartMin = "0"  + date.getMinutes();  } else { displayStartMin  = date.getMinutes();  }

                    if(parseInt( String(displayStartHour) + String(displayStartMin) , 10 ) > parseInt(data.staticStart ,10) ) { 
                        var classState = "task-done" 
                        taskDone++
                    } else {
                        classState = "task-not-done"
                    }
                    classArr.push(classState);
                    return classArr;
                })
            }
        })
        
        this.setState({
            task: [],
            taskState: [],
            alertType: "success"
        })

        await pushData;

        this.setState({
            task: data[0],
            taskState: classArr,
            taskDone: taskDone
        })
        console.log("Added task");
    }

    async deleteTask(e){
        let id = parseInt(e.target.getAttribute("taskid"),10),
            mist = new Dexie("mist"),
            data = [];

        $(`.main-task[scheduleid="${id}"]`).scrollLeft(0);

        mist.version(3).stores({
            task: "++id, day, staticStart"
        })

        const deleteTask = mist.task.where("id").equals(id).delete();
        await deleteTask;

        const pushData = mist.task.where("day").equals(this.state.select).sortBy("staticStart").then(arr => {
            data.push(arr);
        })
        this.state = {
            task: []
        }

        await pushData;

        this.setState({
            task: data[0]
        })

        $(`.day-tag[day="${this.state.select}"]`).click();

        console.log("Delete Task");
    }

    async handleSelect(e){
        let selected = parseInt(e.target.getAttribute("day"),10),
            date = new Date(),
            data = [],
            classArr = [],
            fullText = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
            fullDayText = fullText[selected];

        const setSelected = this.setState({
            select: selected,
            fullDayText: fullDayText
        })

        $(".day-tag.active").removeClass("active");
        $(`.day-tag[day="${selected}"]`).addClass("active");
        await setSelected;

        const mist = new Dexie("mist");
        mist.version(3).stores({
            task: "++id, day, staticStart"
        })

        mist.task.where("day").equals(this.state.select).count(count => {
            this.setState({
                taskCount: count,
            });
        })

        var taskDone = 0;
        const pushData = mist.task.where("day").equals(this.state.select).sortBy("staticStart").then(arr => {
            data.push(arr);
            if(arr.length !== 0){
                arr.map(data => {             
                    var displayStartHour = 0, displayStartMin = 0;
                    if(date.getHours() <= 9) { displayStartHour = "0" + date.getHours(); } else { displayStartHour = date.getHours(); }
                    if(date.getMinutes() <= 9)  { displayStartMin = "0"  + date.getMinutes();  } else { displayStartMin  = date.getMinutes();  }

                    if(parseInt( String(displayStartHour) + String(displayStartMin) , 10 ) > parseInt(data.staticStart ,10) ) { 
                        var classState = "task-done" 
                        taskDone++
                    } else {
                        classState = "task-not-done"
                    }
                    classArr.push(classState);
                    return classArr;
                })
            }
        })

        this.state = {
            task: [],
            taskState: []
        }

        await pushData;

        this.setState({
            task: data[0],
            taskState: classArr,
            taskDone: taskDone,
        })

        console.log("Handle Select");
    }

    render(){
        if(this.props.page === "task"){
            return(
                <div id="task" className="app-page" >
                    <div>
                        <div id="landing-task">

                            <div id="landing-hide-edge"></div>
                            <div id="landing-hide-shape"></div>

                            <div id="landing-task-block">
                                <div id="landing-task-head" className="clear-fix">

                                    <div id="landing-task-head-left">
                                        <div id="landing-date">
                                            {this.state.date}
                                        </div>
                                        <div id="landing-day">
                                            {this.state.dayText}
                                        </div>
                                    </div>
                                    <div id="landing-task-head-right">
                                        <div id="current-task" className="header-small">
                                            <span className="transparent">a</span>
                                            {this.state.subject}
                                            <span className="transparent">a</span>
                                        </div>
                                        <div className="content-large">
                                        Task {this.state.taskDone} / {this.state.taskCount}
                                        </div>
                                        <div id="landing-progress">
                                            <div id="landing-progression">
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                <div className="clear-fix landing-option-container">
                                    <div id="landing-add" className="landing-option" onClick={this.props.addSwitch}>
                                        Add new
                                    </div>
                                    <div id="find-current-task" className="landing-option">
                                        Current task
                                    </div>    
                                </div>

                            </div>

                        </div>

                        <div id="list-task-container">

                            <div className="container day-tag-container clear-fix">
                                <div className="day-tag" day="0" onClick={this.handleSelect}>Sunday</div>
                                <div className="day-tag" day="1" onClick={this.handleSelect}>Monday</div>
                                <div className="day-tag" day="2" onClick={this.handleSelect}>Tuesday</div>
                                <div className="day-tag" day="3" onClick={this.handleSelect}>Wednesday</div>
                                <div className="day-tag" day="4" onClick={this.handleSelect}>Thursday</div>
                                <div className="day-tag" day="5" onClick={this.handleSelect}>Friday</div>
                                <div className="day-tag" day="6" onClick={this.handleSelect}>Saturday</div>
                            </div>

                            <div id="daily-content">{this.state.fullDayText}</div>
                            <div id="task-list">
                                {
                                    this.state.task.map((data,index) =>
                                        <div className={`main-task schedule-item ${this.state.taskState[index]}`} scheduleid={data.id} starthour="timeStartHour" startmin="timeStartMin" endhour="timeEndHour" endmin="timeEndMin" key={index}>
                                            <div className="schedule-box task-box">
                                                <div className="schedule-header">{data.subject}</div>
                                                <div className="time-range-tag">
                                                    {data.displayTime}
                                                </div>
                                                <div className="time-range-tag">
                                                    {data.timeDiff}
                                                </div>
                                            </div>
                                            <div className="schedule-box">
                                                <div className="task-setting">
                                                    <div className="task-setting-icon setting-space"></div>
                                                    <div className="task-setting-icon task-delete" taskid={data.id} onClick={this.deleteTask}>
                                                        <i className="fas fa-times" taskid={data.id}></i><div className="task-setting-content" taskid={data.id}>Delete</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>                                    
                                    )
                                }
                            </div>
                            <div id="landing-new-task-container" onClick={this.props.addSwitch} select={this.state.select}>
                                <div id="landing-new-task" select={this.state.select}>
                                    <i className="fas fa-plus" select={this.state.select}></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        } else if(this.props.page === "list") {
            return(
                <div id="list" className="app-page">
                    <Alert alertType={this.state.alertType} />

                    <form id="form-add" onSubmit={this.addTask}>

                        <div className="input-content">Subject</div>            
                        <input id="subject-input" className="add-input" type="text" placeholder="Subject" />

                        <div id="time-selector-container" className="setting-container">
                            <div id="select-input-content-container" className="clear-fix">
                                <center>
                                    <div className="select-input-content time-input-content">
                                        Start
                                    </div>
                                    <div className="select-input-content time-input-content">
                                        End
                                    </div>
                                </center>
                            </div>
                            <div className="clear-fix">
                                <div className="select-time-container">
                                    <center>
                                        <div className="select-time-wrapper">
                                            <select id="start-time-selector-hour" className="select-input">
                                                <option value="0">00</option><option value="1">01</option><option value="2">02</option><option value="3">03</option><option value="4">04</option><option value="5">05</option><option value="6">06</option><option value="7">07</option><option value="8">08</option><option value="9">09</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option><option value="21">21</option><option value="22">22</option><option value="23">23</option>
                                            </select>
                                            <select id="start-time-selector-minute" className="select-input">
                                                <option value="0">00</option><option value="1">01</option><option value="2">02</option><option value="3">03</option><option value="4">04</option><option value="5">05</option><option value="6">06</option><option value="7">07</option><option value="8">08</option><option value="9">09</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option><option value="21">21</option><option value="22">22</option><option value="23">23</option><option value="24">24</option><option value="25">25</option><option value="26">26</option><option value="27">27</option><option value="28">28</option><option value="29">29</option><option value="30">30</option><option value="31">31</option><option value="32">32</option><option value="33">33</option><option value="34">34</option><option value="35">35</option><option value="36">36</option><option value="37">37</option><option value="38">38</option><option value="39">39</option><option value="40">40</option><option value="41">41</option><option value="42">42</option><option value="43">43</option><option value="44">44</option><option value="45">45</option><option value="46">46</option><option value="47">47</option><option value="48">48</option><option value="49">49</option><option value="50">50</option><option value="51">51</option><option value="52">52</option><option value="53">53</option><option value="54">54</option><option value="55">55</option><option value="56">56</option><option value="57">57</option><option value="58">58</option><option value="59">59</option>
                                            </select>
                                        </div>
                                    </center>
                                </div>
                                <div clsas="select-time-container">
                                    <center>
                                        <div className="select-time-wrapper">
                                            <select id="end-time-selector-hour" className="select-input">
                                                <option value="0">00</option><option value="1">01</option><option value="2">02</option><option value="3">03</option><option value="4">04</option><option value="5">05</option><option value="6">06</option><option value="7">07</option><option value="8">08</option><option value="9">09</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option><option value="21">21</option><option value="22">22</option><option value="23">23</option>
                                            </select>
                                            <select id="end-time-selector-minute" className="select-input">
                                                <option value="0">00</option><option value="1">01</option><option value="2">02</option><option value="3">03</option><option value="4">04</option><option value="5">05</option><option value="6">06</option><option value="7">07</option><option value="8">08</option><option value="9">09</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option><option value="21">21</option><option value="22">22</option><option value="23">23</option><option value="24">24</option><option value="25">25</option><option value="26">26</option><option value="27">27</option><option value="28">28</option><option value="29">29</option><option value="30">30</option><option value="31">31</option><option value="32">32</option><option value="33">33</option><option value="34">34</option><option value="35">35</option><option value="36">36</option><option value="37">37</option><option value="38">38</option><option value="39">39</option><option value="40">40</option><option value="41">41</option><option value="42">42</option><option value="43">43</option><option value="44">44</option><option value="45">45</option><option value="46">46</option><option value="47">47</option><option value="48">48</option><option value="49">49</option><option value="50">50</option><option value="51">51</option><option value="52">52</option><option value="53">53</option><option value="54">54</option><option value="55">55</option><option value="56">56</option><option value="57">57</option><option value="58">58</option><option value="59">59</option>
                                            </select>
                                        </div>
                                    </center>
                                </div>
                            </div>
                        </div>
                        <div id="add-tool-container">
                            <i id="input-exchange" className="fas fa-exchange-alt add-tool"></i>
                        </div>

                        <div className="input-content">Notify day</div>
                        <div className="setting-container">
                            <center>
                                <select className="select-input" id="start-day-selector">
                                    <option value="0">Sunday</option>
                                    <option value="1">Monday</option>
                                    <option value="2">Tuesday</option>
                                    <option value="3">Wednesday</option>
                                    <option value="4">Thursday</option>
                                    <option value="5">Friday</option>
                                    <option value="6">Saturday</option>
                                </select>
                            </center>
                        </div>

                        <center>
                            <button id="addData">
                                <div className="schedule-header">Create</div>
                            </button>
                        </center>

                    </form>
            
                </div>
            )
        } else if(this.props.page === "setting"){
            return(
                <div id="setting" className="app-page">

                    <div className="schedule-item schedule-setting clear-fix">
                        <div className="setting-group setting-special-blue">
                            <div className="setting-tab" onClick={this.handleReload}>
                                <div className="setting-icon">
                                    <i className="fas fa-sync-alt"></i>
                                </div>
                                <div className="setting-content">Refresh</div>
                            </div>
                            <div id="reset-task" className="setting-tab">
                                <div className="setting-icon">
                                    <i className="fas fa-unlink"></i>
                                </div>
                                <div className="setting-content">Reset Task</div>
                            </div>
                            <div className="setting-tab">
                                <div className="setting-icon">
                                    <i className="fas fa-code-branch"></i>
                                </div>
                                <div className="setting-content">Developer Log</div>
                            </div>
                            <div className="setting-tab" onClick={this.props.handleUpdate}>
                                <div className="setting-icon">
                                    <i className="fas fa-wrench"></i>
                                </div>
                                <div className="setting-content" onClick={this.props.requestUpdate}>Force Update</div>
                            </div>
                        </div>
                    </div>
        
                <div id="setting-version" className="setting-info">{this.props.version}</div>
        
            </div>
            )
        }  else {
            return(null)
        }
    }
}

export class Title extends React.Component {
    render(){
        if(this.props.visible === "true"){
            return(
                <div id="daily-setting">
                    <div className="header-medium">Daily Setting</div>
                </div>
            )
        } else {
            return(null)
        }
    }
}

export class Alert extends React.Component {
    componentWillUpdate(){
        if(this.props.alertType === "fail"){
            $("#add-alert").fadeIn(0);
            $("#add-alert-error-box").fadeOut(0).toggle(300);
            $("#add-alert-error-box").unbind().on("click", () => {
                $("#add-alert-error-box").fadeIn(0).toggle(300);
                $("#add-alert").delay(300).fadeOut(0);
            });  
            let autoDismiss = setInterval(() => {
                $("#add-alert-error-box").fadeIn(0).toggle(300);
                $("#add-alert").delay(300).fadeOut(0);
                clearInterval(autoDismiss);
            }, 3000);
        }
    }

    render(){
        /*
        if(this.props.alertType === "success"){
            return(null)
        } else if(this.props.alertType === "fail"){
        */
        return(
            <div id="add-alert" style={{display:"none"}}>
                <div id="add-alert-wrapper">
                    <center>
                        <div id="add-alert-error-box" style={{display:"none"}}>
                            <div id="add-alert-content-error">Add Fail</div>
                        </div>
                    </center>
                </div>
            </div>
        )
        /*
        } else {
            return(null)
        }
        */
    }
}

const scrollEvent = () => {
    var scrollEvent = setInterval(function(){
        clearInterval(scrollEvent);
        window.newScroll = $(this).scrollTop();
        if (window.newScroll > window.lastScrollTop){
            $("#tabs-bar").addClass("hide");
        } else {
            $("#tabs-bar").removeClass("hide");
        }
        window.lastScrollTop = window.newScroll;
        bindScrollEvent();
    },250);
}

const bindScrollEvent = () => {
    $(window).scroll(function(event){
        scrollEvent();
        $(window).unbind("scroll");
    });
}