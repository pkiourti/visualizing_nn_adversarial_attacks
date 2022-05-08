import React, { Component } from 'react';
import { Table, NavBar, UserRegister, UserLogin, UploadPage, SelectAttack } from './components';
/*import { Alert } from 'react-alert';*/

export default class NNApp extends Component {
    constructor(props) {
        super(props)

        this.onFileBrowseChange = this.onFileBrowseChange.bind(this)
        this.onFileNameChange = this.onFileNameChange.bind(this)
        this.onBenchmarkChange = this.onBenchmarkChange.bind(this)
        this.onNameChange = this.onNameChange.bind(this)
        this.onEmailChange = this.onEmailChange.bind(this)
        this.onAttackChange = this.onAttackChange.bind(this)
        this.onRedChange = this.onRedChange.bind(this)
        this.onColorSettingChange = this.onColorSettingChange.bind(this)
        this.onGreenChange = this.onGreenChange.bind(this)
        this.onBlueChange = this.onBlueChange.bind(this)
        this.onPositionXChange = this.onPositionXChange.bind(this)
        this.onPositionYChange = this.onPositionYChange.bind(this)
        this.onHeightChange = this.onHeightChange.bind(this)
        this.onWidthChange = this.onWidthChange.bind(this)
        this.onMagnitudeChange = this.onMagnitudeChange.bind(this)
        this.onInstagramChange = this.onInstagramChange.bind(this)

        this.onRegister = this.onRegister.bind(this)
        this.onLogin = this.onLogin.bind(this)
        this.upload = this.upload.bind(this)
        this.getPoisonedImage = this.getPoisonedImage.bind(this)

        this.fetch_user = this.fetch_user.bind(this)
        this.fetch_user_models = this.fetch_user_models.bind(this)
        this.fetch_benchmarks = this.fetch_benchmarks.bind(this)
        this.fetch_adversarial_attack_types = this.fetch_adversarial_attack_types.bind(this)
        this.fetch_class_names = this.fetch_class_names.bind(this)
        this.fetch_image_categories = this.fetch_image_categories.bind(this)

        this.onModelSelect = this.onModelSelect.bind(this)
        this.onImageClassSelect = this.onImageClassSelect.bind(this)
        this.onImageSelect = this.onImageSelect.bind(this)

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
            attack_details: {}
        }
    }

    componentDidMount() {
        this.fetch_benchmarks()
        this.fetch_adversarial_attack_types()
    }

    onFileBrowseChange(e) {
        this.setState({ file: e.target.files[0]})
    }

    onFileNameChange(e) {
        this.setState({ filename: e.target.value })
    }

    onBenchmarkChange(e) {
        this.setState({benchmark: e.target.value})
    }

    onNameChange(e) {
        this.setState({ name: e.target.value })
    }

    onEmailChange(e) {
        this.setState({ email: e.target.value})
    }

    onAttackChange(e) {
        this.setState({attack: e.target.value})
    }

    onColorSettingChange(e) {
        this.setState({ attack_details: { ...this.state.attack_details, color_alg: e.target.value }})
    }

    onRedChange(e) {
        this.setState({ attack_details: { ...this.state.attack_details, red: e.target.value }})
    }

    onGreenChange(e) {
        this.setState({ attack_details: { ...this.state.attack_details, green: e.target.value }})
    }

    onBlueChange(e) {
        this.setState({ attack_details: { ...this.state.attack_details, blue: e.target.value }})
    }

    onPositionXChange(e) {
        this.setState({ attack_details: { ...this.state.attack_details, position_x: e.target.value }})
    }

    onPositionYChange(e) {
        this.setState({ attack_details: { ...this.state.attack_details, position_y: e.target.value }})
    }

    onHeightChange(e) {
        this.setState({ attack_details: { ...this.state.attack_details, height: e.target.value }})
    }

    onWidthChange(e) {
        this.setState({ attack_details: { ...this.state.attack_details, width: e.target.value }})
    }

    onMagnitudeChange(e) {
        this.setState({ attack_details: { ...this.state.attack_details, magnitude: e.target.value }})
    }

    onInstagramChange(e) {
        this.setState({ attack_details: { ...this.state.attack_details, instagram: e.target.value }})
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
            this.setState({
                "user_id": data['user_id']
            }, () => {
                this.fetch_user_models()
            })
        }).catch(error => {console.log('Error', error)})
        ).catch(error => {console.log('Error', error)})
    }

    fetch_user_models() {
        fetch(this.state.base_url + '/models?user_id='+this.state.user_id, {
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
              { field: 'name', title: 'Model Name' },
              { field: 'benchmark_name', title: 'Model Trained on' },
              { field: 'created_at', title: 'Created At' },
            ];
            let models = data['models'].map(model => {
                const benchmark = this.state.benchmarks.find(o => o.id === model.benchmark)
                model['benchmark_name'] = benchmark.benchmark
                return model
            });
            this.setState({
                models: models,
                model_columns: columns,
                show_upload_page: false, 
                show_test_page: true,
                show_options_page:true, 
                show_login_page:false,
            }, () => {
                console.log(this.state)
            })
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
            })
        }).catch(error => {console.log('Error', error)})
        ).catch(error => {console.log('Error', error)})
    }

    fetch_adversarial_attack_types() {
        fetch(this.state.base_url + '/attack_types', {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json, text/plain, */*",
            }
        }).then(response => response.json().then(data => {
            this.setState({ 
                attack_types: data['attack_types'],
            })
        }).catch(error => {console.log('Error', error)})
        ).catch(error => {console.log('Error', error)})
    }

    fetch_class_names(benchmark) {
        return fetch(this.state.base_url + '/class_names?benchmark=' + benchmark,  {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json, text/plain, */*",
            }
        })
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
                    this.fetch_user_models()
                }).catch(error => {
                    alert("File was not uploaded successfully");
				    console.error('Error:', error);
                })
			).catch((error) => {
                alert("File was not uploaded successfully");
				console.error('Error:', error);
			});
    }

    fetch_image_categories(rowData) {
        fetch(this.state.base_url + '/images?benchmark=' + rowData['benchmark'], {
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
            
            let image_categories = []
            Promise.all(promises)
            .then((results) => {
                console.log('all resolved ', results)
                image_categories = results.map(el => String.fromCharCode.apply(null, new Uint8Array(el)))
                this.setState({
                    model_id: rowData['id'],
                    model_name: rowData['name'],
                    image_categories: image_categories, 
                    classes: classes,
                    show_image_categories_page: true, 
                    show_test_page: false,
                    benchmark: rowData['benchmark']
                })
            })
        }).catch(error => console.log(error))
        ).catch(error => console.log(error))
    }

    onModelSelect(e, rowData) {
        this.fetch_class_names(rowData['benchmark']).then(response => response.json().then(data => {
            this.setState({ class_names: data['class_names']})
            console.log('rowData', rowData)
            this.fetch_image_categories(rowData)
        }).catch(error => {console.log('Error', error)})
        ).catch(error => {console.log('Error', error)})
    }

    onImageClassSelect(e, rowData) {
        fetch(this.state.base_url + '/images?benchmark=' + this.state.benchmark + '&class=' + rowData['class_id'],
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
                let ids = []
                arr.forEach((arrbuf) => {
                    promises.push(arrbuf.arrayBuffer())
                    ids.push(arrbuf.name)
                })
                
                let class_images = []
                Promise.all(promises)
                .then((results) => {
                    console.log('all resolved ', results)
                    const get_image_objects = (promises, image_ids) => promises.map((el, i) => ({ "image": String.fromCharCode.apply(null, new Uint8Array(el)), "image_id": image_ids[i]}))
                    class_images = get_image_objects(results, ids)
                    this.setState({
                        chosen_class: rowData['class'],
                        chosen_class_id: rowData['class_id'],
                        class_images: class_images, 
                        show_image_categories_page: false, 
                        show_images_page: true, 
                        show_test_page: false,
                    })
                })
            }).catch(error => console.log(error))
            ).catch(error => console.log(error))
    }

    onImageSelect(e, rowData) {
        fetch(this.state.base_url + '/image?image_id=' + rowData['image_id'], {
            method: 'GET',
        }).then(response => response.formData().then(data => { 
            const values = data.values()
            let result = values.next()
            let original_image = result.value
            original_image.arrayBuffer().then(result => {
                original_image = String.fromCharCode.apply(null, new Uint8Array(result))
                this.setState({
                    original_image: original_image,
                    chosen_image: rowData['image_id'],
                    show_images_page: false,
                    show_attack_page: true,
                })
            }).catch(error => console.log(error))
        }).catch(error => console.log(error))
        ).catch(error => console.log(error))
    }

    getPoisonedImage() {
        let benchmark = ''
        for (let i=0; i < this.state.benchmarks.length; i++) {
            if (this.state.benchmark === this.state.benchmarks[i]['id']) {
                benchmark = this.state.benchmarks[i]['benchmark']
            }
        }
        fetch(this.state.base_url + '/attack',
        {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ...this.state.attack_details,
                pattern: this.state.attack,
                image_id: this.state.chosen_image,
                benchmark: benchmark,
                benchmark_id: this.state.benchmark,
                chosen_class: this.state.chosen_class_id,
                chosen_model: this.state.model_id
            })
        }).then(response => response.formData().then(data => { 
            const values = data.values()
            let result = values.next()
            let poisoned_image = result.value
            let poisoned_label = poisoned_image.name.split('-')[1]
            poisoned_image.arrayBuffer().then(result => {
                poisoned_image = String.fromCharCode.apply(null, new Uint8Array(result))
                result = values.next()
                let original_image = result.value
                let original_label = original_image.name.split('-')[1]
                original_image.arrayBuffer().then(result => {
                    original_image = String.fromCharCode.apply(null, new Uint8Array(result))
                    poisoned_label = this.state.class_names.find(cl => String(cl.class_id) === poisoned_label)['class_label']
                    original_label = this.state.class_names.find(cl => String(cl.class_id) === original_label)['class_label']
                    result = values.next()
                    let obj = JSON.parse(result.value)
                    this.setState({
                        poisoned_label: poisoned_label,
                        original_label: original_label,
                        poisoned_image: poisoned_image,
                        original_image: original_image,
                        statistics: obj['statistics'],
                    })
                }).catch(error => console.log(error))
            }).catch(error => console.log(error))
        }).catch(error => console.log(error))
        ).catch(error => console.log(error))
    }

    render() {
        let page;
        if (this.state.show_register_page) {
            page = <div className="container" 
                    style={{flex:1, alignItems: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', textAlign:'center'}}>
                    <h3>Visualizing Adversarial Attacks</h3>
                    <h4>Test your model's robustness</h4>
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
                    <h4>Test your model's robustness</h4>
                        <UserLogin 
                            onEmailChange={this.onEmailChange}
                            onLogin={this.onLogin}
                            goToRegister={() => this.setState({show_login_page:false, show_register_page:true})}
                        />
                  </div> 
        } else if (this.state.show_options_page) {
            let benchmark = ''
            for (let i=0; i < this.state.benchmarks.length; i++) {
                if (this.state.benchmark === this.state.benchmarks[i]['id']) {
                    benchmark = this.state.benchmarks[i]['benchmark']
                }
            }
            let images_columns = [
              { field: 'class', title: 'Class' },
              { field: 'image', title: 'An Image from this Class' },
            ];
            let img_categories = []
            if (this.state.show_image_categories_page) {
                for (let i = 0; i < this.state.image_categories.length; i++) {
                    let img = <img alt="" src={`data:image/png;base64,${this.state.image_categories[i]}`} width="80px" height="80px"/>
                    let label = this.state.class_names.find(cl => String(cl.class_id) === this.state.classes[i])
                    img_categories.push({"class_id": label['class_id'], "class": label['class_label'], "image": img});
                }
            }
            let class_imgs = []
            if (this.state.show_images_page) {
                for (let i = 0; i < this.state.class_images.length; i++) {
                    let img = <img alt="" src={`data:image/png;base64,${this.state.class_images[i]['image']}`} width="80px" height="80px"/>
                    class_imgs.push({"class": this.state.chosen_class, "image": img, "image_id": this.state.class_images[i]['image_id']});
                }
            }
            let poisoned_label = ''
            let original_label = ''
            page = <div>
                    <NavBar
                    show_upload={this.state.show_upload_page}
                    show_test={this.state.show_test_page}
                    goToUpload={() => this.setState({
                        benchmark: '', 
                        class_images: [], 
                        classes: [], 
                        show_upload_page: true, 
                        show_test_page: false, 
                        show_image_categories_page: false,
                        show_images_page: false
                    })}
                    goToTest={() => this.setState({
                        show_test_page: true, 
                        show_upload_page:false, 
                        show_image_categories_page: false,
                        show_images_page: false
                    })}
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
                            <h5>Select a model to attack</h5>
                            <Table 
                                title={'Your models'}
                                rows={this.state.models}
                                columns={this.state.model_columns}
                                onSelectRow={this.onModelSelect}
                            />
                        </div>
                      </div>
                    </div>
                    <div className="card" style={{'display': this.state.show_image_categories_page ? 'block' : 'none'}}>
                      <div className="card-body">
                        <div className="container" 
                            style={{textAlign:'center'}}>
                            <h3>Visualizing Adversarial Attacks</h3>
                            <h5>Select a category of images to attack</h5>
                            <Table 
                                title={'Your model is trained on ' + benchmark + ' images.'}
                                rows={img_categories}
                                columns={images_columns}
                                onSelectRow={this.onImageClassSelect}
                            />
                        </div>
                      </div>
                    </div>
                    <div className="card" style={{'display': this.state.show_images_page ? 'block' : 'none'}}>
                      <div className="card-body">
                        <div className="container" 
                            style={{textAlign:'center'}}>
                            <h3>Visualizing Adversarial Attacks</h3>
                            <h5>Select an image to attack</h5>
                            <Table 
                                title={this.state.chosen_class + ' images'}
                                rows={class_imgs}
                                columns={images_columns}
                                onSelectRow={this.onImageSelect}
                            />
                        </div>
                      </div>
                    </div>
                    <SelectAttack
                        display={this.state.show_attack_page}
                        attack={this.state.attack}
                        class_names={this.state.class_names}
                        model_name={this.state.model_name}
                        color_alg={this.state.attack_details.color_alg}
                        attack_types={this.state.attack_types}
                        original_image={this.state.original_image}
                        poisoned_image={this.state.poisoned_image}
                        original_label={this.state.original_label}
                        poisoned_label={this.state.poisoned_label}
                        statistics={this.state.statistics}
                        image_height={32}
                        image_width={32}
                        onAttackChange={this.onAttackChange}
                        onColorSettingChange={this.onColorSettingChange}
                        onRedChange={this.onRedChange}
                        onGreenChange={this.onGreenChange}
                        onBlueChange={this.onBlueChange}
                        onHeightChange={this.onHeightChange}
                        onWidthChange={this.onWidthChange}
                        onPositionXChange={this.onPositionXChange}
                        onPositionYChange={this.onPositionYChange}
                        onMagnitudeChange={this.onMagnitudeChange}
                        onInstagramFilterChange={this.onInstagramChange}
                        getPoisonedImage={this.getPoisonedImage}
                    />
                  </div>
        } 
        return page;
    }
}
