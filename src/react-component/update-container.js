import React from "react"

export class Update extends React.Component {
    render(){
        if(this.props.updating === "true"){
            return(
                <div id="update-container">
                    <div id="update-wrapper">
                        <center>
                            <svg viewBox="0 0 32 32" width="32" height="32">
                                <circle id="spinner" cx="16" cy="16" r="14" fill="none"></circle>
                            </svg>
                        </center>
                    </div>
                </div>
            )
        } else {
            return(null)
        }
    }
}