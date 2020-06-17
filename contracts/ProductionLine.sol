// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;


contract ProductionLine {

	mapping(uint => Machine) machines;

	struct Machine{
		address id;
		string name;
	}
}