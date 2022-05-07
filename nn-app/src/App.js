import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import { Table, NavBar, UserRegister, UserLogin, UploadPage } from './components';
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
        this.fetch_benchmarks = this.fetch_benchmarks.bind(this)
        this.fetch_class_names = this.fetch_class_names.bind(this)

        this.onModelSelect = this.onModelSelect.bind(this)

        this.state = {
            base_url: 'https://3250-2601-19b-a00-1760-2c01-965a-2413-f280.ngrok.io',
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
            this.setState({user_id: data['user_id'], show_options_page: true, show_test_page: true, show_register_page:false})
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
            const columns = [
              { field: 'id', title: 'ID' },
              { field: 'name', title: 'Model Name' },
              { field: 'model_type_id', title: 'Model Type' },
              { field: 'benchmark', title: 'Model Trained on' },
              { field: 'created_at', title: 'Created At' },
            ];
            this.setState({
                user_id: user_id, 
                rows: data['models'],
                columns: columns})
            this.fetch_benchmarks()
        }).catch(error => console.log(error))
        ).catch(error => console.log(error))
    }

    fetch_benchmarks() {
        fetch(this.state.base_url + '/benchmarks', {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json, text/plain, */*",
            }
        }).then(response => response.json().then(data => {
            this.setState({ 
                benchmarks: data['benchmarks'],
                show_options_page:true, 
                show_test_page:true, 
                show_login_page:false,
            })
        }).catch(error => {console.log('Error', error)})
        ).catch(error => {console.log('Error', error)})
    }

    fetch_class_names() {
        fetch(this.state.base_url + '/class_names?benchmark=' + this.state.benchmark,  {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json, text/plain, */*",
            }
        }).then(response => response.json().then(data => {
            this.setState({ class_names: data['class_names']})
        }).catch(error => {console.log('Error', error)})
        ).catch(error => {console.log('Error', error)})
    }

    onLogin() {
        console.log('logging in the user')
        let errors = [];
        const expression = /\S+@\S+/;
        let validEmail = expression.test(String(this.state.email).toLowerCase());
        if (!validEmail) {
            errors.push("email");
        }
        this.setState({
            errors: errors
        });
        if (errors.length > 0) {
            return false;
        } else {
            this.fetch_user()
        }
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
                    alert("File was not uploaded successfully");
				    console.error('Error:', error);
                })
			).catch((error) => {
                alert("File was not uploaded successfully");
				console.error('Error:', error);
			});
    }

    onModelSelect(e, rowData) {
        fetch(this.state.base_url + '/images?benchmark=' + rowData['benchmark'],
            {
                method: 'GET',
            }).then(response => response.formData().then(data => { 
                let arr = []
                let classes = []
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
                    classes.push(arrbuf.name)
                })
                
                let class_images = []
                Promise.all(promises)
                .then((results) => {
                    console.log('all resolved ', results)
                    class_images = results.map(el => String.fromCharCode.apply(null, new Uint8Array(el)))
                    this.setState({
                        class_images: class_images, 
                        classes: classes,
                        show_image_page: true, 
                        show_test_page: false,
                        benchmark: rowData['benchmark']
                    })
                })
            }).catch(error => console.log(error))
            ).catch(error => console.log(error))
    }

    render() {
        let page;
        if (this.state.show_register_page) {
            page = <div className="container" 
                    style={{flex:1, alignItems: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', textAlign:'center'}}>
                    <h3>Visualizing Adversarial Attacks</h3>
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
                    <h3>Visualizing Adversarial Attacks</h3>
                        <UserLogin 
                            onEmailChange={this.onEmailChange}
                            onLogin={this.onLogin}
                            goToRegister={() => this.setState({show_login_page:false, show_register_page:true})}
                        />
                  </div> 
        } else if (this.state.show_options_page) {
            let benchmark = ''
            for (let i=0; i < this.state.benchmarks.length; i++) {
                console.log(this.state.benchmark, this.state.benchmarks[i]['id'])
                console.log(this.state.benchmark == this.state.benchmarks[i]['id'])
                if (this.state.benchmark == this.state.benchmarks[i]['id']) {
                    benchmark = this.state.benchmarks[i]['benchmark']
                }
            }
            let columns = [
              { field: 'class', title: 'Class' },
              { field: 'image', title: 'Image' },
            ];
            let imgs = []
            if (this.state.show_image_page) {
                for (let i = 0; i < this.state.class_images.length; i++) {
                    let img_elem_tag = <div style={{display: 'inline'}}>
                        <div>{this.state.classes[i]}</div>
                        <img src={`data:image/png;base64,${this.state.class_images[i]}`} width="80px" height="80px"/>
                    </div>
                    let img = <img src={`data:image/png;base64,${this.state.class_images[i]}`} width="80px" height="80px"/>
                    imgs.push({"class": this.state.classes[i], "image": img});
                }
            }
            console.log('show_image', this.state.show_image_page)
            page = <div>
                    <NavBar
                    show_upload={this.state.show_upload_page}
                    show_test={this.state.show_test_page}
                    goToUpload={() => this.setState({show_upload_page: true, show_test_page: false, show_image_page: false})}
                    goToTest={() => this.setState({show_test_page: true, show_upload_page:false, show_image_page: false})}
                    />
                    <UploadPage 
                        benchmarks={this.state.benchmarks}
                        display={this.state.show_upload_page}
                        onFileBrowseChange={this.onFileBrowseChange}
                        onFileNameChange={this.onFileNameChange}
                        onBenchmarkChange={this.onBenchmarkChange}
                        upload={this.upload}
                    />
                    <div className="card" style={{'display': this.state.show_test_page ? 'block' : 'none'}}>
                      <div className="card-body">
                        <div className="container" 
                            style={{textAlign:'center'}}>
                            <h3>Visualizing Adversarial Attacks</h3>
                            <Table 
                                title={'Your models'}
                                rows={this.state.rows}
                                columns={this.state.columns}
                                onSelectRow={this.onModelSelect}
                            />
                        </div>
                      </div>
                    </div>
                    <div className="card" style={{'display': this.state.show_image_page ? 'block' : 'none'}}>
                      <div className="card-body">
                        <div className="container" 
                            style={{textAlign:'center'}}>
                            <h3>Visualizing Adversarial Attacks</h3>
                            <Table 
                                title={benchmark + ' images. Select a class to attack'}
                                rows={imgs}
                                columns={columns}
                                onSelectRow={this.onModelSelect}
                            />
                        </div>
                      </div>
                    </div>
                  </div>
        } 
        return page;
    }
}
