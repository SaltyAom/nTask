import React from "react"
import * as $ from "jquery"

export class Tabs extends React.Component {
    constructor(props){
        super(props);
    
        this.state = {
            page: this.props.page
        }

        if(this.props.page === "task"){
            this.state = {
                task: "active",
                list: "not-active",
                user: "not-active",
                setting: "not-active"                
            }
        } else if(this.props.page === "list"){
            this.state = {
                task: "not-active",
                list: "active",
                user: "not-active",
                setting: "not-active"                
            }
        } else if(this.props.page === "user"){
            this.state = {
                task: "not-active",
                list: "not-active",
                user: "active",
                setting: "not-active"                
            }
        } else if(this.props.page === "setting"){
            this.state = {
                task: "not-active",
                list: "not-active",
                user: "not-active",
                setting: "active"                
            }
        }
    }

    componentWillReceiveProps(newPage){
        if(newPage.page === "task"){
            this.setState({
                task: "active",
                list: "not-active",
                user: "not-active",
                setting: "not-active"                
            })
        } else if(newPage.page === "list"){
            this.setState({
                task: "not-active",
                list: "active",
                user: "not-active",
                setting: "not-active"                
            })
        } else if(newPage.page === "user"){
            this.setState({
                task: "not-active",
                list: "not-active",
                user: "active",
                setting: "not-active"                
            })
        } else if(newPage.page === "setting"){
            this.setState({
                task: "not-active",
                list: "not-active",
                user: "not-active",
                setting: "active"                
            })
        }
    }

    componentDidMount(){
        $(".svg-decode").each(function(){
            var $img = $(this);
            var imgID = $img.attr('id');
            var imgClass = $img.attr('class');
            var imgURL = $img.attr('src');
            var page = $img.attr("page");
        
            $.get(imgURL, data => {
                var $svg = $(data).find('svg');
        
                if(typeof imgID !== 'undefined') {
                    $svg = $svg.attr('id', imgID);
                }
                if(typeof page !== 'undefined') {
                    $svg = $svg.attr('page', page);
                }
                if(typeof imgClass !== 'undefined') {
                    $svg = $svg.attr('class', imgClass+' replaced-svg');
                }
                $svg = $svg.removeAttr('xmlns:a');
                $img.replaceWith($svg);
            }, 'xml');
        });
    }

    render(){
        return(
            <div id="tabs-bar">
                <div id="task-nav"    className={`tabs-nav ${this.state.task}`}    onClick={this.props.handlePage} page="task">
                    <div className="tabs-icon" page="task">
                        <img className="svg-decode" src="img/icon/layer.svg" alt="layer icon" page="task" />
                    </div>
                </div>
                <div id="list-nav"    className={`tabs-nav ${this.state.list}`}    onClick={this.props.handlePage} page="list">
                    <div className="tabs-icon" page="list">
                        <img className="svg-decode" src="img/icon/add.svg" alt="add icon" page="list" />
                    </div>
                </div>
                <div id="user-nav"    className={`tabs-nav ${this.state.user}`}    onClick={this.props.handlePage} page="user">
                    <div className="tabs-icon" page="user">
                        <img className="svg-decode" src="img/icon/user.svg" alt="user icon" page="user" />
                    </div>
                </div>
                <div id="setting-nav" className={`tabs-nav ${this.state.setting}`} onClick={this.props.handlePage} page="setting">
                    <div className="tabs-icon" page="setting">
                        <img className="svg-decode" src="img/icon/bar.svg" alt="bars icon" page="setting" />
                    </div>
                </div>
            </div>
        )
    }
}
