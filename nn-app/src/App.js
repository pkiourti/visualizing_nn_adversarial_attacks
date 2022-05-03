import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import { NavBar, UserRegister, UserLogin } from './components';
/*import { Alert } from 'react-alert';*/

export default class NNApp extends Component {
    constructor(props) {
        super(props)

        this.onFileBrowseChange = this.onFileBrowseChange.bind(this)
        this.onFileNameChange = this.onFileNameChange.bind(this)
        this.upload = this.upload.bind(this)

        this.onNameChange = this.onNameChange.bind(this)
        this.onEmailChange = this.onEmailChange.bind(this)

        this.onRegister = this.onRegister.bind(this)
        this.onLogin = this.onLogin.bind(this)

        this.onSuccess = this.onSuccess.bind(this)
        this.onFailure = this.onFailure.bind(this)

        this.state = {
            base_url: 'https://b34e-2601-19b-a00-1760-e2d4-ead6-4f24-7131.ngrok.io',
            show_login_page: true,
            show_register_page: false,
            show_upload_page: false,
            show_test_page: false,
            show_options_page: false,
            file: '',
            email: '',
            name: '',
            filename: ''
        }
    }

    onFileBrowseChange(e) {
        console.log('hello', e.target.files[0])
        this.setState({ file: e.target.files[0]})
    }

    onFileNameChange(name) {
        console.log(name)
        this.setState({ filename: name })
    }

    onNameChange(e) {
        console.log(e.target.value)
        this.setState({ name: e.target.value })
    }

    onEmailChange(e) {
        console.log(e)
        this.setState({ email: e.target.value})
    }

    onRegister() {
        console.log('registering user')
        fetch(this.state.base_url + '/users', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json, text/plain, */*",
            },
            body: JSON.stringify({
                name: this.state.name,
                email: this.state.email,
            })
        }).then(response => response.json().then(data => {
            console.log(data)
            this.setState({show_options_page: true, show_register_page:false})
        }).catch(error => { console.log('Error parsing data', error)})
        ).catch(error => {
            console.log(error); /*TODO: use alert or something here*/
        })
    }

    onLogin() {
        this.setState({show_test_page: true, show_login_page:false})
    }

    onSuccess(response) {
        console.log(response.profileObj)
        this.setState({
                name: response.profileObj.name,
                email: response.profileObj.email,
                show_upload_page: true,
                show_login_page: false,
        })
    }

    onFailure(res) {
        console.log('Failed')
        console.log(res)
    }

    fetchUserModels() {
        fetch(this.state.base_url + '/', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json, text/plain, */*",
            },
            body: JSON.stringify({
                name: this.state.name,
                email: this.state.email,
            })
        }).then(response => { console.log(response)
            /*response.json().then(data => {*/
        }/*).catch(error => { console.log('Error parsing data', error)})*/
        ).catch(error => {
            console.log(error); /*TODO: use alert or something here*/
        })
    }

    upload() {
        const formData = new FormData();
        formData.append('model_file', this.state.file);
        formData.append('name', this.state.name);
        fetch(this.state.base_url + '/models',
			{
				method: 'POST',
				body: formData,
			}
		)
			.then((response) => 
                response.json().then(data => {
                    console.log(this.state)
                    console.log(data)
                    this.setState({ show_upload_page: false, show_test_page: true }, () => {
                        console.log(this.state)
                    })
                }).catch(error => {
                    /*Alert.alert('File was not uploaded successfully')*/
				    console.error('Error:', error);
                })
			).catch((error) => {
                /*Alert.alert('File was not uploaded successfully')*/
				console.error('Error:', error);
			});
        /*this.setState({show_upload_page: false, show_test_page: true})*/
    }

    render() {
        let page;
        if (this.state.show_register_page) {
            page = <div className="container" 
                    style={{flex:1, alignItems: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', textAlign:'center'}}>
                    <h3>Visualing Adversarial Attacks</h3>
                        <UserRegister 
                            onEmailChange={this.onEmailChange}
                            onNameChange={this.onNameChange}
                            onRegister={this.onRegister}
                            goToLogin={() => this.setState({show_login_page:true, show_register_page:false})}
                        />
                  </div> 
        } else if (this.state.show_login_page) {
            page = <div className="container" 
                    style={{flex:1, alignItems: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', textAlign:'center'}}>
                    <h3>Visualing Adversarial Attacks</h3>
                        <UserLogin 
                            onEmailChange={this.onEmailChange}
                            onLogin={this.onLogin}
                            goToRegister={() => this.setState({show_login_page:false, show_register_page:true})}
                        />
                  </div> 
        } else if (this.state.show_options_page) {
            page = <div>
                    <NavBar
                    show_upload={this.state.show_upload_page}
                    show_test={this.state.show_test_page}
                    goToUpload={() => this.setState({show_upload_page: true, show_test_page: false})}
                    goToTest={() => this.setState({show_test_page: true, show_upload_page:false})}
                    />
                    <div className="card" style={{'display': this.state.show_upload_page ? 'block' : 'none'}}>
                      <div className="card-body">
                       <div className="container"
                           style={{flex:1, alignItems: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', textAlign:'center'}}>
                           <h3>Visualing Adversarial Attacks</h3>
                           <div className="row" style={{padding: "10% 0"}}>
                               <div className="col-md-12">
                                   <form>
                                     <div className="form-group" style={{margin: 10}}>
                                       <label className="form-label" htmlFor="customFile">Upload your file (.pt/.h5)</label>
                                       <input type="file" name="file" className="form-control" id="model-file" onChange={this.onFileBrowseChange}/>
                                       <small id="emailHelp" className="form-text text-muted">Only Tensorflow 1.13 or PyTorch 1.9 models are accepted</small>
                                     </div>
                                     <div className="form-group">
                                       <label className="form-label" htmlFor="name">Give a name to your file</label>
                                       <input type="text" name="name" className="form-control" id="name" onChange={this.onNameChange}/>
                                     </div>
                                   <Button type="button" className="btn btn-primary" style={{margin: 20}} onClick={this.upload}>Upload</Button>
                                   </form>
                               </div>
                           </div>
                       </div>
                      </div>
                    </div>
                    <div className="card" style={{'display': this.state.show_test_page ? 'block' : 'none'}}>
                      <div className="card-body">
                        <div className="container" 
                            style={{flex:1, alignItems: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', textAlign:'center'}}>
                            <h3>Visualing Adversarial Attacks</h3>
                            <div className="row" style={{padding: "10% 0"}}>
                            <div className="input-group mb-3">
                              <div className="input-group-prepend">
                                <label className="input-group-text" for="inputGroupSelect01">Options</label>
                              </div>
                              <select className="custom-select" id="inputGroupSelect01">
                                <option selected>Choose...</option>
                                <option value="1">One</option>
                                <option value="2">Two</option>
                                <option value="3">Three</option>
                              </select>
                            </div>
                            </div>
                        </div>
                      </div>
                    </div>
                  </div>
        } 
        return page;
    }
}
