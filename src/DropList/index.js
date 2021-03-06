import React, { Component } from 'react';
import './DropList.css'
import { Menu, Dropdown, Icon } from 'antd';
import 'antd/dist/antd.css';

class DropDemension extends Component {
	constructor(props) {
		super(props);

		this.state = {
			currentKey: this.props.current,
		}

		this.onClick = ({ key }) => {
			this.props.setAppKey(key, this.props.pos);
			this.setState({
				currentKey: key,
			})
		};
	}

	render() {
		this.menu = (
			<Menu onClick={this.onClick}>
				{
					this.props.keyName.map((k) => {
						return <Menu.Item key={k} disabled={this.props.another === k ? true : false}>
							{k}
						</Menu.Item>;

					})
				}
			</Menu>
		);

		return (
			<>
				<p className="AxisFont">Select {this.props.pos}-axis Variable </p>
				<Dropdown overlay={this.menu} className="AxisDropDown">
					<a className="ant-dropdown-link" href="#">
						{this.state.currentKey} <Icon type="down" />
					</a>
				</Dropdown>
			</>
		);
	}
}

export default DropDemension;