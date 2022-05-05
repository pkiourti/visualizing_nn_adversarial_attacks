import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import { Table, NavBar, UserRegister, UserLogin } from './components';
/*import { Alert } from 'react-alert';*/

export default class NNApp extends Component {
    constructor(props) {
        super(props)

        this.onFileBrowseChange = this.onFileBrowseChange.bind(this)
        this.onFileNameChange = this.onFileNameChange.bind(this)
        this.onBenchmarkChange = this.onBenchmarkChange.bind(this)
        this.upload = this.upload.bind(this)

        this.onNameChange = this.onNameChange.bind(this)
        this.onEmailChange = this.onEmailChange.bind(this)

        this.onRegister = this.onRegister.bind(this)
        this.onLogin = this.onLogin.bind(this)

        this.fetch_user = this.fetch_user.bind(this)
        this.fetch_user_models = this.fetch_user_models.bind(this)

        this.onSelectRow = this.onSelectRow.bind(this)

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
            filename: '',
            img: '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'
        }
    }

    onFileBrowseChange(e) {
        console.log('hello', e.target.files[0])
        this.setState({ file: e.target.files[0]})
    }

    onFileNameChange(e) {
        this.setState({ filename: e.target.value })
    }

    onBenchmarkChange(e) {
        console.log('benchmark', e.target.value)
        this.setState({benchmark: e.target.value})
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
              { key: 'benchmark', name: 'Model Trained on' },
              { key: 'created_at', name: 'Created At' },
            ];
            columns = [
              { field: 'id', title: 'ID' },
              { field: 'name', title: 'Model Name' },
              { field: 'model_type_id', title: 'Model Type' },
              { field: 'benchmark', title: 'Model Trained on' },
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

    upload() {
        const formData = new FormData();
        formData.append('model_file', this.state.file);
        formData.append('filename', this.state.filename);
        formData.append('user_id', this.state.user_id);
        formData.append('benchmark', this.state.benchmark);
        fetch(this.state.base_url + '/models',
			{
				method: 'POST',
				body: formData,
			}
		)
			.then((response) => 
                response.json().then(data => {
                    this.fetch_user_models(this.state.user_id)
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
    }

    onSelectRow(e, rowData) {
        fetch(this.state.base_url + '/images?benchmark=' + rowData['benchmark'],
            {
                method: 'GET',
            }).then(response => response.formData().then(data => { 
                let arr = []
                let images = data.values()
                let result = images.next()
                while (!result.done) {
                    console.log(result.value)
                    arr.push(result.value)
                    result = images.next()
                }

                let promises = [];
                arr.forEach((arrbuf) => {
                    promises.push(arrbuf.arrayBuffer())
                })
                
                let new_arr = []
                Promise.all(promises)
                .then((result) => {
                    console.log('all resolved ', result)
                    new_arr = result.map(el => String.fromCharCode.apply(null, new Uint8Array(el)))
                    this.setState({im: new_arr, show_image_page: true})
                })
            }).catch(error => console.log(error))
            ).catch(error => console.log(error))
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
                    <img src={`data:image/png;base64,${this.state.img}`} />
                  </div> 
        } else if (this.state.show_options_page) {
            let imgs = []
            if (this.state.show_image_page) {
                for (let i = 0; i < this.state.im.length; i++) {
                    // note: we are adding a key prop here to allow react to uniquely identify each
                    // element in this array. see: https://reactjs.org/docs/lists-and-keys.html
                    imgs.push(<img src={`data:image/png;base64,${this.state.im[i]}`}/>);
                }
            }
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
                                     <div className="form-group" style={{margin: 10}}>
                                       <label className="form-label" htmlFor="name">Give a name to your file</label>
                                       <input type="text" name="name" className="form-control" id="name" onChange={this.onFileNameChange}/>
                                     </div>
                                     <div className="form-group" style={{margin: 10}}>
                                       <label className="form-label" htmlFor="name">Model is trained on benchmark</label>
                                        <select className="form-select" aria-label="Select benchmark" onChange={this.onBenchmarkChange}>
                                            <option selected>Select the benchmark dataset</option>
                                            <option value="1">German Traffic Sign Recognition</option>
                                            <option value="2">CIFAR10</option>
                                            <option value="3">MNIST</option>
                                        </select>
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
                                onSelectRow={this.onSelectRow}
                            />
                        </div>
                      </div>
                    </div>
                    <div className="card" style={{'display': this.state.show_image_page ? 'block' : 'none'}}>
                      <div className="card-body">
                        <div className="container" 
                            style={{textAlign:'center'}}>
                            <h3>Visualing Adversarial Attacks</h3>
                            {imgs}
                        </div>
                      </div>
                    </div>
                  </div>
        } 
        return page;
    }
}
