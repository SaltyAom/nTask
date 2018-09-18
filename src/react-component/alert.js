import React from "react"

export class Alert extends React.Component {
    constructor(props){
        super(props);
    }

    render(){
        if(this.props.type === "success"){
            return (                
            <div id="add-alert">
                <div id="add-alert-wrapper">
                    <center>
                        <div id="add-alert-success-box" style="display:none">
                            <div id="add-alert-content-success">Add Success</div>
                        </div>
                    </center>
                </div>
            </div>
            )
        } else if(this.props.type === "error"){
            return(
            <div id="add-alert">
                <div id="add-alert-wrapper">
                    <center>
                        <div id="add-alert-success-box" style="display:none">
                            <div id="add-alert-content-success">Add Success</div>
                        </div>
                    </center>
                </div>
            </div>
            )
        }
    }
}