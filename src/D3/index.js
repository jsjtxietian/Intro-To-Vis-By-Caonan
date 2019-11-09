import React, { Component } from 'react';
import * as d3 from 'd3';
import './D3.css'

//todo
//1. do not change state directly 
//2. convert to hooks
//3. change tooltip 
//4. axis problem(0-max,min-max)
//5. todo bug axis

//libya db
//uganda inin
//nicara oman dd
//kara      bb
//russia bb
//rawanda cc
//estonia latvia bb

const Countries = ["Asia", "Europe", "Africa", "SouthAmerica", "Oceania", "NorthAmerica"];
const AxisDuration = 500;
const CircleDuration = 1000;
const EnlargeDuration = 300;
const normalOpacity = 0.7;
const zoomRatio = [0.1, 10];

class D3 extends Component {

	constructor(props) {
		super(props);

		this.state = {
			size: [600, 600],
			color: d3.scaleOrdinal(d3.schemeTableau10),
			xBias: 60,
			xScale: null,
			yScale: null,
			isFirst: true,
			zoom : null
		};

		this.drawAll = this.drawAll.bind(this);
		this.createSVG = this.createSVG.bind(this);
		this.drawAxes = this.drawAxes.bind(this);
		this.beautify = this.beautify.bind(this);
		this.bindEvents = this.bindEvents.bind(this);
		this.enableZoom = this.enableZoom.bind(this);
	}

	drawAll(d) {
		this.createSVG();
		this.drawAxes(this.props.x_attr, this.props.y_attr);
		this.enableZoom(this.props.x_attr, this.props.y_attr);
		this.drawDataPoints(this.props.x_attr, this.props.y_attr);
		this.beautify();
		this.bindEvents();
	};

	//axis "x" / "y"
	//type 0(0,max) 1(min,max)
	scaleAxis(axis, type, x, y) {
		let scale = null;

		if (type === 0) {
			let max = d3.extent(this.props.data, function (d) {
				return parseFloat(d[axis === "x" ? x : y])
			})[1];
			scale = d3.scaleLinear()
				.domain([0, max])
				.range(axis === "x" ? [this.state.xBias, this.state.size[0]] : [this.state.size[1], 60]);
		}
		else {
			scale = d3.scaleLinear()
				.domain(d3.extent(this.props.data, function (d) {
					return parseFloat(d[axis === "x" ? x : y])
				}))
				.range(axis === "x" ? [this.state.xBias, this.state.size[0]] : [this.state.size[1], 60]);
		}

		if (axis === "x") {
			this.state.xScale = scale;
		}
		else {
			this.state.yScale = scale;
		}
	}

	drawAxes(x, y) {

		let formatPercent = d3.format(".2%");
		let xAxis = d3.axisBottom().scale(this.state.xScale).tickFormat(formatPercent);
		let yAxis = d3.axisLeft().scale(this.state.yScale).tickFormat(formatPercent);

		if (x === "Birth Rate" || x === "Death Rate") {
			this.scaleAxis("x", 0, x, y);
			xAxis = d3.axisBottom().scale(this.state.xScale).tickFormat(formatPercent);
		}
		else {
			this.scaleAxis("x", 1, x, y);
			xAxis = d3.axisBottom().scale(this.state.xScale);
		}

		if (y === "Birth Rate" || y === "Death Rate") {
			this.scaleAxis("y", 0, x, y);
			yAxis = d3.axisLeft().scale(this.state.yScale).tickFormat(formatPercent);
		}
		else {
			this.scaleAxis("y", 1, x, y);
			yAxis = d3.axisLeft().scale(this.state.yScale);
		}

		/**create container for axis */

		if (this.state.isFirst) {
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
			x_container.call(xAxis);
			y_container.call(yAxis);
			/**Add axis label */
			x_container.append("text")
				.text(x)
				.attr("class", "axistext")
				.attr("id", "xAxisText")
				.attr("x", 580)
				.attr("y", -10);

			y_container.append("text")
				.text(y)
				.attr("transform", "rotate(-90)")
				.attr("class", "axistext")
				.attr("id", "yAxisText")
				.attr("x", -28)
				.attr("y", 18);
		}
		else {
			d3.selectAll("#xaxis").transition().duration(AxisDuration).call(xAxis);
			d3.selectAll("#yaxis").transition().duration(AxisDuration).call(yAxis);

			if (x === "Population")
				x = "Population(*10^4)";
			if (y === "Population")
				y = "Population(*10^4)";

			d3.select("#xAxisText").transition().duration(AxisDuration).text(x);
			d3.select("#yAxisText").transition().duration(AxisDuration).text(y);
		}

	}

	enableZoom(x, y) {
		if (this.state.isFirst) {
			// Add a clipPath: everything out of this area won't be drawn.
			d3.select("#main_svg")
				.append("defs")
				.append("SVG:clipPath")
				.attr("id", "clip")
				.append("SVG:rect")
				.attr("width", this.state.size[0])
				.attr("height", this.state.size[1])
				.attr("x", this.state.xBias)
				.attr("y", 0);

			d3.select("#plots").attr("clip-path", "url(#clip)");

			d3.select("#main_svg").append("rect")
				.attr("width", this.state.size[0])
				.attr("height", this.state.size[1])
				.style("fill", "none")
				.style("pointer-events", "all")
				.attr('transform', 'translate(' + this.state.xBias + ',' + 0 + ')')
				.attr("id", "zoomRect");
		}
		let updateChart = () => {
			// recover the new scale
			let newX = d3.event.transform.rescaleX(this.state.xScale);
			let newY = d3.event.transform.rescaleY(this.state.yScale);
			// update axes with these new boundaries
			d3.select("#xaxis").call(d3.axisBottom().scale(newX));
			d3.select("#yaxis").call(d3.axisLeft().scale(newY));

			// update circle position
			d3.selectAll("circle")
				.attr("cx", (d) => { return newX(d[x]) })
				.attr("cy", (d) => { return newY(d[y]) })
				.attr("r", 5);
		}

		this.state.zoom = d3.zoom()
			.scaleExtent(zoomRatio)  // This control how much you can unzoom (x0.5) and zoom (x20)
			.extent([[this.state.xBias, 0], this.state.size])
			.on("zoom", updateChart);


		d3.select("#zoomRect").call(this.state.zoom);
	}

	drawDataPoints(x, y) {

		if (this.state.isFirst) {
			/**create container for points */
			let plot = d3.select("#main_svg")
				.append("g")
				.attr("id", "plots")
				.attr("clip-path", "url(#clip)");

			/**initiate data binding */
			let plotEnter = plot.selectAll("circle")
				.data(this.props.data, function (d) { return d["Country"] })
				.enter();

			/**Append circle according to data */
			plotEnter.append("circle")
				.attr("cx", (d) => { return this.state.xScale(d[x]) })
				.attr("cy", (d) => { return this.state.yScale(d[y]) })
				.attr("r", 5);
		}
		else {
			d3.selectAll("circle")
				.transition()
				.duration(CircleDuration)
				.ease(d3.easeElastic)
				.delay(AxisDuration)
				.attr("cx", (d) => this.state.xScale(d[x]))
				.attr("cy", (d) => this.state.yScale(d[y]));
		}
	}

	getRegionIndex = (strRegion) => {
		for (let i = 0; i < Countries.length; i++) {
			if (strRegion.indexOf(Countries[i]) !== -1) {
				return i;
			}
		}
		console.log("wrong region");
	};

	beautify() {

		if (this.state.isFirst) {
			/**distinguish data points by color */
			d3.selectAll("circle")
				.style("fill", (d) => { return this.state.color(this.getRegionIndex(d["Region"])) })
				.style("opacity", normalOpacity);

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
					.style("opacity", normalOpacity)
					.attr("id", i)
					.attr("class", "legend");
			}
		}

	}

	bindEvents() {
		if (this.state.isFirst) {
			/*Display Name on Hover*/
			d3.select("#plots")
				.append("text")
				.attr("id", "country_name");

		}
		let x = this.props.x_attr;
		let y = this.props.y_attr;
		let xScale = this.state.xScale;
		let yScale = this.state.yScale;

		d3.selectAll("circle")
			.on("mouseover", function (d) {
				d3.select("#country_name")
					.text(d['Country'])
					.attr("x", xScale(d[x]))
					.attr("y", yScale(d[y]) - 10);
				d3.select(this).transition()
					.ease(d3.easeElastic)
					.duration(EnlargeDuration)
					.attr("r", 10)
					.style("opacity", 1);
			})
			.on("mouseout", function (d) {
				d3.select("#country_name").text("");

				d3.select(this).transition()
					.ease(d3.easeElastic)
					.duration(EnlargeDuration)
					.attr("r", 5)
					.style("opacity", normalOpacity);
			})
			.on("click", function (d) {
				d3.select("#country_name").text("");
				d3.select(this).remove();
			})

	}

	createSVG() {
		if (this.state.isFirst) {
			d3.select(this.refs.main_div)
				.append("svg")
				.attr("width", "100%")
				.attr("height", "100%")
				.attr("id", "main_svg");
		}
	};

	componentDidMount() {
		this.drawAll(this.props.data);
		this.state.isFirst = false;
	}

	componentDidUpdate(prevProps, prevState) {
		this.state.zoom.transform(d3.select("#zoomRect"), d3.zoomIdentity);
		this.drawAll(this.props.data);
	}


	render() {
		return <div className="main_div" ref="main_div" ></div>
	}
}


export default D3;
