import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import { Table, NavBar, UserRegister, UserLogin } from './components';
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

        this.fetch_user = this.fetch_user.bind(this)
        this.fetch_user_models = this.fetch_user_models.bind(this)

        this.rowKeyGetter = this.rowKeyGetter.bind(this)

        this.onSuccess = this.onSuccess.bind(this)
        this.onFailure = this.onFailure.bind(this)

        this.state = {
            base_url: 'https://c301-2601-19b-a00-1760-bb7a-e2df-4834-63e0.ngrok.io',
            show_login_page: true,
            show_register_page: false,
            show_upload_page: false,
            show_test_page: false,
            show_options_page: false,
            user_id: '',
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
        this.setState({ filename: name })
    }

    onNameChange(e) {
        this.setState({ name: e.target.value })
    }

    onEmailChange(e) {
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
            this.setState({user_id: data['user_id'], show_options_page: true, show_register_page:false})
        }).catch(error => { console.log('Error parsing data', error)})
        ).catch(error => {
            console.log(error); /*TODO: use alert or something here*/
        })
    }

    fetch_user() {
        fetch(this.state.base_url + '/users?email=' + this.state.email, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json, text/plain, */*",
            }
        }).then(response => response.json().then(data => {
            this.fetch_user_models(data['user_id'])
        }).catch(error => {console.log('Error', error)})
        ).catch(error => {console.log('Error', error)})
    }

    fetch_user_models(user_id) {
        fetch(this.state.base_url + '/models?user_id='+user_id, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json, text/plain, */*",
            },
        }).then(response => response.json().then(data => {
            console.log(data)
            console.log(data['models'])
            console.log(typeof(data['models']))
            let columns = [
              { key: 'id', name: 'ID' },
              { key: 'name', name: 'Model Name' },
              { key: 'model_type_id', name: 'Model Type' },
              { key: 'created_at', name: 'Created At' },
            ];
            columns = [
              { field: 'id', title: 'ID' },
              { field: 'name', title: 'Model Name' },
              { field: 'model_type_id', title: 'Model Type' },
              { field: 'created_at', title: 'Created At' },
            ];
            this.setState({
                user_id: user_id, 
                show_options_page:true, 
                show_login_page:false,
                rows: data['models'],
                columns: columns})
        }).catch(error => console.log(error))
        ).catch(error => console.log(error))
    }

    onLogin() {
        console.log('logging in the user')
        this.fetch_user()
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
        formData.append('user_id', this.state.user_id);
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

    rowKeyGetter(row) {
        return row.id
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
                            style={{textAlign:'center'}}>
                            <h3>Visualing Adversarial Attacks</h3>
                            <Table 
                                rows={this.state.rows}
                                columns={this.state.columns}
                                rowKeyGetter={this.rowKeyGetter}
                            />
                        </div>
                      </div>
                    </div>
                  </div>
        } 
        return page;
    }
}
