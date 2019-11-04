import React, { Component } from 'react';
import DropDemension from '../DropDemension/'
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

		d3.csv(data).then((d) => {
			this.cleanData(d);

		}).catch(function (error) {
			console.log(error);
		});
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

		this.setState({
			data: rawData,
			keyName: keyName,
			dataLoaded: true
		});
	}

	render() {

		if (this.state.dataLoaded) {
			return (<>
				<D3 />
				<div className="Axis">
				<DropDemension keyName={this.state.keyName} current={this.state.leftKey} pos="X"/>
				<DropDemension keyName={this.state.keyName} current={this.state.rightKey} pos="Y"/>
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
