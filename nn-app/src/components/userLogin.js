/* button that looks like a link: https://stackoverflow.com/questions/1367409/how-to-make-button-look-like-a-link */
import React from 'react';
import { Button } from 'react-bootstrap';

const UserLogin = (props) => {
    return (
        <div className="row" style={{padding: "10% 0"}}>
            <div className="col-md-12">
                <form className="needs-validation">
                  <div className="form-group" style={{margin: 10}}>
                    <label className="form-label" htmlFor="customFile">Your registered email</label>
                    <input type="email" name="email" className="form-control" id="model-file" onChange={props.onEmailChange} required/>
                    <small id="emailHelp" className="form-text text-muted">Your email is used to associate your profile with your models</small>
                  </div>
                <Button type="button" className="btn btn-primary" style={{margin: 20}} onClick={props.onLogin}>See your page</Button>
                </form>
                <p> or </p>
                <div style={{margin: 20, background: "none!important",  border: "none", padding: "0!important", color: "#069", textDecoration: "underline", cursor: "pointer"}} onClick={props.goToRegister}>Register</div>
            </div>
        </div>
    )
}

export default UserLogin;
