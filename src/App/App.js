import React, { Component } from 'react';
import DropDemension from '../DropList/'
import D3 from '../D3'
import './App.css'
import 'antd/dist/antd.css';
import * as d3 from 'd3';
import data from '../Data/countries_of_world.csv'


class App extends Component {

	constructor(props) {
		super(props);

		this.state = {
			data: null,
			keyName: null,
			dataLoaded: false,
			leftKey :"Birth Rate",
			rightKey : "Death Rate",
		};

		this.cleanData = this.cleanData.bind(this);
		this.changeKey = this.changeKey.bind(this);

		d3.csv(data).then((d) => {
			this.cleanData(d);

		}).catch(function (error) {
			console.log(error);
		});
	}

	changeKey(key,pos){
		if(pos === "X"){
			this.setState({
				leftKey:key
			})
		}
		else{
			this.setState({
				rightKey:key
			})
		}
	}

	cleanData(rawData) {
		let keyName = []

		rawData.map((s) => {
			for (var key in s) {
				s[key] = s[key].trim();
			}
		});

		for (var key in rawData[0]) {
			keyName.push(key);
		}

		keyName.splice(0, 2);
		
		//population / 10000
		rawData.map((s) => {
			for (var key in s) {
				if(key === "Population"){
					s[key] = parseInt(s[key])/10000 + "";
				}
			}
		});

		this.setState({
			data: rawData,
			keyName: keyName,
			dataLoaded: true
		});
	}

	render() {

		if (this.state.dataLoaded) {
			return (<>
				<p className="title">
					This is the scatterpot of <strong>{this.state.leftKey}</strong> and <strong>{this.state.rightKey} </strong>
				</p>
				<D3 x_attr={this.state.leftKey} keyName={this.state.keyName} y_attr={this.state.rightKey} data={this.state.data}>
				</D3>
				<div className="Axis">
				<DropDemension keyName={this.state.keyName} another={this.state.rightKey} current={this.state.leftKey} pos="X" setAppKey={this.changeKey}/>
				<DropDemension keyName={this.state.keyName} another={this.state.leftKey} current={this.state.rightKey} pos="Y"setAppKey={this.changeKey} />
				</div>
			</>
			);
		}
		else {
			return (
				<></>
			);
		}
	}
}


export default App;
