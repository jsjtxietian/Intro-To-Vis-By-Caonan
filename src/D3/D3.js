import React, { Component } from 'react';
import * as d3 from 'd3';
import data from '../Data/countries_of_world.csv';
import './D3.css'

//todo
//1. do not change state directly 
//2. convert to hooks

const Countries = ["Asia", "Europe", "Africa", "SouthAmerica", "Oceania", "NorthAmerica"];


class D3 extends Component {

	constructor(props) {
		super(props);

		this.state = {
			size: [600, 600],
			color: d3.scaleOrdinal(d3.schemeTableau10),
			x_attr: "Birth Rate",
			y_attr: "Death Rate",
			xBias: 60,
			data: null,
			xScale: null,
			yScale: null,
			color: d3.scaleOrdinal(d3.schemeTableau10)
		};

		this.drawAll = this.drawAll.bind(this);
		this.createSVG = this.createSVG.bind(this);
		this.drawAxes = this.drawAxes.bind(this);
		this.beautify = this.beautify.bind(this);
		this.bindEvents = this.bindEvents.bind(this);
	}


	drawAxes(x, y) {

		let formatPercent = d3.format(".2%");

		let xMax = d3.extent(this.state.data, function (d) {
			return parseFloat(d[x])
		})[1];
		/**specify scale**/
		this.state.xScale = d3.scaleLinear()
			.domain([0, xMax])
			.range([this.state.xBias, this.state.size[0]]);

		let yMax = d3.extent(this.state.data, function (d) {
			return parseFloat(d[y])
		})[1];
		this.state.yScale = d3.scaleLinear()
			.domain([0, yMax])
			.range([this.state.size[1], 30]);

		/**create axis object **/
		var xAxis = d3.axisBottom().scale(this.state.xScale).tickFormat(formatPercent);
		var yAxis = d3.axisLeft().scale(this.state.yScale).tickFormat(formatPercent);

		/**create container for axis */
		let x_container = d3.select("#main_svg")
			.append("g")
			.attr("id", "xaxis")
			.attr("class", "axis")
			.attr("transform", "translate(0," + this.state.size[1] + ")");

		let y_container = d3.select("#main_svg")
			.append("g")
			.attr("id", "yaxis")
			.attr("class", "axis")
			.attr("transform", "translate(60,0)");

		/**Apply axis object to container */
		x_container.call(xAxis)
		y_container.call(yAxis)

		/**Add axis label */
		x_container.append("text")
			.text(x)
			.attr("class", "axistext")
			.attr("x", 580)
			.attr("y", -10);

		y_container.append("text")
			.text(y)
			.attr("transform", "rotate(-90)")
			.attr("class", "axistext")
			.attr("x", -28)
			.attr("y", 18);
	}

	createSVG() {
		d3.select(this.refs.main_div)
			.append("svg")
			.attr("width", "100%")
			.attr("height", "100%")
			.attr("id", "main_svg");
		console.log("fuck");
	};

	drawDataPoints(x, y) {
		/**create container for points */
		let plot = d3.select("#main_svg")
			.append("g")
			.attr("id", "plots");

		/**initiate data binding */
		let plotEnter = plot.selectAll("circle")
			.data(this.state.data, function (d) { return d["Country"] })
			.enter();

		/**Append circle according to data */
		plotEnter.append("circle")
			.attr("cx", (d) => { return this.state.xScale(d[x]) })
			.attr("cy", (d) => { return this.state.yScale(d[y]) })
			.attr("r", 5);
	}

	getRegionIndex = (strRegion) => {
		for (let i = 0; i < Countries.length; i++) {
			if (strRegion.indexOf(Countries[i]) != -1) {
				return i;
			}
		}
		console.log("worong region");
	};

	beautify() {
		/**distinguish data points by color */
		d3.selectAll("circle")
			.style("fill", (d) => { return this.state.color(this.getRegionIndex(d["Region"])) });

		for (let i = 0; i < Countries.length; i++) {
			d3.select("#main_svg")
				.append("text")
				.attr("x", 655)
				.attr("y", 32 + i * 20)
				.text(Countries[i]);

			d3.select("#main_svg")
				.append("rect")
				.attr("x", 630)
				.attr("y", 18 + i * 20)
				.attr("width", 20)
				.attr("height", 15)
				.style("fill", this.state.color(i))
				.attr("id", i)
				.attr("class", "legend");
		}

	}

	bindEvents() {
		/*Display Name on Hover*/
		d3.select("#plots")
			.append("text")
			.attr("id", "country_name");

		d3.selectAll("circle")
			.on("mouseover", (d) => {
				/*move and set name tag */
				d3.select("#country_name")
					.text(d['Country'])
					.attr("x", this.state.xScale(d[this.state.x_attr]))
					.attr("y", this.state.yScale(d[this.state.y_attr]) - 10);
			})
			.on("mouseout", function (d) {
				d3.select("#country_name").text("");
			})
			.on("click", function (d) {
				
				d3.select("#country_name").text("");
				d3.select(this).remove();
			})
	}

	drawAll(d) {
		console.log(this);
		this.setState({
			data: d
		});

		this.createSVG();
		this.drawAxes(this.state.x_attr, this.state.y_attr);
		this.drawDataPoints(this.state.x_attr, this.state.y_attr);
		this.beautify();
		this.bindEvents();
	};

	componentDidMount() {
		d3.csv(data).then((d) => {
			console.log(d);
			this.drawAll(d);
		}).catch(function (error) {
			console.log(error);
		});
	}

	render() {
		console.log("render enter");
		return <div className="main_div" ref="main_div" ></div>
	}
}


export default D3;
