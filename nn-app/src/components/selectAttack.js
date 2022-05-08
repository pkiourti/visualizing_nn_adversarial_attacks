import React from 'react';
import { Button } from 'react-bootstrap';
import { Table } from './'

const SelectAttack = (props) => {
    let attack_types = []
    attack_types.push(<option selected>Select the attack</option>)
    for (let i = 0; i < props.attack_types.length; i++) {
        let option = <option value={props.attack_types[i]['type']}>{props.attack_types[i]['type']}</option>
        attack_types.push(option)
    }
   
    let color_settings = []
    color_settings.push(<option selected>Color Setting</option>)
    color_settings.push(<option value={'random'}>{'random'}</option>)
    color_settings.push(<option value={'channel_assign'}>{'pick your own color'}</option>)

    let red_color = []
    red_color.push(<option selected>Intensity of Red</option>)
    for (let i = 0; i < 256; i++) {
        let option = <option value={i}>{i}</option>
        red_color.push(option)
    }

    let green_color = []
    green_color.push(<option selected>Intensity of Green</option>)
    for (let i = 0; i < 256; i++) {
        let option = <option value={i}>{i}</option>
        green_color.push(option)
    }

    let blue_color = []
    blue_color.push(<option selected>Intensity of Blue</option>)
    for (let i = 0; i < 256; i++) {
        let option = <option value={i}>{i}</option>
        blue_color.push(option)
    }

    let position_x = []
    position_x.push(<option selected>x</option>)
    for (let i = 0; i < props.image_width; i++) {
        let option = <option value={i}>{i}</option>
        position_x.push(option)
    }

    let position_y = []
    position_y.push(<option selected>y</option>)
    for (let i = 0; i < props.image_height; i++) {
        let option = <option value={i}>{i}</option>
        position_y.push(option)
    }

    let noise = []
    noise.push(<option selected>Magnitude</option>)
    let option = <option value={10}>{10}</option>
    noise.push(option)
    option = <option value={20}>{20}</option>
    noise.push(option)
    option = <option value={30}>{30}</option>
    noise.push(option)

    let instagram_filters = []
    instagram_filters.push(<option selected>Select Instagram Filter</option>)
    option = <option value={'Toaster'}>{'Toaster'}</option>
    instagram_filters.push(option)
    option = <option value={'1977'}>{'1977'}</option>
    instagram_filters.push(option)

    let display_patched_fields = false
    let display_instagram_fields = false
    let display_noise_fields = false
    let display_spread_fields = false
    if (props.attack === 'lambda' || props.attack === 'rectangle' || props.attack === 'random rectangle') {
        display_patched_fields = true
        display_instagram_fields = false
        display_noise_fields = false
        display_spread_fields = false
    } else if (props.attack === 'Instagram filter') {
        display_patched_fields = false
        display_instagram_fields = true
        display_noise_fields = false
        display_spread_fields = false
    } else if (props.attack === 'noise') {
        display_patched_fields = false
        display_instagram_fields = false
        display_noise_fields = true
        display_spread_fields = false
    } else if (props.attack === 'spread-out') {
        display_patched_fields = false
        display_instagram_fields = false
        display_noise_fields = false
        display_spread_fields = true
    }

    const imgs = []
    imgs.push(<div style={{display: 'inline-grid'}}>
            <span>Original image</span>
            <img 
                alt="" 
                src={`data:image/png;base64,${props.original_image}`} 
                width="200px" 
                height="200px" 
                style={{padding: "10%"}}
            />
            <span>{props.original_label}</span>
        </div>
    )
    imgs.push(<div style={{ display: props.poisoned_image ? 'inline-grid' : 'none' }}>
            <span>Poisoned image</span>
            <img 
                alt="" 
                src={`data:image/png;base64,${props.poisoned_image}`} 
                width="200px" 
                height="200px" 
                style={{padding: "10%"}}
            />
            <span>{props.poisoned_label}</span>
        </div>
    )

    let table = ''
    if (props.statistics) {
        table = <table className="mytable" style={{display: props.statistics ? 'inline-table' : 'none', padding: "10%"}} >
          <thead>
              <tr> 
                  <th style={{"borderBottom": "2px solid black", "padding": "10px"}}>Predicted Label</th>
                  <th style={{"borderBottom": "2px solid black", "padding": "10px"}}>Percentage of poisoned images</th>
              </tr>
          </thead>
          <tbody>
            {props.statistics.map((row, i) => {
              const label = props.class_names.find(cl => cl.class_id == row['label'])['class_label']
              return (
                <tr> 
                   <td >{label}</td>
                   <td >{row['stat']}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
    }

    return (
        <div className="card" style={{'display': props.display ? 'block' : 'none'}} >
          <div className="card-body">
           <div className="container"
               style={{flex:1, alignItems: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', textAlign:'center'}}>
               <h3>Visualing Adversarial Attacks</h3>
               <h5>Testing the robustness of {props.model_name}</h5>
               <div className="row" style={{padding: "2% 0"}}>
                   <div className="col-md">
                         <div className="form-group">
                           <label className="form-label" htmlFor="attack_type">Select the type of the attack</label>
                           <select className="form-select" aria-label="Select Attack Type" onChange={props.onAttackChange}>
                               {attack_types}
                           </select>
                         </div>
                    </div>
                </div>
                <div className="row" style={{padding: "0.5% 0"}}>
                   <div className="col-md">
                         <div className="form-group" style={{display: props.attack === 'random rectangle' ? 'block' : 'none'}}>
                           <label className="form-label" htmlFor="color_setting">Select Color Setting</label>
                           <select className="form-select" aria-label="Select Color Setting" onChange={props.onColorSettingChange}>
                               {color_settings}
                           </select>
                         </div>
                   </div>
                   <div className="col-md">
                         <div className="form-group" style={{display: display_patched_fields ? 'block' : 'none'}}>
                           <label className="form-label" htmlFor="red_color">Intensity of red</label>
                           <select className="form-select" aria-label="Select Red Channel" onChange={props.onRedChange} disabled={props.attack == 'random rectangle' && props.color_alg !== 'channel_assign'}>
                               {red_color}
                           </select>
                         </div>
                   </div>
                   <div className="col-md">
                         <div className="form-group" style={{display: display_patched_fields ? 'block' : 'none'}}>
                           <label className="form-label" htmlFor="green_color">Intensity of green</label>
                           <select className="form-select" aria-label="Select Green Channel" onChange={props.onGreenChange} disabled={props.attack == 'random rectangle' && props.color_alg !== 'channel_assign'}>
                               {green_color}
                           </select>
                         </div>
                   </div>
                   <div className="col-md">
                         <div className="form-group" style={{display: display_patched_fields ? 'block' : 'none'}}>
                           <label className="form-label" htmlFor="blue_color">Intensity of blue</label>
                           <select className="form-select" aria-label="Select Blue Channel" onChange={props.onBlueChange} disabled={props.attack == 'random rectangle' && props.color_alg !== 'channel_assign'}>
                               {blue_color}
                           </select>
                         </div>
                   </div>
                </div>
                <div className="row" style={{padding: "0.5% 0"}}>
                   <div className="col-md">
                         <div className="form-group" style={{display: display_spread_fields ? 'block' : 'none'}}>
                           <label className="form-label" htmlFor="red_color">Intensity of red</label>
                           <select className="form-select" aria-label="Select Red Channel" onChange={props.onRedChange}>
                               {red_color}
                           </select>
                         </div>
                   </div>
                   <div className="col-md">
                         <div className="form-group" style={{display: display_spread_fields ? 'block' : 'none'}}>
                           <label className="form-label" htmlFor="green_color">Intensity of green</label>
                           <select className="form-select" aria-label="Select Green Channel" onChange={props.onGreenChange}>
                               {green_color}
                           </select>
                         </div>
                   </div>
                   <div className="col-md">
                         <div className="form-group" style={{display: display_spread_fields ? 'block' : 'none'}}>
                           <label className="form-label" htmlFor="blue_color">Intensity of blue</label>
                           <select className="form-select" aria-label="Select Blue Channel" onChange={props.onBlueChange}>
                               {blue_color}
                           </select>
                         </div>
                   </div>
                </div>
                <div className="row" style={{ padding: "0.5% 0"}}>
                   <div className="col-md">
                         <div className="form-group" style={{display: display_patched_fields ? 'block' : 'none'}}>
                           <label className="form-label" htmlFor="name">Height of your pattern</label>
                           <input type="text" name="height" className="form-control" id="name" onChange={props.onHeightChange}/>
                         </div>
                   </div>
                   <div className="col-md">
                         <div className="form-group" style={{display: display_patched_fields ? 'block' : 'none'}}>
                           <label className="form-label" htmlFor="name">Width of your pattern</label>
                           <input type="text" name="width" className="form-control" id="name" onChange={props.onWidthChange}/>
                         </div>
                   </div>
                   <div className="col-md">
                         <div className="form-group" style={{display: display_patched_fields ? 'block' : 'none'}}>
                           <label className="form-label" htmlFor="position_x">x coordinate of the pattern</label>
                           <select className="form-select" aria-label="Select x coordinate where the pattern will be injected" onChange={props.onPositionXChange}>
                               {position_x}
                           </select>
                         </div>
                   </div>
                   <div className="col-md">
                         <div className="form-group" style={{display: display_patched_fields ? 'block' : 'none'}}>
                           <label className="form-label" htmlFor="position_y">y coordinate of the pattern</label>
                           <select className="form-select" aria-label="Select y coordinate where the pattern will be injected" onChange={props.onPositionYChange}>
                               {position_y}
                           </select>
                         </div>
                   </div>
                </div>
                <div className="row" style={{ padding: "0.5% 0"}}>
                   <div className="col-md">
                         <div className="form-group" style={{display: display_spread_fields ? 'block' : 'none'}}>
                           <label className="form-label" htmlFor="name">Height of your pattern</label>
                           <input type="text" name="height" className="form-control" id="name" onChange={props.onHeightChange}/>
                         </div>
                   </div>
                   <div className="col-md">
                         <div className="form-group" style={{display: display_spread_fields ? 'block' : 'none'}}>
                           <label className="form-label" htmlFor="name">Width of your pattern</label>
                           <input type="text" name="width" className="form-control" id="name" onChange={props.onWidthChange}/>
                         </div>
                   </div>
                </div>
                <div className="row" style={{ padding: "0.5% 0"}}>
                   <div className="col-md">
                         <div className="form-group" style={{display: display_instagram_fields ? 'block' : 'none'}}>
                           <label className="form-label" htmlFor="instagram_filters">Instagram Filter</label>
                           <select className="form-select" aria-label="Select y coordinate where the pattern will be injected" onChange={props.onInstagramFilterChange}>
                               {instagram_filters}
                           </select>
                         </div>
                   </div>
                </div>
                <div className="row" style={{ padding: "0.5% 0"}}>
                   <div className="col-md">
                         <div className="form-group" style={{display: display_noise_fields ? 'block' : 'none'}}>
                           <label className="form-label" htmlFor="instagram_filters">Magnitude of noise</label>
                           <select className="form-select" aria-label="Select y coordinate where the pattern will be injected" onChange={props.onMagnitudeChange}>
                               {noise}
                           </select>
                         </div>
                   </div>
                </div>
               <Button type="button" className="btn btn-primary" style={{margin: 50}} onClick={props.getPoisonedImage}>Test</Button>
                <div style={{display: 'inline'}}>
                    {imgs}
                    {table}
                </div>
           </div>
          </div>
        </div>
    )
}

export default SelectAttack;
