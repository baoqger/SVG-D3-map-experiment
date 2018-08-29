import React, { Component } from "react"
import { geoMercator, geoPath } from "d3-geo"
import { feature } from "topojson-client"
import worlddata from './world-110m.json';
import './WorldMap.css';
import { List } from 'antd';

class WorldMap extends Component {
  constructor() {
    super()
    this.state = {
      worlddata: [],
      selectedCity: '',
      cities: [
        { name: "Tokyo",          coordinates: [139.6917,35.6895],  population: 37843000 },
        { name: "Jakarta",        coordinates: [106.8650,-6.1751],  population: 30539000 },
        { name: "Delhi",          coordinates: [77.1025,28.7041],   population: 24998000 },
        { name: "Manila",         coordinates: [120.9842,14.5995],  population: 24123000 },
        { name: "Seoul",          coordinates: [126.9780,37.5665],  population: 23480000 },
        { name: "Shanghai",       coordinates: [121.4737,31.2304],  population: 23416000 },
        { name: "Karachi",        coordinates: [67.0099,24.8615],   population: 22123000 },
        { name: "Beijing",        coordinates: [116.4074,39.9042],  population: 21009000 },
        { name: "New York",       coordinates: [-74.0059,40.7128],  population: 20630000 },
        { name: "Guangzhou",      coordinates: [113.2644,23.1291],  population: 20597000 },
        { name: "Sao Paulo",      coordinates: [-46.6333,-23.5505], population: 20365000 },
        { name: "Mexico City",    coordinates: [-99.1332,19.4326],  population: 20063000 },
        { name: "Mumbai",         coordinates: [72.8777,19.0760],   population: 17712000 },
        { name: "Osaka",          coordinates: [135.5022,34.6937],  population: 17444000 },
        { name: "Moscow",         coordinates: [37.6173,55.7558],   population: 16170000 },
        { name: "Dhaka",          coordinates: [90.4125,23.8103],   population: 15669000 },
        { name: "Greater Cairo",  coordinates: [31.2357,30.0444],   population: 15600000 },
        { name: "Los Angeles",    coordinates: [-118.2437,34.0522], population: 15058000 },
        { name: "Bangkok",        coordinates: [100.5018,13.7563],  population: 14998000 },
        { name: "Kolkata",        coordinates: [88.3639,22.5726],   population: 14667000 },
        { name: "Buenos Aires",   coordinates: [-58.3816,-34.6037], population: 14122000 },
        { name: "Tehran",         coordinates: [51.3890,35.6892],   population: 13532000 },
        { name: "Istanbul",       coordinates: [28.9784,41.0082],   population: 13287000 },
        { name: "Lagos",          coordinates: [3.3792,6.5244],     population: 13123000 },
        { name: "Shenzhen",       coordinates: [114.0579,22.5431],  population: 12084000 },
        { name: "Rio de Janeiro", coordinates: [-43.1729,-22.9068], population: 11727000 },
        { name: "Kinshasa",       coordinates: [15.2663,-4.4419],   population: 11587000 },
        { name: "Tianjin",        coordinates: [117.3616,39.3434],  population: 10920000 },
        { name: "Paris",          coordinates: [2.3522,48.8566],    population: 10858000 },
        { name: "Lima",           coordinates: [-77.0428,-12.0464], population: 10750000 },
      ],
      arcs: [],
    }

    this.handleCountryClick = this.handleCountryClick.bind(this)
    this.handleMarkerClick = this.handleMarkerClick.bind(this)
    this.handleItemClick = this.handleItemClick.bind(this);
  }
  projection() {
    return geoMercator()
      .scale(100)
      .translate([ 800 / 2, 450 / 2 ])
  }
  handleCountryClick(countryIndex) {
    console.log("Clicked on country: ", this.state.worlddata[countryIndex])
  }
  handleMarkerClick(i) {
    console.log("Marker: ", this.state.cities[i])
  }
  componentDidMount() {
    this.setState({
      worlddata: feature(worlddata, worlddata.objects.countries).features,
    }, () => {
      console.log('111', this.state.worlddata);
    })
  }
  handleItemClick(name,index) {
    console.log(333,name,index);
    const sourceCity = this.state.cities[index]['coordinates'];
    const arcList = [];
    this.state.cities.forEach((each) => {
      if (each.name === name) {
        return;
      } else {
        const targetCity = each.coordinates;
        const sourceXY = this.projection()(sourceCity);
        const targetXY = this.projection()(targetCity);
        const sourceX = sourceXY[0],
              sourceY = sourceXY[1];
        const targetX = targetXY[0],
              targetY = targetXY[1];
        const dx = targetX - sourceX,
              dy = targetY - sourceY,
              dr = Math.sqrt(dx*dx + dy*dy);
        const west_of_source = (targetX - sourceX) < 0;
        let arc;
        if (west_of_source) {
          arc = "M" + targetX + "," + targetY + " A" + dr + "," + dr + " 0 0,1 " + sourceX + "," + sourceY;
        } else {
          arc = "M" + sourceX + "," + sourceY + " A" + dr + "," + dr + " 0 0,1 " + targetX + "," + targetY;
        }
        arcList.push(arc);
      }
    });
    console.log(arcList);
    this.setState({
      selectedCity: name,
      arcs: arcList,
    });
  }
  renderList() {
    const cities = this.state.cities;
    return (
      <div className="map-list">
        <List
          size="small"
          bordered
          dataSource={cities}
          renderItem={(item, index) => (
            <List.Item onClick= {() => this.handleItemClick(item.name, index)}>{item.name}</List.Item>
          )}
        />
      </div>
    );
  }
  getFillColor(city) {
    return city.name === this.state.selectedCity ? '#66ff66' : 'aqua';
  }
  render() {
    return (
      <div className="map-container">
        {this.renderList()}
        <svg width={ 800 } height={ 450 } viewBox="0 0 800 450">
          <g className="countries">
            {
              this.state.worlddata.map((d,i) => (
                <path
                  key={ `path-${ i }` }
                  d={ geoPath().projection(this.projection())(d) }
                  className="country"
                  fill={ `rgba(38,50,56,${ 1 / this.state.worlddata.length * i})` }
                  stroke="#FFFFFF"
                  strokeWidth={ 0.5 }
                  onClick={ () => this.handleCountryClick(i) }
                />
              ))
            }
          </g>
          <g className="markers">
            {
              this.state.cities.map((city, i) => (
                <g key={ `marker-group-${i}` }>
                  <circle
                    key={ `marker-radar-${i}` }
                    cx={ this.projection()(city.coordinates)[0] }
                    cy={ this.projection()(city.coordinates)[1] }
                    r={ 2 * city.population / 3000000 }
                    fill={this.getFillColor(city)}
                    stroke="#FFFFFF"
                    className="marker-radar"
                    opacity="0.3"
                    >
                    <animate attributeName="r" begin="0s" dur="3s" repeatCount="indefinite" from="0" to={ 2 * city.population / 3000000 }/>
                  </circle>

                  <circle
                    key={ `marker-${i}` }
                    cx={ this.projection()(city.coordinates)[0] }
                    cy={ this.projection()(city.coordinates)[1] }
                    r={ city.population / 3000000 }
                    fill={ this.getFillColor(city) }
                    stroke="#FFFFFF"
                    className="marker"
                    opacity="0.8"
                    onClick={ () => this.handleMarkerClick(i) }
                    >
                    </circle>
                  </g>
              ))
            }
          </g>
          <g className="arcs">
            {
              this.state.arcs.map((d,i) => (
                <path
                  key={ `arc-${ i }` }
                  d={ d }
                  className="arc"
                  stroke="#00ffff"
                  fill="none"
                  strokeWidth={ 1 }
                />
              ))
            }
          </g>
        </svg>
      </div>
    )
  }
}

export default WorldMap
