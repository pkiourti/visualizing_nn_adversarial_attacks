import React from 'react';
import { Button } from 'react-bootstrap';

const UploadPage = (props) => {
    let benchmarks = []
    benchmarks.push(<option selected>Select the benchmark dataset</option>)
    for (let i = 0; i < props.benchmarks.length; i++) {
        let option = <option value={props.benchmarks[i]['id']}>{props.benchmarks[i]['benchmark']}</option>
        benchmarks.push(option)
    }
   
    return (
        <div className="card" style={{'display': props.display ? 'block' : 'none'}} >
          <div className="card-body">
           <div className="container"
               style={{flex:1, alignItems: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', textAlign:'center'}}>
               <h3>Visualing Adversarial Attacks</h3>
               <div className="row" style={{padding: "10% 0"}}>
                   <div className="col-md-12">
                       <form>
                         <div className="form-group" style={{margin: 10}}>
                           <label className="form-label" htmlFor="customFile">Upload your file (.pt/.h5)</label>
                           <input type="file" name="file" className="form-control" id="model-file" onChange={props.onFileBrowseChange}/>
                           <small id="emailHelp" className="form-text text-muted">Only Tensorflow 1.13 or PyTorch 1.9 models are accepted</small>
                         </div>
                         <div className="form-group" style={{margin: 10}}>
                           <label className="form-label" htmlFor="name">Give a name to your file</label>
                           <input type="text" name="name" className="form-control" id="name" onChange={props.onFileNameChange}/>
                         </div>
                         <div className="form-group" style={{margin: 10}}>
                           <label className="form-label" htmlFor="name">Model is trained on benchmark</label>
                            <select className="form-select" aria-label="Select benchmark" onChange={props.onBenchmarkChange}>
                                {benchmarks}
                            </select>
                         </div>
                       <Button type="button" className="btn btn-primary" style={{margin: 20}} onClick={props.upload}>Upload</Button>
                       </form>
                   </div>
               </div>
           </div>
          </div>
        </div>
    )
}

export default UploadPage;
