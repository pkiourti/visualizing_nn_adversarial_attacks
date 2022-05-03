import React from 'react';
import { Button } from 'react-bootstrap';

const UserRegister = (props) => {
    return (
        <div className="row" style={{padding: "10% 0"}}>
            <div className="col-md-12">
                <form>
                  <div className="form-group" style={{margin: 10}}>
                    <label className="form-label" htmlFor="customFile">Register your email</label>
                    <input type="email" name="email" className="form-control" id="model-file" onChange={(email) => props.onEmailChange(email)}/>
                    <small id="emailHelp" className="form-text text-muted">Your email will be used to associate your profile with your models</small>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="name">Your name</label>
                    <input type="text" name="name" className="form-control" id="name" onChange={(name) => props.onNameChange(name)}/>
                  </div>
                <Button type="button" className="btn btn-primary" style={{margin: 20}} onClick={props.onRegister}>Register</Button>
                </form>
                <p> or </p>
                <div style={{margin: 20, background: "none!important",  border: "none", padding: "0!important", color: "#069", textDecoration: "underline", cursor: "pointer"}} onClick={props.goToLogin}>Back</div>
            </div>
        </div>
    )
}

export default UserRegister;
