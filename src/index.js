import React from 'react';
import ReactDOM from 'react-dom';

import * as $ from "jquery"

import './css/nTask.css';
import './fontawesome/css/all.min.css'

import {Tabs} from "./react-component/tabs-bar"
import {Update} from "./react-component/update-container"
import {Page, Title} from "./react-component/page"

class App extends React.Component {
    constructor(props){
        super(props);
        
        this.state = {
            version: "1.2.0 Beta",
            page: "task",
            visibleTitle: "false",
            updating: "false",
        }

        this.handlePage = this.handlePage.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
    }

    async handlePage(event){
        let newPage = event.target.getAttribute("page");
        console.log(`Switch to: ${newPage}`);

        if(this.state.page !== newPage){
            this.setState({
                page: newPage
            })
            if(newPage === "list"){
                this.setState({
                    visibleTitle: "true"
                });
            } else {
                this.setState({
                    visibleTitle: "false"
                });
            }
        }
    }

    handleUpdate(){
        if(navigator.onLine === true){
            $.when().then(() => {
                console.log("Updating...")
                this.setState({
                    updating: "true"
                })
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    localStorage.clear();
                    caches.keys().then(function(names) {
                        for (let name of names)
                        caches.delete(name);
                    });
                    for(let registration of registrations) {
                        registration.unregister()
                    } 
                }).then(() => {
                    if ('serviceWorker' in navigator) {
                        navigator.serviceWorker.register('serviceWorker.js')
                        .then(function(registration) {
                            console.info('Registered:', registration);
                        }).catch(function(error) {
                            console.error('Registration failed: ', error);
                        });
                    }
                }).then(() => {
                    console.info("Updated!");
                    setInterval(() => {
                        window.location.reload();
                    }, 1000)
                })
            })
        } else {
            console.log("Offline");
        }
    }

    addSwitch(){
        this.setState({
            page: "list",
            visibleTitle: "true",
        })
    }

    requestUpdate(){
        this.setState({
            updating:"true"
        })
    }

    render(){
        return(
            <div id="app">
                <Tabs 
                    page={this.state.page} 
                    data={this.state.task} 
                    handlePage={this.handlePage.bind(this)} 
                />
                <Update 
                    updating={this.state.updating} 
                />
                <Title 
                    visible={this.state.visibleTitle} 
                />
                <Page
                    page={this.state.page} 
                    handleUpdate={this.handleUpdate}
                    version={this.state.version} 
                    addSwitch={this.addSwitch.bind(this)}
                    requestUpdate={this.requestUpdate.bind(this)}
                />
            </div>
        )
    }
}

ReactDOM.render(<App />, document.getElementById("root"));