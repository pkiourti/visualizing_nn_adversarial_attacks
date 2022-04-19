import React, { Component } from 'react';
import { Button } from 'react-bootstrap';

export default class NNApp extends Component {
    constructor(props) {
        super(props)

        this.onFileBrowseChange = this.onFileBrowseChange.bind(this)
        this.onNameChange = this.onNameChange.bind(this)
        this.upload = this.upload.bind(this)

        this.state = {
            base_url: 'https://a4bb-24-63-24-208.ngrok.io',
            show_upload_page: true,
            file: '',
        }
    }

    onFileBrowseChange(event) {
        console.log('hello', event.target.files[0])
        this.setState({ file: event.target.files[0]})
    }

    onNameChange(name) {
        this.setState({ name: name})
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
			.then((response) => response.json())
			.then((result) => {
				console.log('Success:', result);
			})
			.catch((error) => {
				console.error('Error:', error);
			});
    }

    render() {
        return (
            <div className="container" style={{flex:1, alignItems: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', textAlign:'center'}}>
                <h3>Visualing Adversarial Attacks</h3>
                <div className="row" style={{padding: "10% 0"}}>
                    <div className="col-md-12">
                        <form>
                          <div className="form-group" style={{margin: 10}}>
                            <label className="form-label" htmlFor="customFile">Upload your file (.pt/.h5)</label>
                            <input type="file" name="file" className="form-control" id="model-file" onChange={this.onFileBrowseChange}/>
                            <small id="emailHelp" class="form-text text-muted">Only Tensorflow 1.13 or PyTorch 1.9 models are accepted</small>
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
        );
    }
}
