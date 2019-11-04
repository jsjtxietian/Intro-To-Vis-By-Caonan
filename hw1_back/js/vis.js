/**Global Variables **/
let data, xScale, yScale;
let size = [600, 600];
let color = d3.scaleOrdinal(d3.schemeTableau10);
const x_attr = "Birth Rate";
const y_attr = "Death Rate";
const Countries = ["Asia", "Europe", "Africa", "SouthAmerica", "Oceania", "NorthAmerica"];
const xBias = 60;

scatterplot();

function scatterplot() {
    loadData();
}

function loadData() {
    d3.csv("countries_of_world.csv").then(function (d) {
        // console.log(d);
        render(d);
    }).catch(function (error) {
        console.log(error);
    });
}

function render(d) {
    data = d;
    createSVG();
    drawAxes(x_attr, y_attr);
    drawDataPoints(x_attr, y_attr);
    beautify();
    bindEvents();
}

function createSVG() {
    d3.select("#main_div")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("id", "main_svg");
}

function drawAxes(x, y) {

    let formatPercent = d3.format(".2%");

    let xMax = d3.extent(data, function (d) {
        return parseFloat(d[x])
    })[1];
    /**specify scale**/
    xScale = d3.scaleLinear()
        .domain([0, xMax])
        .range([xBias, size[0]]);

    let yMax = d3.extent(data, function (d) {
        return parseFloat(d[y])
    })[1];
    yScale = d3.scaleLinear()
        .domain([0, yMax])
        .range([size[1], 30]);

    /**create axis object **/
    var xAxis = d3.axisBottom().scale(xScale).tickFormat(formatPercent);
    var yAxis = d3.axisLeft().scale(yScale).tickFormat(formatPercent);

    /**create container for axis */
    let x_container = d3.select("#main_svg")
        .append("g")
        .attr("id", "xaxis")
        .attr("class", "axis")
        .attr("transform", "translate(0," + size[1] + ")");

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
        .attr("class","axistext")
        .attr("x", 580)
        .attr("y", -10);

    y_container.append("text")
        .text(y)
        .attr("transform","rotate(-90)")
        .attr("class","axistext")
        .attr("x", -28)
        .attr("y", 18);
}

function drawDataPoints(x, y) {
    /**create container for points */
    let plot = d3.select("#main_svg")
        .append("g")
        .attr("id", "plots");

    /**initiate data binding */
    let plotEnter = plot.selectAll("circle")
        .data(data, function (d) { return d["Country"] })
        .enter();

    /**Append circle according to data */
    plotEnter.append("circle")
        .attr("cx", function (d) { return xScale(d[x]) })
        .attr("cy", function (d) { return yScale(d[y]) })
        .attr("r", 5);
}

function getRegionIndex(strRegion) {
    for (let i = 0; i < Countries.length; i++) {
        if (strRegion.indexOf(Countries[i]) != -1) {
            return i;
        }
    }
    console.log("worong region");
}

function beautify() {
    /**distinguish data points by color */
    d3.selectAll("circle")
        .style("fill", function (d) { return color(getRegionIndex(d["Region"])) });

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
            .style("fill", color(i))
            .attr("id", i)
            .attr("class", "legend");
    }

}

function bindEvents() {
    /*Display Name on Hover*/
    d3.select("#plots")
        .append("text")
        .attr("id", "country_name");

    d3.selectAll("circle")
        .on("mouseover", function (d) {
            /*move and set name tag */
            d3.select("#country_name")
                .text(d['Country'])
                .attr("x", xScale(d[x_attr]))
                .attr("y", yScale(d[y_attr]) - 10);
        })
        .on("mouseout", function (d) {
            d3.select("#country_name").text("");
        })
        .on("click", function (d) {
            // let t = d3.transition().duration(500);
            // which remove
            // d3.select(this).style("opacity", 0);
            d3.select("#country_name").text("");
            d3.select(this).remove();
        })

    /**filter data points when clicking the legends */
    // d3.selectAll(".legend")
    //     .on("mouseover", function (d) {
    //         let am = d3.select(this).attr("id");
    //         filterDataPoints(am);
    //     })
    //     .on("mouseout", function (d) {
    //         let t = d3.transition().duration(500);
    //         d3.selectAll("circle").transition(t).style("opacity", 1);
    //     })
}

// function filterDataPoints(am) {
//     let t = d3.transition().duration(500);
//     d3.selectAll("circle")
//         .transition(t)
//         .style("opacity", function (d) {
//             return d["am"] == am ? 0 : 1;
//         })
// }