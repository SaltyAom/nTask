$(document).ready(function(){

    // Initialize
    var date = new Date();
    date = date.getDay();
    getTask(date);
    svgDecode();
    $(".day-tag[day*='"+date+"']").addClass("active");
    $("#task").fadeIn(350);

    var date = new Date()
    var today = date.getDay();
    var hour = date.getHours();
    var minute = date.getMinutes();

    if(today == 0){
        var todayText = "Sunday";
        var todayShortText = "Sun";
    } else if(today == 1){
        var todayText = "Monday";
        var todayShortText = "Mon";
    } else if(today == 2){
        var todayText = "Tuesday";
        var todayShortText = "Tue";
    } else if(today == 3){
        var todayText = "Wednesday";
        var todayShortText = "Wed";
    } else if(today == 4){
        var todayText = "Thursday";
        var todayShortText = "Thu";
    } else if(today == 5){
        var todayText = "Friday";
        var todayShortText = "Fri";
    } else if(today == 6){
        var todayText = "Saturday";
        var todayShortText = "Sat";
    }

    $("#landing-day").html(todayShortText);
    $("#landing-date").html(date.getDate() );
    $("#daily-content").html(todayText);
    $("#start-day-selector").val(today);

    $("body").on("click",function(){
        void(0);
    });

    $("#start-time-selector-hour, #end-time-selector-hour").val(hour);
    $("#start-time-selector-minute, #end-time-selector-minute").val(minute);
    
    // Update
    $("#update").on("click",function(){
        console.info("Update request");
        $.ajax({
            url: "index.html",
            type: "POST",
            data: {msg: "Update"},
            contentType: false,
            cache: false,
            processData: false,
            success: function(result){
                $("#update-container").removeClass("hidden");
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    localStorage.clear();
                    caches.keys().then(function(names) {
                        for (let name of names)
                        caches.delete(name);
                    });
                    for(let registration of registrations) {
                        registration.unregister()
                    } 
                }).then(function(){
                    if ('serviceWorker' in navigator) {
                        navigator.serviceWorker.register('serviceWorker.js')
                        .then(function(registration) {
                            console.info('Registered:', registration);
                        }).catch(function(error) {
                            console.error('Registration failed: ', error);
                        });
                    }
                }).then(function(){
                    console.info("Updated!");
                    setInterval(function(){
                        location.reload();
                    }, 1000)
                });
            },
            error: function (jqXHR, exception) {
                console.warn("Not connected");
            }
        });
    });

    // Scroll
    $(window).scroll(function(event){
        scrollEvent();
        $(window).unbind("scroll");
        });

    // Tabs
    $(".tabs-nav").on("click",function(){
        var thisPage = $(this).attr("page");
        var previousPage = $("div.tabs-nav.active").attr("page");
        $("div.tabs-nav#"+previousPage+"-nav").removeClass("active");
        $("div.tabs-nav#"+thisPage+"-nav").addClass("active");
        $("div.app-page#"+previousPage).addClass("hidden");
        $("div.app-page.hidden#"+thisPage).removeClass("hidden");
        $("#task-navbar").addClass("hidden");
        if(thisPage == "list"){ $("#daily-setting").removeClass("hidden"); } else {
            $("#daily-setting").addClass("hidden");}
        if(thisPage == "task"){
            $("#task-navbar").removeClass("hidden");
        }
        window.scrollTo(0,0);
    });

    // Task Tool
    $("#find-current-task").on("click",function(){
        if($(".task-not-done").length > 0){
            var currentElement = $(".task-not-done > .schedule-box > .schedule-header").first().offset().top - 150
        } else {
            var currentElement = 0;
        }
        $("body,html").animate({
            scrollTop: currentElement
        }, 875,"easeInOutCubic")
    });

    $("#add-alert-dismiss-error").on("click",function(){
        $("#add-alert-error-box").fadeIn(0).toggle(300);
        $("#add-alert").delay(300).fadeOut(0);
    });

    $("#reset-task").on("click",function(){
        var mist = new Dexie("mist");
        mist.version(2).stores({
            task: "++id, day, staticStart"
        });

        mist.task.clear();
        location.reload();
    });

    $("#form-add").on("submit",function(e){            
        e.preventDefault();

        // Microtransaction
        $("#addData").addClass("clicked");
        var addDataClicked = setInterval(function(){
            $("#addData").removeClass("clicked");
        }, 200);
        $(this).addClass("clicked");
        var addDataTransaction = setInterval(function(){
            $("#addData").removeClass("clicked");
            clearInterval(addDataTransaction);
        }, 200);
        //DEBUG: console.log( "Subject: " + (subject.replace(/\s/g, '') ) );
        //DEBUG: console.log( ( ( parseInt( $("#start-time-selector-hour").val() + "" + $("#start-time-selector-minute").val() ) ) + " > " + ( parseInt($("#end-time-selector-hour").val() + "" + $("#end-time-selector-minute").val() ) ) ) );

        // Input
        var subject = $("#subject-input").val();

        var day = parseInt($("#start-day-selector").val());
        var startHour = parseInt($("#start-time-selector-hour").val());
        var startMin = parseInt($("#start-time-selector-minute").val());
        var endHour = parseInt($("#end-time-selector-hour").val());
        var endMin = parseInt($("#end-time-selector-minute").val());

        if(startHour <= 9){ var displayStartHour = "0" + startHour;   } else { var displayStartHour = startHour;   }
        if(startMin <= 9) { var displayStartMin = "0"  + startMin; } else { var displayStartMin  = startMin; }
        if(endHour <= 9)  { var displayEndHour = "0"   + endHour;     } else { var displayEndHour   = endHour;     }
        if(endMin <= 9)   { var displayEndMin = "0"    + endMin;   } else { var displayEndMin    = endMin;   }

        startTime = parseInt(String(displayStartHour) + String(displayStartMin));
        endTime = parseInt(String(displayEndHour) + String(displayEndMin));

        var date = new Date();
        var today = date.getDay();

        // Check validation
        //Debug: console.log(startTime + " <= " + endTime);
        if( ( subject.replace(/\s/g, '') ) == "" || (startTime > endTime)){
            $("#add-alert").fadeIn(0);
            $("#add-alert-error-box").fadeOut(0).toggle(300);
            errorAlertClosable();
            return; }

        var mist = new Dexie("mist");
        mist.version(2).stores({
            task: "++id, day, staticStart"
        });

        mist.task.put({day: day, subject:subject, time:{startHour:startHour,startMinute:startMin, endHour:endHour, endMinute:endMin}, staticStart: startTime})
        .then(() => {
            return mist.task.where("day").equals(today).sortBy("staticStart");
        }).then(() => {
            getTask(today);
        }).then(function(){
            $("#add-alert").fadeIn(0);
            $("#add-alert-success-box").fadeOut(0).toggle(300);
            successAlertClosable();
            getTask($(".day-tag.active").attr("day"));
        });
    });

    $(".day-tag").on("click",function(){
        // Microtransaction
        $(".day-tag.active").removeClass("active");
        $(this).addClass("active");

        // Input
        let selectedDay = $(this).attr("day");
        getTask(selectedDay);
        if(selectedDay == 0){
            var todayText = "Sunday";
            var todayShortText = "Sun";
        } else if(selectedDay == 1){
            var todayText = "Monday";
            var todayShortText = "Mon";
        } else if(selectedDay == 2){
            var todayText = "Tuesday";
            var todayShortText = "Tue";
        } else if(selectedDay == 3){
            var todayText = "Wednesday";
            var todayShortText = "Wed";
        } else if(selectedDay == 4){
            var todayText = "Thursday";
            var todayShortText = "Thu";
        } else if(selectedDay == 5){
            var todayText = "Friday";
            var todayShortText = "Fri";
        } else if(selectedDay == 6){
            var todayText = "Saturday";
            var todayShortText = "Sat";
        }
        $("#daily-content").html(todayText);
    });
    
    // Input Tool
    $("#input-exchange").on("click",function(){
        let startHour = $("#start-time-selector-hour").val();
        let startMin = $("#start-time-selector-minute").val();
        let endHour = $("#end-time-selector-hour").val();
        let endMin = $("#end-time-selector-minute").val();

        $("#start-time-selector-hour").val(endHour);
        $("#start-time-selector-minute").val(endMin);
        $("#end-time-selector-hour").val(startHour);
        $("#end-time-selector-minute").val(startMin);

    });

    // Setting
    $("#refresh").on("click",function(){
        location.reload();
    });

    $("#addData").on("click",function(){
        $("#form-add").submit();
    });
});

const reset = () => {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
        localStorage.clear();
        caches.keys().then(function(names) {
            for (let name of names)
            caches.delete(name);
        });
        for(let registration of registrations) {
            registration.unregister()
        } 
    }).then(function(){
        location.reload();
    });
}

/* Display data */
const listTask = (id,index,subject,timeStartHour,timeStartMin,timeEndHour,timeEndMin) => {
    var className = "main-task";
    var hourLeft = parseInt(timeEndHour) - parseInt(timeStartHour);
    if( (parseInt(timeEndMin) - parseInt(timeStartMin) ) < 0 ){
        hourLeft--;
        var minLeft = parseInt(timeEndMin) + 60 - parseInt(timeStartMin);
    } else { var minLeft = parseInt(timeEndMin) - parseInt(timeStartMin); }
    if(hourLeft == 0){
        var timeLeftElement = minLeft + " minute";
    } else if(hourLeft == 1) {
        var timeLeftElement = hourLeft + " hour " + minLeft + " minute";
    } else {
        var timeLeftElement = hourLeft + " hours " + minLeft + " minute";
    }

    let date = new Date();
    var newClassName = ( parseInt(date.getHours() + "" + date.getMinutes() ) > parseInt(timeStartHour + "" + timeStartMin ) ) ? className + " task-done" : className + " task-not-done";
    let listTaskElement1 = "<div class='"+className+index+" "+newClassName+" schedule-item' scheduleId='"+id+"' time='"+timeStartHour+timeStartMin+"' startHour='"+timeStartHour+"' startMin='"+timeStartMin+"' endHour='"+timeEndHour+"' endMin='"+timeEndMin+"' style='display:none'>";
    let listTaskElement2 = "<div class='schedule-box task-box'><div class='schedule-header'>"+subject+"</div>";
    let listTaskElement3 = "<div class='time-range-tag'>";
    let listTaskElement4 = timeStartHour + ":" + timeStartMin + " ~ " + timeEndHour + ":" + timeEndMin;
    let listTaskElement5 = "</div><div class='time-range-tag'>";
    let listTaskElement6 = timeLeftElement;
    let listTaskElement7 = "</div></div>";
    let listTaskElement8 = "<div class='schedule-box'><div class='task-setting task-setting-"+id+"'>";
    let listTaskElement9 = "";
    let listTaskElement10 = "<div class='task-setting-icon setting-space' taskId='"+id+"'></div>";
    let listTaskElement11 = "<div class='task-setting-icon task-delete' taskId='"+id+"'><i class='fas fa-times'></i><div class='task-setting-content'>Delete</div></div>";
    let listTaskElement12 = "</div></div></div>";
    let listTask = listTaskElement1 + listTaskElement2 + listTaskElement3 + listTaskElement4 + listTaskElement5 + listTaskElement6 + listTaskElement7 + listTaskElement8 + listTaskElement9 + listTaskElement10 + listTaskElement11 + listTaskElement12;
    return listTask;
}

/* Function */
const svgDecode = () => {
    $(".svg-decode").each(function(){
        var $img = jQuery(this);
        var imgID = $img.attr('id');
        var imgClass = $img.attr('class');
        var imgURL = $img.attr('src');

        jQuery.get(imgURL, function(data) {
            var $svg = jQuery(data).find('svg');

            if(typeof imgID !== 'undefined') {
                $svg = $svg.attr('id', imgID);
            }
            if(typeof imgClass !== 'undefined') {
                $svg = $svg.attr('class', imgClass+' replaced-svg');
            }
            $svg = $svg.removeAttr('xmlns:a');
            $img.replaceWith($svg);
        }, 'xml');
    });
}

const getTask = (day) => {
    // Update Input
    var date = new Date()
    var today = date.getDay();
    var hour = date.getHours();
    var minute = date.getMinutes();

    if(today == 0){
        var todayText = "Sunday";
        var todayShortText = "Sun";
    } else if(today == 1){
        var todayText = "Monday";
        var todayShortText = "Mon";
    } else if(today == 2){
        var todayText = "Tuesday";
        var todayShortText = "Tue";
    } else if(today == 3){
        var todayText = "Wednesday";
        var todayShortText = "Wed";
    } else if(today == 4){
        var todayText = "Thursday";
        var todayShortText = "Thu";
    } else if(today == 5){
        var todayText = "Friday";
        var todayShortText = "Fri";
    } else if(today == 6){
        var todayText = "Saturday";
        var todayShortText = "Sat";
    }

    // Get Task
    var mist = new Dexie("mist");
    var day = parseInt(day);

    mist.version(2).stores({
        task: "++id, day, staticStart"
    })
    
    mist.task.where("day").equals(day).sortBy("staticStart").then(task => {
        console.log(task);
        $("#daily-today").empty();
        task.map((data,index) => {
            if(data.time.startHour <= 9){ var displayStartHour = "0" + data.time.startHour;   } else { var displayStartHour = data.time.startHour;   }
            if(data.time.startMinute <= 9) { var displayStartMin = "0"  + data.time.startMinute; } else { var displayStartMin  = data.time.startMinute; }
            if(data.time.endHour <= 9)  { var displayEndHour = "0"   + data.time.endHour;     } else { var displayEndHour   = data.time.endHour;     }
            if(data.time.endMinute <= 9)   { var displayEndMin = "0"    + data.time.endMinute;   } else { var displayEndMin    = data.time.endMinute;   }

            $("#daily-today").append(listTask(data.id,index,data.subject,displayStartHour,displayStartMin,displayEndHour,displayEndMin));
        });
    }).then(() => {
        completeSort();
    })
}

const successAlertClosable = () => {
    $("#add-alert-success-box,#add-alert").on("click",function(){
        $("#add-alert-success-box").fadeIn(0).toggle(300);
        $("#add-alert").delay(300).fadeOut(0);
        $("#add-alert").unbind();
        clearInterval(closeSuccessAlert);
    });
    var closeSuccessAlert = setInterval(function(){
        $("#add-alert-success-box").fadeIn(0).toggle(300);
        $("#add-alert").delay(300).fadeOut(0);
        $("#add-alert").unbind();
        clearInterval(closeSuccessAlert);
    },3000);
}

const errorAlertClosable = () => {
    $("#add-alert-error-box,#add-alert").on("click",function(){
        $("#add-alert-error-box").fadeIn(0).toggle(300);
        $("#add-alert").delay(300).fadeOut(0);
        $("#add-alert").unbind();
        clearInterval(closeErrorAlert);
    });
    var closeErrorAlert = setInterval(function(){
        $("#add-alert-error-box").fadeIn(0).toggle(300);
        $("#add-alert").delay(300).fadeOut(0);
        $("#add-alert").unbind();
        clearInterval(closeErrorAlert);
    },3000);
}

const completeSort = () => {
    taskUpdated();

    // Microtransaction
    $(".main-task").each(function(index){
        $(this).stop().fadeOut(0).delay(37.5 * index).toggle("drop",350);
    });    

    // Bind Delete Task
    $(".task-delete").on("click",function(){
        var removeId = parseInt( $(this).attr("taskid") );
        var mist = new Dexie("mist");
        mist.version(2).stores({
            task: "++id, day, staticStart"
        });

        mist.task.where("id").equals(removeId).delete().then(() => {
            $(".main-task[scheduleid='"+removeId+"']").fadeIn(0).toggle("drop",375);
            prevDelete = setInterval(function(){
                $(".main-task[scheduleid='"+removeId+"']").remove();
                taskUpdated();
                clearInterval(prevDelete);
            },400)
        });
    });

    // Append Add Button
    var newTaskElement = "<div id='landing-new-task-container'><div id='landing-new-task'><i class='fas fa-plus'></i></center></div></div>";
    $("#daily-today").append(newTaskElement);
    $("#landing-new-task-container, #landing-add").on("click",function(){
        $("#list-nav").click();
    });    

    appendNoTask();
}

const taskUpdated = () => {
    // Toggle 'No Task for today'
    if($(".main-task").length == 0){
        $("#create-time-container").fadeIn(0);
    } else {
        $("#create-time-container").fadeOut(0);
    }
    
    // Set Current task
    var currentTask = $(".task-not-done > .schedule-box > .schedule-header").first().html();
    $("#current-task").html(currentTask);
    $("#current-task").css({"color":"#007bff"}).html( $(".main-task:first-child > .schedule-header").html() );
    $("#current-task").html( $(".main-task:first-child > .schedule-header").html() );

    // Get Progression
    $("#task-count").html("Task "+$(".task-done").length+" / "+$(".main-task").length);
    $("#landing-progression").attr("length", ( $(".task-done").length / $(".main-task").length * 100 ) ).css({"width": $("#landing-progression").attr("length") + "%"});
    if($("#landing-progression").attr("length") == "NaN"){
        $("#landing-progression").css({"width":"100%"});
    }    
}

const appendNoTask = () => {
    if($(".main-task").length == 0){
        $("#create-time-container").fadeIn(0);
    } else {
        $("#create-time-container").fadeOut(0);
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